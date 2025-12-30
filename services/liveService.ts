import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { decodeAudioData, float32ToPCM16 } from "./utils";

export class LiveService {
  private ai: GoogleGenAI;
  private session: any; // Type is complex, keeping any for simplicity in this file
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("No API Key");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(onMessage: (text: string) => void) {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Resume contexts if suspended
    if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
    if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are Medicinal AI Voice Assistant. Helpful, calm, and knowledgeable about health.',
        inputAudioTranscription: {}, // Enable user transcription
        outputAudioTranscription: {}, // Enable model transcription
      },
    };

    const sessionPromise = this.ai.live.connect({
        ...config,
        callbacks: {
            onopen: () => {
                console.log("Live Session Open");
                this.startAudioInputStream(sessionPromise);
            },
            onmessage: async (msg: LiveServerMessage) => {
                // Handle Audio
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData && this.outputAudioContext) {
                    await this.playAudio(audioData);
                }

                // Handle Transcription
                if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
                     // Sometimes text comes directly
                     onMessage("Model: " + msg.serverContent.modelTurn.parts[0].text);
                }
                
                // Handle Transcriptions
                if (msg.serverContent?.outputTranscription?.text) {
                     onMessage("Medicinal AI: " + msg.serverContent.outputTranscription.text);
                }
                if (msg.serverContent?.inputTranscription?.text) {
                     onMessage("You: " + msg.serverContent.inputTranscription.text);
                }
            },
            onclose: () => console.log("Live Session Closed"),
            onerror: (e) => console.error("Live Session Error", e),
        }
    });
    
    this.session = await sessionPromise;
  }

  private startAudioInputStream(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = float32ToPCM16(inputData);
        // Base64 encode raw PCM
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const b64Data = btoa(binary);

        sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: b64Data
                }
            });
        });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async playAudio(base64Data: string) {
      if (!this.outputAudioContext) return;
      
      // Decode helper
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await decodeAudioData(bytes, this.outputAudioContext, 24000);
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination); // Simple routing to destination, node graph can be complex
      
      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
          this.nextStartTime = currentTime;
      }
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
      source.onended = () => {
          this.sources.delete(source);
      };
      this.sources.add(source);
  }

  disconnect() {
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    // No direct close method exposed on the session object in some versions, but disconnecting stream helps.
    // If session has close: this.session.close();
  }
}

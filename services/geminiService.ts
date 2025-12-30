import { GoogleGenAI, Type, Schema, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { MEDICINE_ANALYSIS_PROMPT, DOCTOR_SYSTEM_INSTRUCTION, MAPS_SYSTEM_INSTRUCTION } from "../constants";

let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key missing");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// --- Medicine Analysis (Vision) ---
export const analyzeMedicineImage = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: MEDICINE_ANALYSIS_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            genericName: { type: Type.STRING },
            dosage: { type: Type.STRING },
            uses: { type: Type.ARRAY, items: { type: Type.STRING } },
            sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            manufacturer: { type: Type.STRING },
          }
        },
        safetySettings: [
           { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- Enhance Image (Nano Banana Simulation using Flash Image) ---
export const enhanceImage = async (base64Data: string, mimeType: string, prompt: string = "Enhance readability and sharpness of this medicine label. Remove blur.") => {
  const ai = getAI();
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        },
     });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Enhance failed:", e);
    return null;
  }
}

// --- Chat (Personal Doctor) ---
export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: DOCTOR_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 1024 }
    },
    history: history,
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

// --- Hospital Finder (Maps Grounding) ---
export const findHospitals = async (latitude: number, longitude: number, query: string = "Best hospitals and clinics near me open now") => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude, longitude }
          }
        },
        systemInstruction: MAPS_SYSTEM_INSTRUCTION
      }
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const mapPlaces = groundingChunks?.map((chunk: any) => chunk.maps).filter(Boolean) || [];

    return {
      text: response.text,
      places: mapPlaces
    };

  } catch (error) {
    console.error("Map search failed:", error);
    throw error;
  }
};

// --- Safety Alerts (Search Grounding) ---
export const checkSafetyUpdates = async (medicineName: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Latest safety warnings, recalls, and FDA updates for ${medicineName}. Summarize briefly.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((c: any) => c.web).filter(Boolean) || [];

    return {
      text: response.text,
      sources: sources
    };
  } catch (error) {
    console.error("Safety check failed:", error);
    throw error;
  }
};

// --- Veo Video Generation ---
export const generateVideo = async (prompt: string, imageBase64?: string, mimeType?: string) => {
    const ai = getAI();
    
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await window.aistudio.openSelectKey();
        }
    }
    
    try {
        let videoOperation;
        const config = {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        };

        if (imageBase64 && mimeType) {
            videoOperation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt || "Animate this medicine",
                image: {
                    imageBytes: imageBase64,
                    mimeType: mimeType
                },
                config
            });
        } else {
             videoOperation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config
            });
        }

        while (!videoOperation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            videoOperation = await ai.operations.getVideosOperation({ operation: videoOperation });
        }

        const uri = videoOperation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
            return `${uri}&key=${process.env.API_KEY}`;
        }
        return null;

    } catch (error) {
        console.error("Veo generation failed", error);
        throw error;
    }
}

// --- Interaction Matrix Check ---
export const analyzeInteractions = async (med1: string, med2: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze potential interactions between ${med1} and ${med2}. 
    Return a short JSON with: 
    { "severity": "High" | "Moderate" | "Low" | "None", "description": "short explanation", "recommendation": "advice" }`,
    config: { responseMimeType: "application/json" }
  });
  return response.text ? JSON.parse(response.text) : null;
};

// --- Symptom Hologram Analysis ---
export const analyzeSymptoms = async (symptoms: string[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Patient reports: ${symptoms.join(", ")}. Provide 3 potential causes and urgency level. JSON format: { "conditions": [{"name": "", "probability": ""}], "urgency": "High/Low", "advice": "" }`,
    config: { responseMimeType: "application/json" }
  });
  return response.text ? JSON.parse(response.text) : null;
};

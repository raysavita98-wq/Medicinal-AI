import React, { useState } from 'react';
import { Video, Film, Sparkles, AlertCircle } from 'lucide-react';
import { generateVideo } from '../services/geminiService';
import { fileToGenerativePart } from '../services/utils';

const VeoView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
             const part = await fileToGenerativePart(e.target.files[0]);
             setImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
             setMimeType(part.inlineData.mimeType);
        }
    }

    const handleGenerate = async () => {
        if(!prompt && !image) return;
        setLoading(true);
        setStatus('Initializing Veo Engine...');
        try {
            const rawBase64 = image ? image.split(',')[1] : undefined;
            setStatus('Generating Video (this may take a minute)...');
            const url = await generateVideo(prompt, rawBase64, mimeType || undefined);
            if(url) setVideoUrl(url);
            else setStatus("Generation returned no URL.");
        } catch(e) {
            console.error(e);
            setStatus("Failed to generate video. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-pink-500">Veo Video Studio</h2>
                <p className="text-textMuted text-sm">Generate medical animations or explainer videos</p>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4">
                <div>
                    <label className="text-sm font-bold text-textMuted block mb-2">Prompt</label>
                    <textarea 
                       className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none h-24"
                       placeholder="Describe the video (e.g., A rotating 3D hologram of a DNA helix)"
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
                
                <div>
                     <label className="text-sm font-bold text-textMuted block mb-2">Reference Image (Optional)</label>
                     <input type="file" onChange={handleFile} accept="image/*" className="block w-full text-sm text-textMuted
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-accent/20 file:text-accent
                        hover:file:bg-accent/30
                     "/>
                </div>

                <button 
                   onClick={handleGenerate}
                   disabled={loading}
                   className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent/80 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(189,0,255,0.4)]"
                >
                    {loading ? <Sparkles className="animate-spin" /> : <Film />}
                    {loading ? 'Generating...' : 'Generate Video'}
                </button>

                {status && <p className="text-center text-sm text-textMuted animate-pulse">{status}</p>}
            </div>

            {videoUrl && (
                <div className="glass-panel p-2 rounded-xl border border-accent/30">
                    <video controls src={videoUrl} className="w-full rounded-lg" autoPlay loop></video>
                </div>
            )}
        </div>
    );
}

export default VeoView;

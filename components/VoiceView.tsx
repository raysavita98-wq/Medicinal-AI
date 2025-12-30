import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { LiveService } from '../services/liveService';

const VoiceView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const liveService = useRef<LiveService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    liveService.current = new LiveService();
    return () => {
      liveService.current?.disconnect();
    };
  }, []);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleConnection = async () => {
    if (isConnected) {
      liveService.current?.disconnect();
      setIsConnected(false);
    } else {
      try {
        await liveService.current?.connect((text) => {
           setMessages(prev => [...prev, text]);
        });
        setIsConnected(true);
      } catch (e) {
        console.error("Connection failed", e);
        alert("Failed to connect to Live Service. Check API Key.");
      }
    }
  };

  return (
    <div className="h-full flex flex-col justify-between items-center pb-24 pt-10">
       <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
             Voice Intelligence
          </h2>
          <p className="text-textMuted">Gemini Live Audio - Hands Free</p>
       </div>

       {/* Visualization / Avatar */}
       <div className="relative w-48 h-48 flex items-center justify-center">
          {isConnected && (
             <>
               <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
               <div className="absolute inset-4 bg-secondary/20 rounded-full animate-pulse opacity-75"></div>
             </>
          )}
          <div className={`z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-gradient-to-tr from-primary to-accent shadow-[0_0_30px_rgba(0,240,255,0.5)]' : 'bg-surfaceHighlight border border-white/10'}`}>
              <Mic className={`w-12 h-12 ${isConnected ? 'text-black' : 'text-textMuted'}`} />
          </div>
       </div>

       {/* Transcript Area */}
       <div className="w-full max-h-48 overflow-y-auto glass-panel rounded-xl p-4 text-sm space-y-2 mb-8">
           {messages.length === 0 && <p className="text-center text-textMuted italic">Conversation will appear here...</p>}
           {messages.map((msg, i) => (
               <div key={i} className={`p-2 rounded ${msg.startsWith("You:") ? 'bg-white/5 text-right' : 'bg-primary/5 text-left text-primary'}`}>
                   {msg}
               </div>
           ))}
           <div ref={chatEndRef} />
       </div>

       <button
         onClick={toggleConnection}
         className={`w-full max-w-xs py-4 rounded-full font-bold text-lg tracking-widest transition-all ${
             isConnected 
             ? 'bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30'
             : 'bg-primary/20 text-primary border border-primary hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
         }`}
       >
         {isConnected ? 'END SESSION' : 'START TALKING'}
       </button>
    </div>
  );
};

export default VoiceView;

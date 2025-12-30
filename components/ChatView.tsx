import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/geminiService';
import { Message } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello, I am your Medicinal AI Personal Doctor. How can I assist you with your health or medicines today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      const responseText = await sendChatMessage(history, userMsg.content);
      
      const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          content: responseText || "I apologize, I could not process that.", 
          timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "Network error. Please try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
       <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/20' : 'bg-gradient-to-br from-primary to-accent'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-black" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-white/10 text-white rounded-tr-none' 
                    : 'glass-panel border-primary/20 rounded-tl-none text-gray-200'
                }`}>
                    <ReactMarkdown className="prose prose-invert prose-sm">
                        {msg.content}
                    </ReactMarkdown>
                </div>
             </div>
          ))}
          {loading && (
             <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles size={16} className="text-black animate-spin" />
                 </div>
                 <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></span>
                 </div>
             </div>
          )}
          <div ref={bottomRef} />
       </div>

       {/* Input Area */}
       <div className="mt-4 relative">
          <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Ask about symptoms, medicines..."
             className="w-full bg-surfaceHighlight border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <button 
             onClick={handleSend}
             disabled={loading}
             className="absolute right-2 top-2 p-2 bg-primary rounded-full text-black hover:scale-105 transition-transform disabled:opacity-50"
          >
             <Send size={20} />
          </button>
       </div>
    </div>
  );
};

export default ChatView;

import React, { useState } from 'react';
import Layout from './components/Layout';
import { View } from './types';
import ScanView from './components/ScanView';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
import MapsView from './components/MapsView';
import VeoView from './components/VeoView';
import { Activity, ShieldCheck, Heart, Zap, Thermometer, ArrowRight, ShieldAlert, Clock, LayoutDashboard, Brain, AlertOctagon } from 'lucide-react';
import { analyzeInteractions, analyzeSymptoms } from './services/geminiService';
import { Logo } from './components/Logo';

// --- FEATURE 1: Interaction Matrix ---
const InteractionView = () => {
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if(!med1 || !med2) return;
    setLoading(true);
    try {
      const data = await analyzeInteractions(med1, med2);
      setResult(data);
    } catch(e) { console.error(e) } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-danger to-orange-500">Interaction Matrix</h2>
       <div className="glass-panel p-6 rounded-2xl space-y-4">
          <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-danger transition-colors" placeholder="First Medicine (e.g. Aspirin)" value={med1} onChange={e => setMed1(e.target.value)} />
          <input className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-danger transition-colors" placeholder="Second Medicine (e.g. Warfarin)" value={med2} onChange={e => setMed2(e.target.value)} />
          <button onClick={check} disabled={loading} className="w-full py-4 bg-danger text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,42,109,0.4)] hover:bg-danger/80 transition-all flex justify-center gap-2">
             {loading ? <Activity className="animate-spin" /> : <ShieldAlert />} Check Interactions
          </button>
       </div>
       {result && (
         <div className={`p-6 rounded-2xl border ${result.severity === 'High' ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
            <h3 className="text-xl font-bold text-white mb-2">{result.severity} Risk</h3>
            <p className="text-textMuted mb-2">{result.description}</p>
            <p className="text-white font-semibold">{result.recommendation}</p>
         </div>
       )}
    </div>
  )
}

// --- FEATURE 2: Symptom Hologram ---
const SymptomView = () => {
  const [activeParts, setActiveParts] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const parts = ["Headache", "Fever", "Nausea", "Chest Pain", "Dizziness", "Rash"];

  const toggle = (p: string) => setActiveParts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  
  const analyze = async () => {
     if(activeParts.length === 0) return;
     const res = await analyzeSymptoms(activeParts);
     setAnalysis(res);
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Symptom Hologram</h2>
       <div className="grid grid-cols-2 gap-3">
          {parts.map(p => (
            <button key={p} onClick={() => toggle(p)} className={`p-4 rounded-xl border transition-all ${activeParts.includes(p) ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-white/5 border-white/10 text-textMuted'}`}>
               {p}
            </button>
          ))}
       </div>
       <button onClick={analyze} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
          Run Bio-Scan
       </button>
       {analysis && (
          <div className="glass-panel p-6 rounded-2xl animate-slide-up">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">Analysis Complete</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${analysis.urgency === 'High' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>{analysis.urgency} Urgency</span>
             </div>
             <ul className="space-y-2 mb-4">
                {analysis.conditions?.map((c: any, i: number) => (
                   <li key={i} className="flex justify-between text-sm">
                      <span className="text-white">{c.name}</span>
                      <span className="text-primary">{c.probability}</span>
                   </li>
                ))}
             </ul>
             <p className="text-sm text-textMuted italic">{analysis.advice}</p>
          </div>
       )}
    </div>
  )
}

// --- FEATURE 3: Bio-Rhythm SOS ---
const SOSView = () => (
   <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 text-center">
      <div className="relative">
         <div className="absolute inset-0 bg-danger/20 rounded-full animate-ping"></div>
         <button className="relative w-48 h-48 rounded-full bg-gradient-to-br from-danger to-red-600 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,42,109,0.5)] hover:scale-105 transition-transform">
            <AlertOctagon size={48} className="text-white mb-2" />
            <span className="text-2xl font-black text-white tracking-widest">SOS</span>
         </button>
      </div>
      <div className="glass-panel p-4 rounded-xl max-w-xs w-full">
         <h3 className="text-white font-bold mb-2">Emergency Protocol</h3>
         <p className="text-xs text-textMuted">Broadcasting location to trusted contacts & finding nearest ER.</p>
         <div className="mt-4 flex gap-2">
            <div className="h-1 bg-danger w-full rounded animate-pulse" />
            <div className="h-1 bg-danger w-2/3 rounded animate-pulse delay-75" />
            <div className="h-1 bg-danger w-1/3 rounded animate-pulse delay-150" />
         </div>
      </div>
   </div>
)

// --- FEATURE 4: Dose Scheduler ---
const ReminderView = () => (
   <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-white">Dose Scheduler</h2>
         <button className="p-2 bg-primary/10 rounded-full text-primary"><Clock size={20}/></button>
      </div>
      <div className="space-y-4">
         {[
            { time: "08:00 AM", med: "Vitamin D3", status: "Taken", color: "bg-green-500" },
            { time: "01:00 PM", med: "Amoxicillin", status: "Due Soon", color: "bg-yellow-500" },
            { time: "08:00 PM", med: "Magnesium", status: "Upcoming", color: "bg-gray-700" },
         ].map((item, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
               <div className={`w-1 h-12 rounded-full ${item.color}`} />
               <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{item.time}</h3>
                  <p className="text-textMuted text-sm">{item.med}</p>
               </div>
               <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">{item.status}</span>
            </div>
         ))}
      </div>
   </div>
)

// --- FEATURE 5: Neuro-Sync Dashboard ---
const DashboardView = () => (
    <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
           <div className="flex justify-between items-start mb-4">
               <div>
                  <h2 className="text-3xl font-bold text-white">94<span className="text-sm text-primary font-normal">/100</span></h2>
                  <p className="text-sm text-textMuted">Health Score</p>
               </div>
               <Logo size={40} />
           </div>
           <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent w-[94%]" />
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="glass-panel p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-secondary">12</span>
              <p className="text-xs text-textMuted uppercase mt-1">Scans This Month</p>
           </div>
           <div className="glass-panel p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-accent">3</span>
              <p className="text-xs text-textMuted uppercase mt-1">Active Alerts</p>
           </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
           <h3 className="text-white font-bold mb-4">Weekly Adherence</h3>
           <div className="flex justify-between items-end h-32">
              {[40, 70, 50, 90, 80, 60, 95].map((h, i) => (
                 <div key={i} className="w-8 bg-gradient-to-t from-primary/20 to-primary rounded-t-lg transition-all hover:opacity-100 opacity-80" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
    </div>
)

const HomeView: React.FC<{ onAction: (v: View) => void }> = ({ onAction }) => (
  <div className="space-y-8 py-6">
      <div className="text-center space-y-4">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse-slow"></div>
             <Logo size={120} className="animate-float relative z-10 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-4">Medicinal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI</span></h2>
            <p className="text-textMuted text-sm max-w-xs mx-auto">Advanced Neural Health Companion</p>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onAction(View.SCAN)} className="glass-panel p-5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group border-primary/20 hover:scale-[1.02]">
             <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ShieldCheck size={28} className="text-primary" />
             </div>
             <span className="font-bold text-sm">Scan Medicine</span>
          </button>
          <button onClick={() => onAction(View.VOICE)} className="glass-panel p-5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group border-secondary/20 hover:scale-[1.02]">
             <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Brain size={28} className="text-secondary" />
             </div>
             <span className="font-bold text-sm">Neural Voice</span>
          </button>
          <button onClick={() => onAction(View.DASHBOARD)} className="glass-panel p-5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group border-accent/20 hover:scale-[1.02] col-span-2 flex-row justify-center">
             <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <LayoutDashboard size={28} className="text-accent" />
             </div>
             <span className="font-bold text-sm">Open Neuro-Sync Dashboard</span>
             <ArrowRight size={16} className="text-white/50" />
          </button>
      </div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
         <div className="flex gap-4 w-max">
             <div onClick={() => onAction(View.INTERACTION)} className="w-64 glass-panel p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-danger/50 transition-colors">
                <div className="bg-danger/10 p-2 rounded-lg"><ShieldAlert className="text-danger" /></div>
                <div><h4 className="font-bold text-white text-sm">Check Interactions</h4><p className="text-xs text-textMuted">Prevent dangerous mixes</p></div>
             </div>
             <div onClick={() => onAction(View.SYMPTOM)} className="w-64 glass-panel p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                <div className="bg-primary/10 p-2 rounded-lg"><Thermometer className="text-primary" /></div>
                <div><h4 className="font-bold text-white text-sm">Symptom Hologram</h4><p className="text-xs text-textMuted">Visual body scan</p></div>
             </div>
         </div>
      </div>
  </div>
);

const HistoryView = () => (
    <div className="text-center py-20 text-textMuted animate-fade-in-up">
        <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">Quantum Archive Empty</p>
        <p className="text-xs mt-2 opacity-50">Scan a medicine to initialize records.</p>
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);

  const renderView = () => {
    switch (currentView) {
      case View.HOME: return <HomeView onAction={setCurrentView} />;
      case View.SCAN: return <ScanView />;
      case View.CHAT: return <ChatView />;
      case View.VOICE: return <VoiceView />;
      case View.MAPS: return <MapsView />;
      case View.VIDEO: return <VeoView />;
      case View.HISTORY: return <HistoryView />;
      case View.INTERACTION: return <InteractionView />;
      case View.SYMPTOM: return <SymptomView />;
      case View.SOS: return <SOSView />;
      case View.REMINDER: return <ReminderView />;
      case View.DASHBOARD: return <DashboardView />;
      default: return <HomeView onAction={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;

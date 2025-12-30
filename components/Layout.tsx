import React, { useState } from 'react';
import { View } from '../types';
import { Pill, Activity, MapPin, Video, Mic, MessageCircle, Menu, X, History, Zap, Thermometer, ShieldAlert, Clock, LayoutDashboard } from 'lucide-react';
import { APP_NAME } from '../constants';
import { Logo } from './Logo';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

const NavItem: React.FC<{ view: View; current: View; icon: React.ReactNode; label: string; onClick: () => void }> = ({ view, current, icon, label, onClick }) => {
  const isActive = view === current;
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full p-2 transition-all duration-500 group ${
        isActive ? 'text-primary' : 'text-textMuted hover:text-white'
      }`}
    >
      <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      {isActive && (
        <div className="absolute -bottom-2 w-8 h-8 bg-primary/20 blur-xl rounded-full" />
      )}
    </button>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-4 p-4 w-full rounded-xl transition-all duration-300 group border border-transparent ${
      active ? 'bg-white/10 border-primary/20' : 'hover:bg-white/5 hover:border-white/5'
    }`}
  >
    <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-textMuted group-hover:text-white'}`}>
      {icon}
    </div>
    <span className={`font-medium tracking-wide ${active ? 'text-white' : 'text-textMuted group-hover:text-white'}`}>{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (v: View) => {
    onNavigate(v);
    setIsMenuOpen(false);
  }

  return (
    <div className="flex flex-col h-screen bg-background text-text overflow-hidden selection:bg-primary selection:text-black font-sans">
      {/* Cinematic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 glass-panel z-50 sticky top-0 mx-2 mt-2 rounded-2xl">
        <div className="flex items-center gap-3">
           <div className="animate-float">
             <Logo size={36} />
           </div>
           <h1 className="text-xl font-bold tracking-tight text-white">
             {APP_NAME}
           </h1>
        </div>
        <button 
          className="p-2.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 active:scale-95" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
           {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </header>

      {/* Full Screen Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl transition-all duration-500 flex flex-col pt-24 px-6 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="grid grid-cols-1 gap-2 max-w-md mx-auto w-full overflow-y-auto pb-20">
             <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Core Intelligence</h3>
             <MenuItem icon={<LayoutDashboard size={20}/>} label="Neuro-Sync Dashboard" onClick={() => handleNav(View.DASHBOARD)} active={currentView === View.DASHBOARD} />
             <MenuItem icon={<ShieldAlert size={20}/>} label="Interaction Matrix" onClick={() => handleNav(View.INTERACTION)} active={currentView === View.INTERACTION} />
             <MenuItem icon={<Thermometer size={20}/>} label="Symptom Hologram" onClick={() => handleNav(View.SYMPTOM)} active={currentView === View.SYMPTOM} />
             <MenuItem icon={<Clock size={20}/>} label="Dose Scheduler" onClick={() => handleNav(View.REMINDER)} active={currentView === View.REMINDER} />
             <MenuItem icon={<Zap size={20}/>} label="Bio-Rhythm SOS" onClick={() => handleNav(View.SOS)} active={currentView === View.SOS} />
             
             <div className="h-px bg-white/10 my-2" />
             
             <h3 className="text-xs font-bold text-textMuted uppercase tracking-[0.2em] mb-4">Utilities</h3>
             <MenuItem icon={<History size={20}/>} label="Scan History" onClick={() => handleNav(View.HISTORY)} active={currentView === View.HISTORY} />
             <MenuItem icon={<Video size={20}/>} label="Veo Video Studio" onClick={() => handleNav(View.VIDEO)} active={currentView === View.VIDEO} />
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 relative z-10 scroll-smooth">
         <div className="max-w-4xl mx-auto min-h-full animate-slide-up">
            {children}
         </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 glass-panel rounded-2xl z-30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10">
        <div className="flex justify-around items-center h-16">
          <NavItem view={View.HOME} current={currentView} icon={<Activity size={22} />} label="HOME" onClick={() => onNavigate(View.HOME)} />
          <NavItem view={View.SCAN} current={currentView} icon={<Pill size={22} />} label="SCAN" onClick={() => onNavigate(View.SCAN)} />
          <NavItem view={View.VOICE} current={currentView} icon={<Mic size={22} />} label="VOICE" onClick={() => onNavigate(View.VOICE)} />
          <NavItem view={View.CHAT} current={currentView} icon={<MessageCircle size={22} />} label="CHAT" onClick={() => onNavigate(View.CHAT)} />
          <NavItem view={View.MAPS} current={currentView} icon={<MapPin size={22} />} label="FIND" onClick={() => onNavigate(View.MAPS)} />
        </div>
      </nav>
    </div>
  );
};

export default Layout;

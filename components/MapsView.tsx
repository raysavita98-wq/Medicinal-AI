import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Star, Phone, Clock } from 'lucide-react';
import { findHospitals } from '../services/geminiService';
import { MapPlace } from '../types';
import ReactMarkdown from 'react-markdown';

const MapsView: React.FC = () => {
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchPlaces(latitude, longitude);
      }, (err) => {
          console.error(err);
          setSummary("Please enable location access to find nearby hospitals.");
      });
    }
  }, []);

  const fetchPlaces = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const result = await findHospitals(lat, lng);
      setSummary(result.text);
      setPlaces(result.places);
    } catch (e) {
      console.error(e);
      setSummary("Failed to find location data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
           <div>
               <h2 className="text-2xl font-bold text-white">Hospital Finder</h2>
               <p className="text-textMuted text-sm">AI-Ranked Recommendations</p>
           </div>
           <div className="p-3 bg-secondary/10 rounded-full">
               <MapPin className="text-secondary" />
           </div>
       </div>

       {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-secondary animate-pulse">Scanning nearby facilities...</p>
          </div>
       ) : (
           <div className="space-y-6">
               {/* AI Summary */}
               {summary && (
                   <div className="glass-panel p-4 rounded-xl border-l-4 border-secondary">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                             <span className="text-xs font-bold text-secondary uppercase">AI Analysis</span>
                        </div>
                        <div className="prose prose-invert prose-sm">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                   </div>
               )}

               {/* Places List */}
               <div className="grid grid-cols-1 gap-4">
                   {places.map((place, index) => (
                       <div key={index} className="glass-panel p-4 rounded-xl hover:border-secondary/50 transition-colors flex justify-between items-start group">
                           <div>
                               <h3 className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{place.title}</h3>
                               <p className="text-sm text-textMuted mb-2">{place.address}</p>
                               {place.rating && (
                                   <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                       <Star size={14} fill="currentColor" />
                                       <span>{place.rating}</span>
                                   </div>
                               )}
                           </div>
                           <a href={place.uri} target="_blank" rel="noreferrer" className="p-3 bg-secondary rounded-full text-black hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,255,157,0.4)]">
                               <Navigation size={20} />
                           </a>
                       </div>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
};

export default MapsView;

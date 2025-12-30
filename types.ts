export enum View {
  HOME = 'HOME',
  SCAN = 'SCAN',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  MAPS = 'MAPS',
  VIDEO = 'VIDEO',
  HISTORY = 'HISTORY',
  INTERACTION = 'INTERACTION', // New Feature 1
  SYMPTOM = 'SYMPTOM',         // New Feature 2
  SOS = 'SOS',                 // New Feature 3
  REMINDER = 'REMINDER',       // New Feature 4
  DASHBOARD = 'DASHBOARD'      // New Feature 5
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface MedicineDetails {
  name: string;
  genericName?: string;
  dosage?: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  manufacturer?: string;
}

export interface GroundingUrl {
  uri: string;
  title: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  address?: string;
  rating?: number;
}

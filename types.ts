export type Zone = 'Santo Domingo' | 'La Concordia';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  zone: Zone;
  sector: string;
  email: string; // Used for unique ID mainly
  role: 'user' | 'admin';
  downloadHistory: string[];
  surveyHistory: string[]; // IDs of surveys taken
  ticketNumber?: number; // Last ticket number generated
}

export interface SurveyOption {
  id: string;
  label: string; // Name of candidate or option text
  imageUrl?: string; // Base64 or URL
  votes: number;
}

export interface Survey {
  id: string;
  title: string;
  category: 'Alcalde' | 'Prefecto' | 'Obras' | 'Nacional';
  options: SurveyOption[];
  active: boolean;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Winner {
  id: string;
  prizeName: string;
  winnerName: string;
  date: string;
  ticketNumber: number;
}

export interface AppInstaller {
  id: string;
  name: string;
  version: string;
  category: 'Movies' | 'Music' | 'Games' | 'Tutorial';
  warningText?: string;
  downloadLink?: string;
  buttonText: string;
}
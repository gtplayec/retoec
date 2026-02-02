export interface DownloadRecord {
  installerId: string;
  installerTitle: string;
  date: string;
}

export interface SurveyRecord {
  surveyId: string;
  question: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  age: number;
  phone: string;
  sector: string;
  email: string;
  password?: string;      // New password field
  role: 'user' | 'admin'; 
  registeredAt: string;   
  lastLogin: string;      
  isVerified: boolean;
  hasVotedCurrentWeek: boolean;
  downloadHistory: DownloadRecord[];
  surveyHistory: SurveyRecord[];
}

export interface Installer {
  id: string;
  title: string;
  version: string;
  description: string;
  season: string;
  size: string;
  downloadUrl: string;
  icon: string;
}

export interface SurveyOption {
  id: string;
  text: string;
  votes: number;
  image?: string; // Optional image URL for candidates
}

export interface Survey {
  id: string;
  category: 'Alcalde/sa' | 'Prefecto/a' | 'Obras Prioritarias' | 'Nacionales';
  question: string;
  options: SurveyOption[];
  isActive: boolean;
  week: number;
}

export interface Prize {
  id: string;
  name: string;
  image: string;
  winner?: string;
  type: 'Tecnología' | 'Orden de Compra' | 'Descuento';
}

export interface Winner {
  userName: string;
  prizeName: string;
}

export interface PastDraw {
  id: string;
  week: number;
  date: string;
  winners: Winner[];
}
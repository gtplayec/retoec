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
  password?: string; // Field for authentication
  profilePicture?: string; // Base64 string of the profile image
  role: 'user' | 'admin';
  downloadHistory: string[];
  surveyHistory: string[]; // IDs of surveys taken
  tickets: number[]; // List of accumulated ticket numbers
  
  // Social Graph
  friends: string[]; // IDs of friends (Panas)
  friendRequests: string[]; // IDs of incoming requests
  
  // Fields for "Los 33"
  isMemberOf33?: boolean;
  bio?: string;
  cvPdf?: string; // Base64 string of the PDF
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string; // Optional post image
  likes: string[]; // Array of User IDs who liked
  shares: number; // Counter for shares
  sharedFrom?: {
    originalPostId: string;
    originalUserId: string;
    originalUserName: string;
    originalUserAvatar?: string;
    originalContent: string;
    originalImage?: string;
    originalDate: string;
  };
  comments: Comment[];
  date: string; // ISO string
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

export type Zone = 'Santo Domingo' | 'La Concordia';

export interface DeliveryInfo {
  address: string;
  reference: string;
  phone: string;
  instructions?: string;
  status: 'pending' | 'confirmed';
}

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
  isMasterAdmin?: boolean; // Only the main account has this
  downloadHistory: string[];
  surveyHistory: string[]; // IDs of surveys taken
  tickets: number[]; // List of accumulated ticket numbers
  rank?: string; // Ciudadano, Activista, Líder, Leyenda
  
  // Social Graph
  friends: string[]; // IDs of friends (Panas)
  friendRequests: string[]; // IDs of incoming requests
  
  // Fields for "Los 33"
  isMemberOf33?: boolean;
  bio?: string;
  cvPdf?: string; // Base64 string of the PDF

  // Extended fields for compatibility with DemoMember
  academic?: string;
  publicExp?: string;
  community?: string;
  
  // Raffle Fields
  isWinner?: boolean; // True if currently holding a win that hasn't been reset
  deliveryDetails?: DeliveryInfo;
}

export interface DemoMember {
  id: string;
  firstName: string;
  lastName: string;
  zone: Zone;
  role: string;
  academic: string;
  publicExp: string;
  community: string;
  profilePicture?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
}

export interface TargetAudience {
  type: 'global' | 'sector' | 'age';
  sector?: string;
  minAge?: number;
  maxAge?: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string; // Optional post image
  isGold?: boolean; // If true, applies flashy styles (For Los 33)
  targetAudience?: TargetAudience; // New field for segmentation
  likes: string[]; // Array of User IDs who liked
  shares: number; // Counter for shares
  comments: Comment[];
  date: string; // ISO string
}

export interface SurveyOption {
  id: string;
  label: string; // Name of candidate or option text
  imageUrl?: string; // Base64 or URL
  votes: number;
}

export interface VoteRecord {
  userId: string;
  optionId: string;
  userAge: number;
  userSector: string;
  timestamp: string;
}

export interface Survey {
  id: string;
  title: string;
  category: 'Alcalde' | 'Prefecto' | 'Obras' | 'Nacional';
  options: SurveyOption[];
  active: boolean;
  voteRecords?: VoteRecord[]; // Detailed analytics
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
  image: string; // Cover image for the app
  colorFrom: string; // Gradient start
  colorTo: string; // Gradient end
}

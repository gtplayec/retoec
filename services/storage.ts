import { User, Survey, Prize, Winner } from "../types";
import { INITIAL_PRIZES, INITIAL_SURVEYS } from "../constants";

const STORAGE_KEYS = {
  USERS: 'reto33sd_users',
  SURVEYS: 'reto33sd_surveys',
  PRIZES: 'reto33sd_prizes',
  WINNERS: 'reto33sd_winners',
  CURRENT_USER: 'reto33sd_current_user',
};

// --- Helpers ---
const get = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const set = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- API ---

export const storageService = {
  getUsers: (): User[] => get(STORAGE_KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = get<User[]>(STORAGE_KEYS.USERS, []);
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    set(STORAGE_KEYS.USERS, users);
    
    // If it's the current session user, update that too
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      set(STORAGE_KEYS.CURRENT_USER, user);
    }
  },
  
  deleteUser: (userId: string) => {
    const users = get<User[]>(STORAGE_KEYS.USERS, []);
    const newUsers = users.filter(u => u.id !== userId);
    set(STORAGE_KEYS.USERS, newUsers);
  },

  getCurrentUser: (): User | null => get(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => set(STORAGE_KEYS.CURRENT_USER, user),

  getSurveys: (): Survey[] => get(STORAGE_KEYS.SURVEYS, INITIAL_SURVEYS),
  saveSurveys: (surveys: Survey[]) => set(STORAGE_KEYS.SURVEYS, surveys),

  getPrizes: (): Prize[] => get(STORAGE_KEYS.PRIZES, INITIAL_PRIZES),
  savePrizes: (prizes: Prize[]) => set(STORAGE_KEYS.PRIZES, prizes),
  
  getWinners: (): Winner[] => get(STORAGE_KEYS.WINNERS, []),
  saveWinners: (winners: Winner[]) => set(STORAGE_KEYS.WINNERS, winners),
};
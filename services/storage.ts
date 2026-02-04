
import { User, Survey, Prize, Winner, Post, DeliveryInfo, VoteRecord } from "../types";
import { INITIAL_PRIZES, INITIAL_SURVEYS } from "../constants";

const STORAGE_KEYS = {
  USERS: 'reto33sd_users',
  SURVEYS: 'reto33sd_surveys',
  PRIZES: 'reto33sd_prizes',
  WINNERS: 'reto33sd_winners',
  POSTS: 'reto33sd_posts',
  CURRENT_USER: 'reto33sd_current_user',
};

// Initial Dummy Posts
const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'admin',
    userName: 'RETO Oficial',
    userAvatar: '', 
    content: '¡Bienvenidos al nuevo Muro de la comunidad! Aquí podrán compartir sus ideas y opiniones con todo Santo Domingo. 🚀',
    isGold: true,
    targetAudience: { type: 'global' },
    likes: ['test', 'user2', 'user3'],
    shares: 12,
    comments: [
      { id: 'c1', userId: 'test', userName: 'Usuario Demo', content: '¡Está genial la nueva actualización!', date: new Date().toISOString() }
    ],
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'post-2',
    userId: 'user-x',
    userName: 'Carlos Andrade',
    content: '¿Alguien sabe cuándo empiezan las obras en la Vía Aventura? Necesitamos info urgente.',
    likes: [],
    shares: 0,
    comments: [],
    date: new Date().toISOString()
  }
];

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
  
  // Specific method to update a user without overwriting session if not needed, useful for admin actions
  updateUserAsAdmin: (user: User) => {
    const users = get<User[]>(STORAGE_KEYS.USERS, []);
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
      set(STORAGE_KEYS.USERS, users);
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
  
  // Voting Logic
  submitVote: (surveyId: string, optionId: string, user: User): { user: User, ticketNumber: number | null } => {
    // 1. Update Survey Counts
    const surveys = storageService.getSurveys();
    const surveyIndex = surveys.findIndex(s => s.id === surveyId);
    if (surveyIndex === -1) throw new Error("Encuesta no encontrada");
    
    const optionIndex = surveys[surveyIndex].options.findIndex(o => o.id === optionId);
    if (optionIndex !== -1) {
        surveys[surveyIndex].options[optionIndex].votes += 1;
        
        // Record Analytics
        const newRecord: VoteRecord = {
            userId: user.id,
            optionId: optionId,
            userAge: user.age,
            userSector: user.sector,
            timestamp: new Date().toISOString()
        };
        
        if (!surveys[surveyIndex].voteRecords) {
            surveys[surveyIndex].voteRecords = [];
        }
        surveys[surveyIndex].voteRecords?.push(newRecord);
        
        storageService.saveSurveys(surveys);
    }

    // 2. Generate Ticket (ONLY IF NOT MEMBER OF 33)
    let ticketNumber: number | null = null;
    let updatedTickets = [...user.tickets];

    if (!user.isMemberOf33) {
        ticketNumber = Math.floor(1000 + Math.random() * 9000);
        updatedTickets.push(ticketNumber);
    }

    // 3. Update User
    const updatedUser = {
        ...user,
        surveyHistory: [...user.surveyHistory, surveyId],
        tickets: updatedTickets
    };
    storageService.saveUser(updatedUser);

    return { user: updatedUser, ticketNumber };
  },

  getPrizes: (): Prize[] => get(STORAGE_KEYS.PRIZES, INITIAL_PRIZES),
  savePrizes: (prizes: Prize[]) => set(STORAGE_KEYS.PRIZES, prizes),
  
  // Prize Management
  addPrize: (prize: Prize) => {
      const prizes = get<Prize[]>(STORAGE_KEYS.PRIZES, INITIAL_PRIZES);
      set(STORAGE_KEYS.PRIZES, [prize, ...prizes]);
  },
  
  updatePrize: (updatedPrize: Prize) => {
      const prizes = get<Prize[]>(STORAGE_KEYS.PRIZES, INITIAL_PRIZES);
      const index = prizes.findIndex(p => p.id === updatedPrize.id);
      if (index !== -1) {
          prizes[index] = updatedPrize;
          set(STORAGE_KEYS.PRIZES, prizes);
      }
  },

  deletePrize: (prizeId: string) => {
      const prizes = get<Prize[]>(STORAGE_KEYS.PRIZES, INITIAL_PRIZES);
      set(STORAGE_KEYS.PRIZES, prizes.filter(p => p.id !== prizeId));
  },

  getWinners: (): Winner[] => get(STORAGE_KEYS.WINNERS, []),
  saveWinners: (winners: Winner[]) => set(STORAGE_KEYS.WINNERS, winners),

  getPosts: (): Post[] => get(STORAGE_KEYS.POSTS, INITIAL_POSTS),
  savePosts: (posts: Post[]) => set(STORAGE_KEYS.POSTS, posts),
  
  addPost: (post: Post) => {
      const posts = get<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
      const newPosts = [post, ...posts];
      set(STORAGE_KEYS.POSTS, newPosts);
      return newPosts;
  },

  // --- ADMIN ACTIONS ---
  
  // 1. Reset Raffle (Clear tickets and survey history for ALL users)
  resetWeeklyDraw: () => {
    const users = get<User[]>(STORAGE_KEYS.USERS, []);
    const resetUsers = users.map(u => ({
      ...u,
      tickets: [],
      surveyHistory: [],
      isWinner: false,
      deliveryDetails: undefined
    }));
    set(STORAGE_KEYS.USERS, resetUsers);
    
    // If admin is logged in, update their session too
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      const updatedCurrent = resetUsers.find(u => u.id === currentUser.id);
      if (updatedCurrent) set(STORAGE_KEYS.CURRENT_USER, updatedCurrent);
    }
  },

  // NEW: Run Raffle Logic
  runWeeklyRaffle: (): { winner: {name: string, ticket: number} | null, voided: number[] } => {
      const users = get<User[]>(STORAGE_KEYS.USERS, []);
      
      // 1. Collect all tickets (Los 33 shouldn't have tickets, but filter anyway)
      let allTickets: { ticket: number, userId: string, userName: string }[] = [];
      users.forEach(u => {
          if (!u.isMemberOf33) {
             u.tickets.forEach(t => allTickets.push({ ticket: t, userId: u.id, userName: `${u.firstName} ${u.lastName}` }));
          }
      });

      if (allTickets.length === 0) {
          throw new Error("No hay tickets generados para realizar el sorteo.");
      }

      // 2. Shuffle array (Fisher-Yates shuffle)
      for (let i = allTickets.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allTickets[i], allTickets[j]] = [allTickets[j], allTickets[i]];
      }

      // 3. Select Winner and Voided
      // Need at least 1 ticket. If less than 11, void the rest.
      const winnerTicket = allTickets[0];
      const voidedTickets = allTickets.slice(1, 11).map(t => t.ticket); // Next 10 (or less)

      // 4. Update Winner User
      const winnerUserIndex = users.findIndex(u => u.id === winnerTicket.userId);
      if (winnerUserIndex >= 0) {
          users[winnerUserIndex].isWinner = true;
          set(STORAGE_KEYS.USERS, users);
      }

      // 5. Publish to Wall
      const rafflePost: Post = {
          id: `raffle-${Date.now()}`,
          userId: 'admin',
          userName: 'Sorteo Semanal RETO',
          userAvatar: '', // Use default icon
          content: `🎉 ¡HABEMUS GANADOR! 🎉\n\nEl ticket ganador de esta semana es el #${winnerTicket.ticket}, perteneciente a ${winnerTicket.userName}.\n\n🚫 Tickets anulados: ${voidedTickets.join(', ')}. \n\n¡Felicidades! Revisa tu perfil para reclamar tu premio.`,
          isGold: true,
          targetAudience: { type: 'global' },
          likes: [],
          shares: 0,
          comments: [],
          date: new Date().toISOString()
      };
      storageService.addPost(rafflePost);

      return {
          winner: { name: winnerTicket.userName, ticket: winnerTicket.ticket },
          voided: voidedTickets
      };
  },

  // NEW: Save Delivery Details
  saveDeliveryDetails: (userId: string, details: DeliveryInfo) => {
      const users = get<User[]>(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
          users[userIndex].deliveryDetails = details;
          set(STORAGE_KEYS.USERS, users);
          
          // Update Session
          const currentUser = storageService.getCurrentUser();
          if (currentUser && currentUser.id === userId) {
              const updated = { ...currentUser, deliveryDetails: details };
              set(STORAGE_KEYS.CURRENT_USER, updated);
              return updated;
          }
      }
      return null;
  },

  // 2. Manage Users (Toggle 33, Change Rank)
  updateUserRank: (userId: string, newRank: string) => {
      const users = get<User[]>(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
          users[userIndex].rank = newRank;
          set(STORAGE_KEYS.USERS, users);
      }
  },

  toggleLos33: (userId: string) => {
      const users = get<User[]>(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
          const isMember = !!users[userIndex].isMemberOf33;
          users[userIndex].isMemberOf33 = !isMember;
          
          // Clear tickets if they become 33
          if (!isMember) {
              users[userIndex].tickets = [];
          }
          
          set(STORAGE_KEYS.USERS, users);
      }
  },
  
  toggleAdminRole: (userId: string) => {
      const users = get<User[]>(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
          const newRole = users[userIndex].role === 'admin' ? 'user' : 'admin';
          // Prevent removing master admin manually if somehow triggered, though UI should prevent it
          if (users[userIndex].isMasterAdmin && newRole === 'user') return;
          
          users[userIndex].role = newRole;
          set(STORAGE_KEYS.USERS, users);
      }
  },

  // 3. Add Survey
  createSurvey: (newSurvey: Survey) => {
      const surveys = storageService.getSurveys();
      set(STORAGE_KEYS.SURVEYS, [newSurvey, ...surveys]);
  },

  deleteSurvey: (id: string) => {
      const surveys = storageService.getSurveys();
      set(STORAGE_KEYS.SURVEYS, surveys.filter(s => s.id !== id));
  }
};

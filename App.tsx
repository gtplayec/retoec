import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { GoogleGenAI } from "@google/genai";
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo, DEMO_MEMBERS_33 } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2, KeyRound, Users, Upload, FileCheck, Sparkles, Zap, Play, Music, Gamepad2, Shield, ShieldOff, UserMinus, UserPlus, Pencil, Ticket, MousePointerClick, RefreshCw, BookOpen, GraduationCap, Wand2, Camera, ChevronRight, Quote, Key, BarChart3, Briefcase, Heart, Building2, LayoutGrid, Home, MoreHorizontal
} from 'lucide-react';

// --- Configuration ---
const ANIME_STYLES = [
  { id: 'ghibli', label: 'Mágico (Ghibli)', color: 'bg-green-100 text-green-700', prompt: 'Turn this person into a Studio Ghibli anime character. Soft colors, magical atmosphere, detailed background, Hayao Miyazaki style.' },
  { id: 'cyberpunk', label: 'Futurista', color: 'bg-purple-100 text-purple-700', prompt: 'Turn this person into a Cyberpunk Edgerunners anime character. Neon lights, futuristic techwear, sharp outlines, vibrant colors.' },
  { id: 'shonen', label: 'Acción (Shonen)', color: 'bg-orange-100 text-orange-700', prompt: 'Turn this person into a modern Shonen anime hero. Dynamic lighting, bold lines, intense expression, Dragon Ball or Naruto style art.' },
  { id: 'retro', label: 'Retro 90s', color: 'bg-pink-100 text-pink-700', prompt: 'Turn this person into a 90s anime character. Sailor Moon aesthetic, lo-fi grain, pastel colors, vintage anime style.' },
  { id: 'manga', label: 'Manga B&N', color: 'bg-gray-100 text-gray-800', prompt: 'Turn this person into a high quality black and white Manga character. Detailed ink shading, comic book screentones, dramatic contrast.' },
];

// --- View Components ---

// 1. Auth Component
type AuthMode = 'login' | 'register' | 'verify_register' | 'recover_email' | 'recover_reset';

const AuthView: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', phone: '', 
    zone: 'Santo Domingo' as Zone, sector: '', email: '', password: ''
  });

  // Verification / Recovery Common State
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Recovery Specific State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Helper to send emails
  const sendEmail = async (toName: string, toEmail: string, code: string, message: string) => {
    const sendFn = (emailjs as any).send || (emailjs as any).default?.send;
    if (typeof sendFn !== 'function') throw new Error("Error loading email library");
    
    await sendFn(
      'service_pkc5h87',
      'template_rgm0xms',
      {
        to_name: toName,
        email_registro: toEmail, 
        verification_code: code,
        message: message
      },
      'owUYyPbGCKtFmhc8n'
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Admin Check (MASTER)
    if (email === 'gtplayec@gmail.com' && password === 'RETO2026') {
      const adminUser: User = {
        id: 'admin-main',
        firstName: 'Admin',
        lastName: 'Master',
        age: 30,
        phone: '0000000000',
        zone: 'Santo Domingo',
        sector: 'Centro',
        email: email,
        role: 'admin',
        downloadHistory: [],
        surveyHistory: [],
        tickets: []
      };
      onLogin(adminUser);
      return;
    }

    // 2. Test User Check
    if (email === 'retoec@gmail.com' && password === 'RETO123') {
      const testUser: User = {
        id: 'test-user-demo',
        firstName: 'Usuario',
        lastName: 'Pruebas',
        age: 25,
        phone: '0999999999',
        zone: 'Santo Domingo',
        sector: 'Zaracay',
        email: email,
        role: 'user',
        downloadHistory: ['App Demo 1'],
        surveyHistory: [],
        tickets: [12345, 67890]
      };
      // We save/update it in storage to persist session if needed, 
      // but strictly handleLogin usually just sets state in App.
      // For consistency with normal flow, we can let onLogin handle state
      onLogin(testUser);
      return;
    }
    
    // 3. Normal User Check
    const users = storageService.getUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      // Si el usuario tiene contraseña guardada, la validamos.
      if (foundUser.password && foundUser.password !== password) {
        alert("Contraseña incorrecta.");
        return;
      }
      onLogin(foundUser);
    } else {
      alert("Usuario no encontrado. Regístrate para ingresar.");
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.phone || !formData.email || !formData.sector || !formData.password) {
      alert("Por favor completa todos los campos, incluyendo la contraseña.");
      return;
    }

    const users = storageService.getUsers();
    if (users.find(u => u.email === formData.email)) {
        alert("Este correo electrónico ya está registrado.");
        return;
    }

    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      await sendEmail(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        code,
        `Tu código de verificación es: ${code}`
      );
      setMode('verify_register');
      alert(`Código enviado a ${formData.email}.`);
    } catch (error: any) {
      console.error(error);
      alert("Error enviando el correo. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== generatedCode) {
      alert("El código ingresado es incorrecto.");
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: parseInt(formData.age),
      phone: formData.phone,
      zone: formData.zone,
      sector: formData.sector,
      email: formData.email,
      password: formData.password, // Saving password
      role: 'user',
      downloadHistory: [],
      surveyHistory: [],
      tickets: []
    };
    storageService.saveUser(newUser);
    onLogin(newUser);
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = storageService.getUsers();
    const user = users.find(u => u.email === recoveryEmail);
    
    if (!user) {
      alert("No encontramos una cuenta con este correo.");
      return;
    }

    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      await sendEmail(
        user.firstName,
        user.email,
        code,
        `Tu código para restablecer la contraseña es: ${code}`
      );
      setMode('recover_reset');
      alert(`Código enviado a ${user.email}.`);
    } catch (error) {
      alert("Error al enviar el correo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== generatedCode) {
      alert("Código incorrecto.");
      return;
    }

    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.email === recoveryEmail);
    
    if (userIndex >= 0) {
      const updatedUser = { ...users[userIndex], password: newPassword };
      storageService.saveUser(updatedUser);
      alert("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
      setMode('login');
      // Reset states
      setPassword('');
      setEmail(recoveryEmail);
      setInputCode('');
    }
  };

  // --- Styles for Backgrounds ---
  const bgGradient = "bg-gradient-to-br from-brand-blue via-purple-900 to-brand-pink";

  // --- Renders ---

  if (mode === 'verify_register') {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/20">
          <div className="flex justify-center mb-4 text-brand-teal"><Mail size={48} /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifica tu Correo</h2>
          <p className="text-gray-600 mb-6 text-sm">Código enviado a <strong>{formData.email}</strong></p>
          <form onSubmit={handleFinalRegister} className="space-y-4">
            <input type="text" maxLength={6} placeholder="000000" className="w-full text-center text-3xl tracking-widest p-2 border-2 border-brand-teal rounded-lg bg-gray-50" value={inputCode} onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))} />
            <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-lg hover:bg-blue-900 transition font-bold shadow-lg transform hover:scale-105">Verificar y Entrar</button>
          </form>
          <button onClick={() => setMode('register')} className="mt-4 text-gray-500 text-sm underline">Corregir datos</button>
        </div>
      </div>
    );
  }

  if (mode === 'recover_email') {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
          <div className="flex justify-center mb-6 text-brand-pink animate-bounce"><KeyRound size={48} /></div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Recuperar Contraseña</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">Ingresa tu correo electrónico para recibir un código de recuperación.</p>
          <form onSubmit={handleRecoveryRequest} className="space-y-4">
            <input type="email" required placeholder="Tu correo electrónico" className="w-full p-3 border rounded-lg bg-gray-50" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} />
            <button type="submit" disabled={isLoading} className="w-full bg-brand-teal text-white py-3 rounded-lg hover:bg-teal-600 transition font-bold flex justify-center items-center shadow-lg">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Código'}
            </button>
          </form>
          <button onClick={() => setMode('login')} className="w-full mt-4 text-gray-500 text-sm hover:text-brand-blue">Volver al inicio de sesión</button>
        </div>
      </div>
    );
  }

  if (mode === 'recover_reset') {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Restablecer Contraseña</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código de Verificación</label>
              <input type="text" maxLength={6} required className="w-full p-3 border rounded-lg text-center text-xl tracking-widest bg-gray-50" value={inputCode} onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input type="password" required className="w-full p-3 border rounded-lg bg-gray-50" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-brand-pink text-white py-3 rounded-lg hover:bg-pink-600 transition font-bold shadow-lg">Cambiar Contraseña</button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-lg w-full my-8 border border-white/20">
          <div className="flex justify-center mb-6"><AppLogo /></div>
          <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-pink mb-6">Crear Cuenta</h2>
          <form onSubmit={handlePreRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nombre" className="p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input placeholder="Apellido" className="p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Edad" type="number" className="p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              <input placeholder="Teléfono" className="p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <input placeholder="Email" type="email" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Contraseña" type="password" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Zona</label>
                <select className="w-full p-3 border rounded-lg bg-gray-50 text-sm" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value as Zone, sector: ''})}>
                  <option value="Santo Domingo">Santo Domingo</option>
                  <option value="La Concordia">La Concordia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Sector</label>
                <select className="w-full p-3 border rounded-lg bg-gray-50 text-sm" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {LOCATIONS[formData.zone].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full text-white py-3 rounded-lg transition-all font-bold flex justify-center items-center shadow-lg transform hover:scale-105 mt-4 ${isLoading ? 'bg-gray-400' : 'bg-gradient-to-r from-brand-pink to-pink-600'}`}>
              {isLoading ? <><Loader2 className="animate-spin mr-2" /> Enviando...</> : 'Registrarse'}
            </button>
            <div className="text-center mt-4">
               <button type="button" onClick={() => setMode('login')} className="text-gray-500 text-sm hover:text-brand-blue font-semibold">¿Ya tienes cuenta? Inicia sesión</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Default: Login
  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20 transform transition-all">
        <div className="flex justify-center mb-8 transform hover:scale-110 transition-transform duration-300"><AppLogo /></div>
        <h2 className="text-3xl font-black text-center text-gray-800 mb-2">¡Hola de nuevo!</h2>
        <p className="text-center text-gray-500 mb-8">Accede a tus premios y descargas</p>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Email</label>
            <input type="email" required className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue outline-none transition" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Contraseña</label>
            <input type="password" required className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue outline-none transition" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <div className="text-right mt-2">
              <button type="button" onClick={() => setMode('recover_email')} className="text-xs text-brand-pink font-semibold hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-brand-teal to-teal-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold transform hover:-translate-y-1">Entrar a RETO33 SD</button>
        </form>
        <div className="mt-8 text-center border-t pt-4">
          <p className="text-sm text-gray-600">¿No tienes cuenta? <button onClick={() => setMode('register')} className="text-brand-blue font-bold hover:text-brand-pink transition-colors">Regístrate Gratis</button></p>
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Sections

const HomeSection: React.FC<{ user: User, onNavigate: (view: string) => void }> = ({ user, onNavigate }) => {
  return (
    <div className="animate-fade-in space-y-6 pb-24">
      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Hola, {user.firstName}! 👋</h2>
          <p className="text-gray-500 text-sm font-medium">¿Qué quieres hacer hoy?</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <Ticket className="text-brand-yellow mr-2 w-5 h-5" />
            <span className="font-black text-gray-800">{user.tickets.length}</span>
        </div>
      </div>

      {/* Bento Grid Layout - Juvenil y Organizado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Votar (Destacado) */}
        <div 
          onClick={() => onNavigate('surveys')}
          className="col-span-2 row-span-2 bg-gradient-to-br from-brand-blue to-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Vote size={120} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center">
              <Vote size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-1">Votar</h3>
              <p className="text-indigo-100 text-sm font-medium leading-tight">Participa y gana tickets semanales.</p>
            </div>
          </div>
        </div>

        {/* Card 2: Premios */}
        <div 
          onClick={() => onNavigate('prizes')}
          className="col-span-2 md:col-span-2 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer group hover:border-brand-pink hover:shadow-md transition-all"
        >
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-xl font-black text-gray-800">Premios</h3>
               <p className="text-gray-400 text-xs font-bold">CATÁLOGO</p>
             </div>
             <div className="bg-pink-50 text-brand-pink p-3 rounded-2xl group-hover:bg-brand-pink group-hover:text-white transition-colors">
               <Gift size={24} />
             </div>
           </div>
           <div className="mt-4 flex -space-x-2 overflow-hidden">
             {INITIAL_PRIZES.slice(0, 3).map((prize, i) => (
                <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={prize.image} alt=""/>
             ))}
             <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 ring-2 ring-white">+5</div>
           </div>
        </div>

        {/* Card 3: Descargas */}
        <div 
          onClick={() => onNavigate('installers')}
          className="bg-gradient-to-br from-teal-400 to-brand-teal rounded-[2rem] p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
        >
          <Download className="absolute -bottom-4 -right-4 text-white opacity-20 w-24 h-24" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg leading-none mb-1">Apps</h3>
            <p className="text-teal-100 text-xs">Gratis</p>
          </div>
        </div>

        {/* Card 4: Anime */}
        <div 
          onClick={() => onNavigate('anime')}
          className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-[2rem] p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
        >
          <Wand2 className="absolute -bottom-4 -right-4 text-white opacity-20 w-24 h-24" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg leading-none mb-1">Anime</h3>
            <p className="text-purple-100 text-xs">AI Avatar</p>
          </div>
        </div>

        {/* Card 5: Los 33 (Wide) */}
        <div 
          onClick={() => onNavigate('los33')}
          className="col-span-2 bg-gray-900 rounded-[2rem] p-6 text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>
          <div className="flex items-center justify-between relative z-10">
             <div className="flex items-center">
               <div className="bg-brand-gold/20 p-3 rounded-full mr-4 text-brand-gold">
                 <Star size={24} fill="currentColor"/>
               </div>
               <div>
                 <h3 className="font-black text-xl">Los 33</h3>
                 <p className="text-gray-400 text-xs">Líderes de la comunidad</p>
               </div>
             </div>
             <ChevronRight className="text-gray-500" />
          </div>
        </div>

        {/* Card 6: Ganadores */}
        <div 
          onClick={() => onNavigate('winners')}
          className="col-span-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-lg cursor-pointer relative overflow-hidden flex items-center justify-between"
        >
           <div>
             <h3 className="font-black text-xl">Ganadores</h3>
             <p className="text-yellow-100 text-xs">Sorteos semanales</p>
           </div>
           <Trophy size={32} className="text-white drop-shadow-md" />
        </div>

      </div>
    </div>
  );
};

const AnimeSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('ghibli');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generateAnime = async () => {
    if (!selectedImage) return;
    
    // Create new instance here to ensure it picks up the key if just set
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const styleConfig = ANIME_STYLES.find(s => s.id === selectedStyle);
      const prompt = styleConfig?.prompt || "Anime style";

      // Extract base64 without prefix
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: `${prompt}. Keep the pose and composition similar to the original image. High quality, detailed.`
            }
          ]
        },
      });

      // Extract image from response
      let foundImage = false;
      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) {
        const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
        if (textPart) {
           alert(`La IA respondió con texto en lugar de imagen: ${textPart.text}`);
        } else {
           alert("La IA no pudo generar la imagen. Inténtalo de nuevo.");
        }
      }

    } catch (error: any) {
      console.error("Error generating anime:", error);
      alert(`Hubo un error al conectar con la IA: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-20 transform translate-x-10 -translate-y-10">
          <Wand2 size={200} />
        </div>
        <h2 className="text-4xl font-black mb-2 relative z-10">Tu Versión Anime</h2>
        <p className="text-purple-100 text-lg relative z-10">Sube tu foto y transfórmate con el poder de la IA (Nano Banana).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Camera className="mr-2"/> 1. Sube tu Foto</h3>
                <div className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center relative bg-gray-50 transition-all ${!selectedImage ? 'border-gray-300 hover:border-purple-400' : 'border-purple-500'}`}>
                {selectedImage ? (
                    <img src={selectedImage} alt="Uploaded" className="h-full w-full object-contain rounded-lg p-2" />
                ) : (
                    <div className="text-center text-gray-400">
                    <Upload size={48} className="mx-auto mb-2" />
                    <p>Click para subir imagen</p>
                    </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Sparkles className="mr-2"/> 2. Elige un Estilo</h3>
                <div className="grid grid-cols-2 gap-3">
                {ANIME_STYLES.map(style => (
                    <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-sm font-bold text-left transition-all ${selectedStyle === style.id ? 'ring-2 ring-purple-500 shadow-md scale-105' : 'hover:bg-gray-50'} ${style.color}`}
                    >
                    {style.label}
                    </button>
                ))}
                </div>
            </div>

            <button 
                onClick={generateAnime}
                disabled={!selectedImage || isGenerating}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center text-lg ${!selectedImage || isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'}`}
            >
                {isGenerating ? <><Loader2 className="animate-spin mr-2" /> Creando Magia...</> : <><Wand2 className="mr-2" /> Generar Versión Anime</>}
            </button>
            </div>

            {/* Result Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><ImageIcon className="mr-2"/> Resultado</h3>
            <div className="flex-grow bg-gray-50 rounded-xl border-2 border-gray-100 flex items-center justify-center overflow-hidden min-h-[400px]">
                {isGenerating ? (
                <div className="text-center">
                    <Loader2 size={64} className="text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium animate-pulse">La IA está dibujando...</p>
                </div>
                ) : generatedImage ? (
                <div className="relative w-full h-full">
                    <img src={generatedImage} alt="Anime Version" className="w-full h-full object-contain" />
                </div>
                ) : (
                <p className="text-gray-400 text-center px-8">Aquí aparecerá tu versión anime una vez generada.</p>
                )}
            </div>
            {generatedImage && (
                <a 
                href={generatedImage} 
                download="mi_version_anime.png"
                className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center shadow-md"
                >
                <Download className="mr-2" /> Descargar Imagen
                </a>
            )}
            </div>
        </div>
    </div>
  );
};

const ProfileSection: React.FC<{ user: User, onUpdate: (u: User) => void, onLogout: () => void }> = ({ user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
    alert("Perfil actualizado correctamente");
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      storageService.deleteUser(user.id);
      onLogout();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 pb-24">
      <h2 className="text-3xl font-black text-brand-blue mb-6 flex items-center"><UserIcon className="mr-3 w-8 h-8" /> Mi Perfil</h2>
      
      {isEditing ? (
        <div className="space-y-4 animate-fade-in">
           <div className="grid grid-cols-2 gap-4">
            <input className="border p-3 rounded-lg bg-gray-50" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
            <input className="border p-3 rounded-lg bg-gray-50" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} />
            <input className="border p-3 rounded-lg bg-gray-50" type="number" value={editData.age} onChange={e => setEditData({...editData, age: parseInt(e.target.value)})} />
            <input className="border p-3 rounded-lg bg-gray-50" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
           </div>
           <div>
             <select className="border p-3 rounded-lg w-full bg-gray-50" value={editData.zone} onChange={e => setEditData({...editData, zone: e.target.value as Zone, sector: ''})}>
               <option value="Santo Domingo">Santo Domingo</option>
               <option value="La Concordia">La Concordia</option>
             </select>
           </div>
           <div>
             <select className="border p-3 rounded-lg w-full bg-gray-50" value={editData.sector} onChange={e => setEditData({...editData, sector: e.target.value})}>
               {LOCATIONS[editData.zone].map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           <div className="flex space-x-2 pt-2">
             <button onClick={handleSave} className="bg-brand-teal text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition">Guardar</button>
             <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">Cancelar</button>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-sm">Nombre Completo</p>
                <p className="font-bold text-lg text-gray-800">{user.firstName} {user.lastName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-sm">Ubicación</p>
                <p className="font-bold text-lg text-gray-800">{user.sector}, {user.zone}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-sm">Edad</p>
                <p className="font-bold text-lg text-gray-800">{user.age} Años</p>
            </div>
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-sm">Teléfono</p>
                <p className="font-bold text-lg text-gray-800">{user.phone}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="text-brand-blue font-bold hover:underline text-sm flex items-center mt-2">
            <Settings className="w-4 h-4 mr-1"/> Editar Información
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-black text-2xl mb-4 text-gray-800">Mi Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-brand-blue flex items-center mb-3"><Download className="mr-2 w-5 h-5" /> Descargas Recientes</h4>
            <ul className="space-y-2">
              {user.downloadHistory.length > 0 ? user.downloadHistory.map((d, i) => (
                <li key={i} className="text-sm text-gray-700 bg-white p-2 rounded shadow-sm">{d}</li>
              )) : <li className="text-sm text-gray-500 italic">No has descargado nada aún.</li>}
            </ul>
          </div>
          <div className="bg-pink-50 p-5 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-brand-pink flex items-center mb-3"><Vote className="mr-2 w-5 h-5" /> Encuestas Participadas</h4>
             <ul className="space-y-2">
              {user.surveyHistory.length > 0 ? user.surveyHistory.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 bg-white p-2 rounded shadow-sm">Encuesta ID: {s}</li>
              )) : <li className="text-sm text-gray-500 italic">No has participado en encuestas.</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <button onClick={handleDelete} className="flex items-center text-red-500 hover:text-red-700 font-semibold text-sm transition-colors">
          <Trash2 className="w-4 h-4 mr-2" /> Eliminar mi cuenta permanentemente
        </button>
      </div>
    </div>
  );
};

const InstallersSection: React.FC<{ user: User, onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const [modalData, setModalData] = useState<{ isOpen: boolean, installer: AppInstaller | null }>({ isOpen: false, installer: null });

  const handleDownloadClick = (installer: AppInstaller) => {
    if (installer.downloadLink === '#') return;
    setModalData({ isOpen: true, installer });
  };

  const confirmDownload = () => {
    if (modalData.installer) {
      window.open(modalData.installer.downloadLink, '_blank');
      // Update history
      const updatedUser = { ...user, downloadHistory: [...user.downloadHistory, `${modalData.installer.name} (${new Date().toLocaleDateString()})`] };
      storageService.saveUser(updatedUser);
      onUpdateUser(updatedUser);
      setModalData({ isOpen: false, installer: null });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Download size={200} />
        </div>
        <h2 className="text-4xl font-black mb-2 relative z-10">Zona de Descargas</h2>
        <p className="text-blue-100 text-lg relative z-10">Apps Premium, Música y Entretenimiento sin costo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {INSTALLERS.map(installer => (
          <div key={installer.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className={`h-32 flex items-center justify-center ${
              installer.category === 'Movies' ? 'bg-purple-100 text-purple-600' :
              installer.category === 'Music' ? 'bg-green-100 text-green-600' :
              installer.category === 'Games' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
                 {installer.category === 'Movies' && <Play size={48} className="transform group-hover:scale-125 transition-transform duration-300"/>}
                 {installer.category === 'Music' && <Music size={48} className="transform group-hover:scale-125 transition-transform duration-300"/>}
                 {installer.category === 'Games' && <Gamepad2 size={48} className="transform group-hover:scale-125 transition-transform duration-300"/>}
                 {installer.category === 'Tutorial' && <Sparkles size={48} className="transform group-hover:scale-125 transition-transform duration-300"/>}
            </div>
            
            <div className="p-6">
               <h3 className="text-xl font-bold text-gray-800 mb-1">{installer.name}</h3>
               <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-4 font-semibold">{installer.version}</span>
               
               <button 
                onClick={() => handleDownloadClick(installer)}
                disabled={installer.downloadLink === '#'}
                className={`w-full py-3 rounded-xl font-bold text-white transition flex items-center justify-center ${installer.downloadLink === '#' ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-brand-pink'}`}
              >
                {installer.downloadLink === '#' ? 'Próximamente' : <><Download size={18} className="mr-2"/> Descargar</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Modal */}
      {modalData.isOpen && modalData.installer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl transform scale-100 transition-all">
            <div className="flex items-center text-amber-500 mb-6">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-800">ATENCIÓN</h3>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-sm whitespace-pre-line mb-8 text-gray-700 leading-relaxed font-medium">
              {modalData.installer.warningText}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setModalData({ isOpen: false, installer: null })} className="px-6 py-3 bg-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-300 transition">Cancelar</button>
              <button onClick={confirmDownload} className="px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-blue-800 font-bold shadow-lg transition transform hover:scale-105">Entendido, Descargar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SurveysSection: React.FC<{ user: User, onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeTab, setActiveTab] = useState<'Alcalde' | 'Prefecto' | 'Obras' | 'Nacional'>('Alcalde');

  useEffect(() => {
    setSurveys(storageService.getSurveys());
  }, []);

  const handleVote = (surveyId: string, optionId: string) => {
    if (user.surveyHistory.includes(surveyId)) {
      alert("Ya has votado en esta encuesta.");
      return;
    }

    const updatedSurveys = surveys.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          options: s.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
        };
      }
      return s;
    });

    storageService.saveSurveys(updatedSurveys);
    setSurveys(updatedSurveys);

    // Generate ticket
    const ticket = Math.floor(Math.random() * 50000) + 1;
    const updatedUser = { 
      ...user, 
      surveyHistory: [...user.surveyHistory, surveyId],
      tickets: [...(user.tickets || []), ticket]
    };
    storageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);

    alert(`¡Voto registrado! Tu número para el sorteo semanal es: ${ticket}`);
  };

  const filteredSurveys = surveys.filter(s => s.category === activeTab && s.active);

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className="bg-gradient-to-r from-brand-blue to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Vote size={200} />
        </div>
        <h2 className="text-4xl font-black mb-2 relative z-10">Tu Voz Cuenta</h2>
        <p className="text-blue-100 text-lg relative z-10">Participa en las decisiones de tu ciudad y gana tickets para sorteos.</p>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {(['Alcalde', 'Prefecto', 'Obras', 'Nacional'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-sm ${activeTab === cat ? 'bg-brand-teal text-white shadow-lg ring-4 ring-teal-100' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredSurveys.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
            <Vote size={48} className="mx-auto text-gray-300 mb-4"/>
            <p className="text-gray-500 font-medium">No hay encuestas activas en esta categoría por el momento.</p>
          </div>
        )}
        
        {filteredSurveys.map(survey => {
          const totalVotes = survey.options.reduce((acc, opt) => acc + opt.votes, 0);
          const hasVoted = user.surveyHistory.includes(survey.id);
          
          return (
          <div key={survey.id} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
            
            <div className="relative z-10 mb-8 flex justify-between items-start">
               <div>
                 <h3 className="text-2xl font-black text-gray-800 leading-tight">{survey.title}</h3>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-2 flex items-center">
                   <BarChart3 className="w-4 h-4 mr-1" /> {totalVotes} Votos Registrados
                 </p>
               </div>
               {hasVoted && (
                 <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-xs flex items-center shadow-sm">
                   <CheckCircle className="w-4 h-4 mr-2" /> Votado
                 </span>
               )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {survey.options.map(opt => {
                const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                return (
                <div 
                  key={opt.id} 
                  onClick={() => !hasVoted && handleVote(survey.id, opt.id)}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 bg-white border-2 
                    ${hasVoted 
                      ? 'border-gray-100 opacity-90 cursor-default' 
                      : 'border-gray-200 cursor-pointer hover:border-brand-teal hover:shadow-xl transform hover:-translate-y-1'
                    }`}
                >
                   {/* Image Container */}
                   <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                     {opt.imageUrl ? (
                       <img src={opt.imageUrl} alt={opt.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                         <ImageIcon size={48} />
                       </div>
                     )}
                     
                     {/* Gradient Overlay */}
                     <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 ${!hasVoted ? 'group-hover:opacity-80' : ''}`}></div>

                     {/* Action Button (Visible on Hover if not voted) */}
                     {!hasVoted && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                           <div className="bg-brand-teal text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center transform scale-90 group-hover:scale-100 transition-transform">
                             VOTAR
                           </div>
                        </div>
                     )}
                   </div>

                   {/* Content Container */}
                   <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800 text-lg leading-tight line-clamp-1">{opt.label}</span>
                        {hasVoted && (
                          <span className="font-black text-brand-blue text-lg">{percent}%</span>
                        )}
                      </div>
                      
                      {hasVoted ? (
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                           <div 
                             className="h-full bg-gradient-to-r from-brand-teal to-brand-blue rounded-full transition-all duration-1000 ease-out relative" 
                             style={{ width: `${percent}%` }}
                           >
                             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-xs font-semibold group-hover:text-brand-teal transition-colors">Click para seleccionar</span>
                        </div>
                      )}
                   </div>
                </div>
              )})}
            </div>
            
            {hasVoted && (
               <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-800 font-bold shadow-sm">
                 <Ticket className="mr-2 w-5 h-5"/> ¡Ticket Generado! Revisa la sección de "Premios" para ver tus oportunidades.
               </div>
            )}
          </div>
        )})}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-3xl mt-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-black mb-2 flex items-center"><Zap className="text-brand-yellow mr-2 fill-current"/> ¡Participa y Gana!</h3>
                <p className="text-gray-400">Cada encuesta completada es una oportunidad más para ganar.</p>
            </div>
            <div className="bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <span className="block text-gray-400 text-xs uppercase tracking-wider font-bold">Tickets Acumulados</span>
                <span className="text-4xl font-black text-brand-yellow">{(user.tickets || []).length}</span>
            </div>
        </div>
        
        {/* List of Tickets */}
        {(user.tickets && user.tickets.length > 0) && (
            <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                <h4 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center">
                    <Ticket className="w-4 h-4 mr-2" /> Tus Números de la Suerte
                </h4>
                <div className="flex flex-wrap gap-3">
                    {user.tickets.map((ticket, index) => (
                        <span key={index} className="bg-brand-pink text-white font-mono font-bold px-3 py-1 rounded-lg shadow-sm text-sm border border-white/20">
                            #{ticket}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const Los33Section: React.FC<{ user: User, onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [bio, setBio] = useState(user.bio || '');

  useEffect(() => {
    // For this implementation, we prioritize the DEMO list to satisfy the requirement
    // In a real app, we might merge these or fetch from DB.
  }, []);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert("Por favor sube solo archivos PDF.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        const updatedUser = { ...user, cvPdf: ev.target?.result as string };
        storageService.saveUser(updatedUser);
        onUpdateUser(updatedUser);
        alert("Hoja de vida subida correctamente.");
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBio = () => {
    const updatedUser = { ...user, bio: bio };
    storageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);
    alert("Información actualizada.");
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      
      {/* Premium Hero Section */}
      <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-blue/40 mix-blend-overlay"></div>
        {/* Abstract shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-gold rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-blue rounded-full opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 p-10 md:p-16 text-center">
           <Star className="w-16 h-16 text-brand-gold mx-auto mb-4 animate-spin-slow" />
           <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">LOS 33</h2>
           <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
             Lugar exclusivo para la excelencia y el liderazgo. <span className="text-brand-gold font-semibold">Perfiles destacados de lideres y lideresas</span> que están transformando nuestra comunidad.
           </p>
        </div>
      </div>

      {/* Editor for Members (Enhanced) - Only visible if logged in user IS a member */}
      {user.isMemberOf33 && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-4 border-brand-gold">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-800 flex items-center">
                <Settings className="mr-3 text-brand-gold w-6 h-6" /> Tu Perfil VIP
              </h3>
              <span className="bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Miembro Activo</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-4">
                 <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Tu Biografía / Presentación</label>
                 <div className="relative">
                   <Quote className="absolute top-4 left-4 text-gray-200 w-8 h-8" />
                   <textarea 
                     className="w-full border-2 border-gray-100 rounded-2xl p-6 pl-14 h-40 focus:border-brand-gold focus:ring-0 outline-none transition text-gray-600 bg-gray-50 leading-relaxed resize-none"
                     placeholder="Escribe una breve presentación que inspire a otros. ¿Quién eres y cuál es tu visión?"
                     value={bio}
                     onChange={e => setBio(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="space-y-4 flex flex-col justify-between">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Hoja de Vida (PDF)</label>
                    <label className={`cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center h-40 transition group ${user.cvPdf ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-brand-gold hover:bg-yellow-50'}`}>
                      {user.cvPdf ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                          <span className="text-green-700 font-bold text-sm">PDF Cargado Exitosamente</span>
                          <span className="text-green-600 text-xs mt-1">Click para reemplazar</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 group-hover:text-brand-gold mb-2 transition" />
                          <span className="text-gray-500 font-medium text-sm group-hover:text-gray-700">Subir Archivo PDF</span>
                        </>
                      )}
                      <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                    </label>
                 </div>
                 <button onClick={saveBio} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-brand-gold transition shadow-lg flex items-center justify-center">
                   <Sparkles className="mr-2 w-5 h-5" /> Publicar Cambios
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Members (Redesigned) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
        {DEMO_MEMBERS_33.map(member => (
          <div key={member.id} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group relative">
            {/* Geometric Header */}
            <div className="h-32 bg-gray-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold rounded-full opacity-20 transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-blue rounded-full opacity-30 transform -translate-x-5 translate-y-5"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <Star size={100} className="text-white" />
                </div>
            </div>

            {/* Avatar centered */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
               <div className="h-28 w-28 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-full p-1 shadow-lg">
                 <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-gray-800 font-black text-4xl border-4 border-white">
                   {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                 </div>
               </div>
            </div>

            <div className="pt-20 px-6 pb-8 flex-grow text-center mt-4">
               <h3 className="text-2xl font-black text-gray-800 mb-1">{member.firstName} {member.lastName}</h3>
               <p className="text-brand-blue font-bold text-sm mb-2 uppercase tracking-wide">{member.role}</p>
               <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
                 {member.zone}
               </span>
               
               <div className="space-y-4 text-left">
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-brand-gold transition-colors">
                    <h4 className="flex items-center font-bold text-gray-700 text-xs uppercase mb-1">
                      <GraduationCap className="w-4 h-4 mr-2 text-brand-blue" /> Formación Académica
                    </h4>
                    <p className="text-gray-600 text-sm leading-snug">{member.academic}</p>
                 </div>

                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-brand-gold transition-colors">
                    <h4 className="flex items-center font-bold text-gray-700 text-xs uppercase mb-1">
                      <Building2 className="w-4 h-4 mr-2 text-brand-teal" /> Exp. Pública
                    </h4>
                    <p className="text-gray-600 text-sm leading-snug">{member.publicExp}</p>
                 </div>

                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-brand-gold transition-colors">
                    <h4 className="flex items-center font-bold text-gray-700 text-xs uppercase mb-1">
                      <Heart className="w-4 h-4 mr-2 text-brand-pink" /> Labor Comunitaria
                    </h4>
                    <p className="text-gray-600 text-sm leading-snug">{member.community}</p>
                 </div>
               </div>
            </div>

            <div className="p-6 pt-0 mt-auto">
                <button disabled className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-lg">
                   <FileText size={18} className="mr-2" /> Ver Hoja de Vida Completa
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const PrizesSection: React.FC<{ viewMode: 'prizes' | 'winners' }> = ({ viewMode }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    setPrizes(storageService.getPrizes());
    setWinners(storageService.getWinners());
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className={`rounded-2xl p-8 text-white shadow-xl relative overflow-hidden ${viewMode === 'prizes' ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 'bg-gradient-to-r from-yellow-500 to-amber-600'}`}>
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Gift size={200} />
        </div>
        <h2 className="text-4xl font-black mb-2 relative z-10">{viewMode === 'prizes' ? 'Catálogo de Premios' : 'Ganadores de la Semana'}</h2>
        <p className="text-white/80 text-lg relative z-10">{viewMode === 'prizes' ? 'Canjea tus tickets por increíbles premios.' : 'Conoce a los afortunados ganadores de los sorteos.'}</p>
      </div>

      {viewMode === 'prizes' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map(prize => (
            <div key={prize.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 relative overflow-hidden">
                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-bold text-sm">Ver Detalles</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{prize.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{prize.description}</p>
                <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-brand-pink transition shadow-md">
                  ¡Lo Quiero!
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
           {winners.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ganador</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Premio</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {winners.map(winner => (
                     <tr key={winner.id} className="hover:bg-gray-50 transition">
                       <td className="px-6 py-4 text-sm text-gray-600">{winner.date}</td>
                       <td className="px-6 py-4 font-bold text-gray-800">{winner.winnerName}</td>
                       <td className="px-6 py-4 text-brand-pink font-bold">{winner.prizeName}</td>
                       <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono font-bold text-xs">#{winner.ticketNumber}</span></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-10 text-center text-gray-500">
               <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
               <p>Aún no hay ganadores registrados. ¡Participa y podrías ser el primero!</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = storageService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    storageService.setCurrentUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
    setCurrentView('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <HomeSection user={user} onNavigate={setCurrentView} />;
      case 'profile': return <ProfileSection user={user} onUpdate={handleUpdateUser} onLogout={handleLogout} />;
      case 'surveys': return <SurveysSection user={user} onUpdateUser={handleUpdateUser} />;
      case 'installers': return <InstallersSection user={user} onUpdateUser={handleUpdateUser} />;
      case 'anime': return <AnimeSection />;
      case 'los33': return <Los33Section user={user} onUpdateUser={handleUpdateUser} />;
      case 'prizes': return <PrizesSection viewMode="prizes" />;
      case 'winners': return <PrizesSection viewMode="winners" />;
      default: return <HomeSection user={user} onNavigate={setCurrentView} />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Inicio', icon: <Home size={20} /> },
    { id: 'surveys', label: 'Votar', icon: <Vote size={20} /> },
    { id: 'prizes', label: 'Premios', icon: <Gift size={20} /> },
    { id: 'installers', label: 'Descargas', icon: <Download size={20} /> },
    // Only used for mobile menu expansion
    { id: 'los33', label: 'Los 33', icon: <Star size={20} /> },
    { id: 'anime', label: 'Anime', icon: <Wand2 size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <UserIcon size={20} /> },
    { id: 'winners', label: 'Ganadores', icon: <Trophy size={20} /> },
  ];

  const mainMobileNav = navItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-50">
        <div className="p-8 flex justify-center">
           <AppLogo />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.filter(i => i.id !== 'more').map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-200 font-bold ${currentView === item.id ? 'bg-gradient-to-r from-brand-blue to-blue-700 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-blue'}`}
            >
              <span className="mr-4">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100">
           <button onClick={handleLogout} className="flex items-center text-red-500 font-bold hover:text-red-700 transition">
             <LogOut className="mr-3" size={20} /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Mobile Top Bar (Logo Only) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-200 px-6 py-3 flex items-center justify-center shadow-sm">
        <div className="h-8"><AppLogo /></div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
           {mainMobileNav.map(item => (
             <button 
               key={item.id}
               onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
               className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all ${currentView === item.id ? 'text-brand-blue bg-blue-50' : 'text-gray-400'}`}
             >
               <div className={`${currentView === item.id ? 'transform scale-110' : ''}`}>{item.icon}</div>
               <span className="text-[10px] font-bold mt-1">{item.label}</span>
             </button>
           ))}
           {/* More Button */}
           <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all ${mobileMenuOpen ? 'text-brand-pink bg-pink-50' : 'text-gray-400'}`}
           >
             <MoreHorizontal size={20} />
             <span className="text-[10px] font-bold mt-1">Más</span>
           </button>
        </div>
      </div>

      {/* Mobile More Menu (Overlay) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 flex flex-col justify-end pb-24 animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
           <div className="bg-white rounded-t-3xl p-6 shadow-2xl space-y-2" onClick={e => e.stopPropagation()}>
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">Opciones Adicionales</h3>
              {navItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                  className="w-full flex items-center p-4 rounded-2xl hover:bg-gray-50 font-bold text-gray-700"
                >
                  <span className="bg-gray-100 p-2 rounded-full mr-4 text-brand-blue">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              <button onClick={handleLogout} className="w-full flex items-center p-4 rounded-2xl hover:bg-red-50 font-bold text-red-500">
                <span className="bg-red-50 p-2 rounded-full mr-4"><LogOut size={20} /></span>
                Cerrar Sesión
              </button>
           </div>
        </div>
      )}

      <main className="flex-1 lg:ml-72 p-4 lg:p-10 pt-20 lg:pt-10 overflow-x-hidden pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}
          <header className="hidden lg:flex justify-between items-center mb-8">
             <div>
               <h1 className="text-3xl font-black text-gray-900">{navItems.find(i => i.id === currentView)?.label}</h1>
               <p className="text-gray-500 font-medium">Bienvenido, {user.firstName}</p>
             </div>
             <div className="hidden md:block">
               <span className="bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-full font-bold text-sm">
                 {user.zone}
               </span>
             </div>
          </header>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
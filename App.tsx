import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { GoogleGenAI } from "@google/genai";
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize, Post, Comment 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo, DEMO_MEMBERS_33 } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2, KeyRound, Users, Upload, FileCheck, Sparkles, Zap, Play, Music, Gamepad2, Shield, ShieldOff, UserMinus, UserPlus, Pencil, Ticket, MousePointerClick, RefreshCw, BookOpen, GraduationCap, Wand2, Camera, ChevronRight, Quote, Key, BarChart3, Briefcase, Heart, Building2, LayoutGrid, Home, MoreHorizontal, Share, MapPin, Calendar, Clock, Smartphone, PlayCircle, Headphones, Rocket, Edit3, MessageCircle, Send, Share2, ThumbsUp, UserPlus as UserPlusIcon, Users as UsersIcon, Check, Repeat, Medal, FileDown, Award, Briefcase as BriefcaseIcon, Info, ChevronDown
} from 'lucide-react';

// --- Global Process Fix for Browser ---
declare global {
  interface Window {
    process: any;
    deferredPrompt: any; // For PWA install
  }
}
const process = window.process || { env: {} };

// --- Configuration ---
const ANIME_STYLES = [
  { id: 'ghibli', label: 'Studio Ghibli', color: 'from-emerald-400 to-green-500', prompt: 'Turn this person into a Studio Ghibli anime character. Soft colors, magical atmosphere, detailed background, Hayao Miyazaki style.' },
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'from-brand-pink to-purple-600', prompt: 'Turn this person into a Cyberpunk Edgerunners anime character. Neon lights, futuristic techwear, sharp outlines, vibrant colors.' },
  { id: 'shonen', label: 'Shonen Hero', color: 'from-orange-400 to-brand-gold', prompt: 'Turn this person into a modern Shonen anime hero. Dynamic lighting, bold lines, intense expression, Dragon Ball or Naruto style art.' },
  { id: 'retro', label: 'Retro 90s', color: 'from-rose-400 to-brand-pink', prompt: 'Turn this person into a 90s anime character. Sailor Moon aesthetic, lo-fi grain, pastel colors, vintage anime style.' },
  { id: 'manga', label: 'Manga B&W', color: 'from-slate-700 to-black', prompt: 'Turn this person into a high quality black and white Manga character. Detailed ink shading, comic book screentones, dramatic contrast.' },
];

const USER_RANKS = [
    { name: 'Ciudadano', minPoints: 0, color: 'text-slate-500', bg: 'bg-slate-100', icon: Users },
    { name: 'Activista', minPoints: 50, color: 'text-brand-teal', bg: 'bg-brand-teal/10', icon: MegaphoneIcon },
    { name: 'Líder', minPoints: 150, color: 'text-brand-blue', bg: 'bg-brand-blue/10', icon: Trophy },
    { name: 'Leyenda', minPoints: 300, color: 'text-brand-gold', bg: 'bg-brand-gold/10', icon: CrownIcon },
];

function MegaphoneIcon(props: any) {
    return <Zap {...props} />
}

function CrownIcon(props: any) {
    return <Star {...props} />
}

// --- Sub-Components ---

// PWA Install Modal
const PWAInstallPrompt: React.FC<{ prompt: any, onInstall: () => void, onClose: () => void }> = ({ prompt, onInstall, onClose }) => {
  if (!prompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white/95 backdrop-blur-2xl p-5 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(60,189,178,0.2)] border border-brand-teal/20 flex items-center justify-between ring-1 ring-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-teal/10 rounded-full blur-xl -mr-5 -mt-5"></div>
        <div className="flex items-center relative z-10">
           <div className="bg-gradient-to-br from-brand-teal to-brand-blue p-3.5 rounded-2xl mr-4 shadow-lg shadow-brand-teal/30">
             <Download className="text-white w-6 h-6" />
           </div>
           <div>
             <h4 className="text-slate-800 font-black text-lg leading-tight">Instalar App</h4>
             <p className="text-slate-500 text-xs mt-0.5 font-bold">Experiencia completa y sin esperas</p>
           </div>
        </div>
        <div className="flex items-center space-x-2 relative z-10">
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"><X size={20} /></button>
          <button onClick={onInstall} className="bg-gradient-to-r from-brand-teal to-brand-blue text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-brand-teal/20 hover:scale-105 transition active:scale-95">
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- View Components ---

// 1. Auth Component
type AuthMode = 'login' | 'register' | 'verify_register' | 'recover_email' | 'recover_reset';

const AuthView: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', phone: '', 
    zone: 'Santo Domingo' as Zone, sector: '', email: '', password: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Helper to send emails (Mocked logic kept)
  const sendEmail = async (toName: string, toEmail: string, code: string, message: string) => {
    const sendFn = (emailjs as any).send || (emailjs as any).default?.send;
    if (typeof sendFn !== 'function') throw new Error("Error loading email library");
    await sendFn('service_pkc5h87', 'template_rgm0xms', {
        to_name: toName, email_registro: toEmail, verification_code: code, message: message
    }, 'owUYyPbGCKtFmhc8n');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (email === 'gtplayec@gmail.com' && password === 'RETO2026') {
      onLogin({ id: 'admin', firstName: 'Admin', lastName: 'Master', age: 30, phone: '0', zone: 'Santo Domingo', sector: 'Centro', email, role: 'admin', downloadHistory: [], surveyHistory: [], tickets: [], friends: [], friendRequests: [] }); return;
    }
    if (email === 'retoec@gmail.com' && password === 'RETO123') {
      onLogin({ id: 'test', firstName: 'Usuario', lastName: 'Demo', age: 25, phone: '0999999999', zone: 'Santo Domingo', sector: 'Zaracay', email, role: 'user', downloadHistory: [], surveyHistory: [], tickets: [1024], friends: [], friendRequests: [] }); return;
    }
    const users = storageService.getUsers();
    const foundUser = users.find(u => u.email === email);
    if (foundUser && (!foundUser.password || foundUser.password === password)) {
      onLogin(foundUser);
    } else {
      setLoginError(foundUser ? "Contraseña incorrecta." : "Usuario no encontrado.");
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some(x => !x)) { alert("Completa todos los campos."); return; }
    if (storageService.getUsers().find(u => u.email === formData.email)) { alert("Correo ya registrado."); return; }

    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    try {
      await sendEmail(`${formData.firstName} ${formData.lastName}`, formData.email, code, `Tu código: ${code}`);
      setMode('verify_register');
    } catch (e) { alert("Error enviando correo."); } finally { setIsLoading(false); }
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== generatedCode) { alert("Código incorrecto."); return; }
    const newUser: User = { 
        id: Date.now().toString(), ...formData, age: parseInt(formData.age), 
        role: 'user', downloadHistory: [], surveyHistory: [], tickets: [],
        friends: [], friendRequests: [] 
    };
    storageService.saveUser(newUser);
    onLogin(newUser);
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) { alert("Ingresa tu correo."); return; }
    const users = storageService.getUsers();
    const foundUser = users.find(u => u.email === recoveryEmail);
    if (!foundUser) { alert("Correo no registrado."); return; }

    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    try {
      await sendEmail(`${foundUser.firstName} ${foundUser.lastName}`, recoveryEmail, code, `Código de recuperación: ${code}`);
      setMode('recover_reset');
    } catch (e) { alert("Error al enviar correo."); } finally { setIsLoading(false); }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== generatedCode) { alert("Código incorrecto."); return; }
    const users = storageService.getUsers();
    const foundUser = users.find(u => u.email === recoveryEmail);
    if (foundUser) {
        const updatedUser = { ...foundUser, password: newPassword };
        storageService.saveUser(updatedUser);
        alert("Contraseña restablecida con éxito.");
        setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-teal/20 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-pink/10 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-float" style={{animationDelay: '3s'}}></div>

      <div className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden grid md:grid-cols-5 relative z-10 min-h-[700px]">
        
        {/* Left Side (Visuals) - Spans 2 columns */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-brand-teal to-brand-blue relative flex-col justify-between p-12 text-white overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
               <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl inline-block mb-8 border border-white/20">
                  <AppLogo />
               </div>
               <h1 className="text-5xl font-black leading-tight tracking-tighter mb-6">
                 Tu Voz <br/>
                 <span className="text-brand-yellow">Transforma</span> <br/>
                 La Ciudad.
               </h1>
               <p className="text-blue-100 text-lg font-medium leading-relaxed opacity-90">
                 Únete a la comunidad digital más grande de Santo Domingo. Participa, gana premios y conecta con tu gente.
               </p>
            </div>

            {/* Floating Cards */}
            <div className="relative z-10 mt-auto">
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 mb-4 transform translate-x-4">
                  <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-brand-blue shadow-lg">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Premios Reales</p>
                    <p className="text-xs text-blue-100">Canjea tus puntos</p>
                  </div>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 transform -translate-x-4">
                  <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center text-white shadow-lg">
                    <Vote size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Decisiones</p>
                    <p className="text-xs text-blue-100">Tu opinión cuenta</p>
                  </div>
               </div>
            </div>
        </div>

        {/* Right Side (Form) - Spans 3 columns */}
        <div className="md:col-span-3 p-8 md:p-16 flex flex-col justify-center bg-white relative">
            <div className="md:hidden mb-8 flex justify-center">
               <div className="scale-75"><AppLogo /></div>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
                <div className="max-w-md mx-auto w-full animate-fade-in-up">
                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">¡Hola de nuevo! 👋</h2>
                        <p className="text-slate-500 font-medium">Ingresa tus datos para continuar.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                  <Mail className="text-slate-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                                </div>
                                <input 
                                  type="email" 
                                  required 
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all placeholder-slate-300"
                                  placeholder="ejemplo@correo.com" 
                                  value={email} 
                                  onChange={e => { setEmail(e.target.value); setLoginError(null); }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                                <button type="button" onClick={() => setMode('recover_email')} className="text-xs font-bold text-brand-teal hover:text-brand-blue transition-colors">¿Olvidaste tu contraseña?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                  <KeyRound className="text-slate-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                                </div>
                                <input 
                                  type="password" 
                                  required 
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 transition-all placeholder-slate-300"
                                  placeholder="••••••••" 
                                  value={password} 
                                  onChange={e => { setPassword(e.target.value); setLoginError(null); }}
                                />
                            </div>
                        </div>

                        {loginError && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center text-sm font-bold border border-red-100 animate-fade-in">
                                <AlertTriangle className="mr-3 flex-shrink-0" size={20} />
                                {loginError}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-gradient-to-r from-brand-teal to-brand-blue text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center group">
                            Iniciar Sesión <ArrowLeft className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-bold">
                            ¿No tienes cuenta? 
                            <button onClick={() => setMode('register')} className="text-brand-pink font-black hover:underline ml-1">Regístrate Gratis</button>
                        </p>
                    </div>
                </div>
            )}

            {/* Registration Form */}
            {mode === 'register' && (
                <div className="max-w-lg mx-auto w-full animate-fade-in-up">
                     <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Crea tu cuenta</h2>
                        <p className="text-slate-500 text-sm font-bold">Únete hoy y empieza a ganar.</p>
                     </div>

                    <form onSubmit={handlePreRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                                <input placeholder="Tu Nombre" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                                <input placeholder="Tu Apellido" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Edad</label>
                                <input placeholder="18" type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                <input placeholder="099..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                             </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <input placeholder="tu@email.com" type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <input placeholder="Crea una contraseña segura" type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona</label>
                                 <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm appearance-none" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value as Zone, sector: ''})}>
                                    <option value="Santo Domingo">Sto. Domingo</option>
                                    <option value="La Concordia">La Concordia</option>
                                 </select>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector</label>
                                 <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-brand-pink focus:bg-white transition-all text-sm appearance-none" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                                    <option value="">Selecciona...</option>
                                    {LOCATIONS[formData.zone].map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                             </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full mt-6 bg-gradient-to-r from-brand-pink to-rose-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center">
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Crear Cuenta'}
                        </button>
                        
                        <button type="button" onClick={() => setMode('login')} className="w-full text-center text-slate-400 text-xs font-bold mt-2 hover:text-slate-600 transition-colors">
                            Volver al inicio
                        </button>
                    </form>
                </div>
            )}

            {/* Verification & Recovery screens */}
            {(mode === 'verify_register' || mode === 'recover_reset' || mode === 'recover_email') && (
                 <div className="max-w-md mx-auto w-full animate-fade-in-up text-center">
                    {/* Icon */}
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3 ${mode === 'recover_email' ? 'bg-brand-pink/10 text-brand-pink' : 'bg-brand-teal/10 text-brand-teal'}`}>
                        {mode === 'recover_email' ? <KeyRound size={40} /> : <Mail size={40} />}
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3">
                        {mode === 'recover_email' ? 'Recuperar Cuenta' : 'Verificación'}
                    </h2>
                    <p className="text-slate-500 font-bold mb-8 px-8">
                        {mode === 'recover_email' 
                            ? 'Ingresa tu correo y te enviaremos un código.' 
                            : 'Hemos enviado un código de 6 dígitos a tu correo.'}
                    </p>

                    {mode === 'recover_email' ? (
                        <form onSubmit={handleRecoveryRequest} className="space-y-4">
                            <input type="email" placeholder="tu@correo.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-pink transition-all text-center placeholder-slate-300" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} />
                            <button type="submit" disabled={isLoading} className="w-full bg-brand-pink text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-pink/20 hover:scale-[1.02] transition-all">
                                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Enviar Código'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={mode === 'verify_register' ? handleFinalRegister : handlePasswordReset} className="space-y-6">
                            <input type="text" placeholder="000000" maxLength={6} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-6 font-mono font-black text-4xl text-slate-800 outline-none focus:bg-white focus:border-brand-teal transition-all text-center tracking-[0.5em] shadow-inner placeholder-slate-200" value={inputCode} onChange={e => setInputCode(e.target.value)} />
                            
                            {mode === 'recover_reset' && (
                                <input type="password" placeholder="Nueva contraseña" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-teal transition-all text-center" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            )}

                            <button type="submit" className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-teal/20 hover:scale-[1.02] transition-all">
                                Confirmar
                            </button>
                        </form>
                    )}

                    <button onClick={() => setMode('login')} className="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">Cancelar</button>
                 </div>
            )}

        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Component

const Los33View: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadCV = () => {
        setDownloading(true);
        // Simulate network delay
        setTimeout(() => {
            setDownloading(false);
            alert("Descarga completada: hoja_de_vida.pdf");
        }, 2000);
    };

    if (selectedMember) {
        // DETAILED MEMBER VIEW
        return (
            <div className="animate-fade-in pb-24">
                <button onClick={() => setSelectedMember(null)} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={20} /> Volver a la lista
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative mb-6">
                    {/* Hero Background */}
                    <div className="h-40 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
                             {/* Avatar */}
                             <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-xl ring-4 ring-white relative z-10 flex-shrink-0">
                                 <div className="w-full h-full bg-slate-100 rounded-[1.8rem] flex items-center justify-center font-black text-4xl text-slate-300 overflow-hidden">
                                     {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                                 </div>
                                 <div className="absolute -bottom-2 -right-2 bg-brand-gold text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                     <Star size={16} fill="currentColor" />
                                 </div>
                             </div>

                             {/* Basic Info */}
                             <div className="flex-1 pt-16 md:pt-20">
                                 <h2 className="text-3xl font-black text-slate-800 leading-none mb-2">{selectedMember.firstName} {selectedMember.lastName}</h2>
                                 <div className="flex flex-wrap gap-2 mb-4">
                                     <span className="bg-slate-900 text-brand-gold px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                                         {selectedMember.role}
                                     </span>
                                     <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
                                         {selectedMember.zone}
                                     </span>
                                 </div>
                             </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            
                            <div className="space-y-6">
                                {/* Academic */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><GraduationCap size={20} /></div>
                                        <h4 className="font-black text-slate-800">Formación Académica</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedMember.academic}</p>
                                </div>

                                {/* Experience */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><BriefcaseIcon size={20} /></div>
                                        <h4 className="font-black text-slate-800">Experiencia Pública</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedMember.publicExp}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Community */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-xl"><UsersIcon size={20} /></div>
                                        <h4 className="font-black text-slate-800">Aporte Social</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedMember.community}</p>
                                </div>

                                {/* Download CV Card */}
                                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    
                                    <div className="flex items-center gap-4 mb-4 relative z-10">
                                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 shadow-sm">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800">Hoja de Vida</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Formato PDF • 2.4 MB</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleDownloadCV}
                                        disabled={downloading}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10"
                                    >
                                        {downloading ? (
                                            <><Loader2 className="animate-spin" size={18} /> Descargando...</>
                                        ) : (
                                            <><FileDown size={18} /> Descargar Archivo</>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="animate-fade-in pb-32">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-10 mb-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-slate-700">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full blur-[80px]"></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                     <div>
                         <div className="flex items-center gap-2 mb-2">
                             <Star fill="#fcbf10" className="text-brand-gold" size={24} />
                             <span className="text-brand-gold font-black tracking-[0.2em] uppercase text-sm">Edición 2024</span>
                         </div>
                         <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-white">
                             LOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-500">33</span>
                         </h2>
                         <p className="text-slate-400 font-medium max-w-lg text-lg leading-relaxed">
                             La red de líderes, innovadores y visionarios que están transformando el futuro de Santo Domingo y La Concordia.
                         </p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                         <span className="block text-3xl font-black text-brand-gold">33</span>
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Perfiles Seleccionados</span>
                     </div>
                 </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMO_MEMBERS_33.map(member => (
                    <div 
                        key={member.id} 
                        onClick={() => setSelectedMember(member)}
                        className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-4 -mt-4 z-0 transition-colors group-hover:bg-brand-gold/5"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 flex items-center justify-center font-black text-3xl text-slate-300 border-2 border-white shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                                    {member.firstName[0]}{member.lastName[0]}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="bg-slate-900 text-brand-gold text-[10px] font-black px-2 py-1 rounded-md uppercase mb-1">
                                        #{member.id}
                                    </span>
                                    <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:text-brand-gold transition-colors">
                                        <ArrowLeft className="rotate-180" size={20} />
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-800 leading-none mb-2 group-hover:text-brand-blue transition-colors">
                                {member.firstName} <br/> {member.lastName}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-4">
                                {member.role}
                            </p>
                            
                            <div className="space-y-2 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-brand-gold" />
                                    {member.zone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={14} className="text-brand-teal" />
                                    <span className="line-clamp-1">{member.publicExp.split('.')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts] = useState<Post[]>(storageService.getPosts());
  const [surveys, setSurveys] = useState<Survey[]>(storageService.getSurveys());
  const [prizes] = useState<Prize[]>(storageService.getPrizes());
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  
  // AI Avatar State
  const [selectedStyle, setSelectedStyle] = useState(ANIME_STYLES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gamification Logic
  const userPoints = user.surveyHistory.length * 10; // 10 points per survey
  const currentRank = USER_RANKS.slice().reverse().find(r => userPoints >= r.minPoints) || USER_RANKS[0];
  const nextRank = USER_RANKS.find(r => r.minPoints > userPoints);
  const progressPercent = nextRank 
    ? ((userPoints - (USER_RANKS.find(r => r.name === currentRank.name)?.minPoints || 0)) / (nextRank.minPoints - (USER_RANKS.find(r => r.name === currentRank.name)?.minPoints || 0))) * 100 
    : 100;


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Remove data url prefix
      const base64Data = uploadedImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: selectedStyle.prompt }
          ]
        },
        config: {
            imageConfig: { aspectRatio: '1:1' }
        }
      });
      
      let foundImage = null;
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  foundImage = `data:image/png;base64,${part.inlineData.data}`;
                  break;
              }
          }
      }
      
      if (foundImage) {
          setGeneratedAvatar(foundImage);
      } else {
          alert("No se pudo generar la imagen. Intenta de nuevo.");
      }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Error generando avatar.");
    } finally {
        setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'feed':
        return (
          <div className="space-y-6 p-4 pb-24 animate-fade-in">
             {/* Feed Header / Creator */}
             <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-brand-blue/5 border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-blue p-[2px]">
                         <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-brand-blue">
                             {user.firstName[0]}
                         </div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-slate-400 text-sm font-medium cursor-text border border-slate-100 hover:bg-slate-100 transition-colors">
                        ¿Qué estás pensando hoy, {user.firstName}?
                    </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-pink transition-colors">
                        <ImageIcon size={18} /> Foto
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-gold transition-colors">
                        <SmileIcon size={18} /> Sentimiento
                    </button>
                    <button className="bg-brand-blue text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-brand-blue/20 hover:scale-105 transition-transform">
                        Publicar
                    </button>
                </div>
             </div>

            <h2 className="text-xl font-black text-slate-800 px-2 flex items-center gap-2">
                <Sparkles className="text-brand-yellow" size={20} /> Tendencias
            </h2>

            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 border-2 border-white shadow-sm">
                        {post.userName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{post.userName}</h3>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={12} /> {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="ml-auto text-slate-300 hover:text-slate-600">
                          <MoreHorizontal size={20} />
                      </button>
                    </div>
                    
                    <p className="text-slate-700 mb-4 leading-relaxed font-medium text-lg">{post.content}</p>
                    
                    {/* Placeholder for post image if exists */}
                    {post.image && (
                        <div className="mb-4 rounded-2xl overflow-hidden shadow-inner">
                            <img src={post.image} alt="Post content" className="w-full h-64 object-cover" />
                        </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400 text-sm font-bold border-t border-slate-50 pt-4 mt-2">
                      <button className="flex items-center gap-2 hover:text-brand-pink transition-colors group">
                          <Heart size={20} className="group-hover:fill-brand-pink" /> 
                          <span>{post.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                          <MessageCircle size={20} /> 
                          <span>{post.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-brand-blue transition-colors">
                          <Share2 size={20} /> 
                          <span>{post.shares}</span>
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'surveys':
        return (
          <div className="space-y-6 p-4 pb-24 animate-fade-in">
            <div className="bg-gradient-to-br from-brand-pink to-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h2 className="text-3xl font-black mb-2 relative z-10">Tu Voz Cuenta</h2>
                <p className="opacity-90 font-medium relative z-10">Participa en las decisiones que transforman la ciudad.</p>
            </div>

            {surveys.map(survey => (
              <div key={survey.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl text-slate-800 leading-tight w-3/4">{survey.title}</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{survey.category}</span>
                </div>
                
                {/* Auto-detect Layout: Grid for Images, List for Text */}
                {survey.options.some(opt => opt.imageUrl) ? (
                    <div className="grid grid-cols-2 gap-4">
                        {survey.options.map(opt => (
                            <button key={opt.id} className="relative group overflow-hidden rounded-2xl aspect-square bg-slate-100 border-2 border-transparent hover:border-brand-pink transition-all shadow-sm">
                                {opt.imageUrl ? (
                                    <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-left">
                                    <span className="text-white font-bold text-sm block leading-tight">{opt.label}</span>
                                    <span className="text-brand-yellow text-xs font-black">{opt.votes} votos</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {survey.options.map((opt, idx) => {
                            const maxVotes = Math.max(...survey.options.map(o => o.votes));
                            const percent = maxVotes > 0 ? (opt.votes / maxVotes) * 100 : 0;
                            
                            return (
                                <button key={opt.id} className="w-full relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-brand-teal p-4 rounded-2xl flex justify-between items-center transition-all group overflow-hidden shadow-sm hover:shadow-md">
                                    {/* Progress Bar Background */}
                                    <div className="absolute left-0 top-0 bottom-0 bg-brand-teal/5 transition-all duration-1000" style={{width: `${percent}%`}}></div>
                                    
                                    <div className="flex items-center gap-4 relative z-10">
                                        <span className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:border-brand-teal group-hover:text-brand-teal transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="font-bold text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                                    </div>
                                    <span className="font-black text-slate-400 group-hover:text-brand-teal relative z-10">{opt.votes}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'prizes':
        return (
          <div className="space-y-6 p-4 pb-24 animate-fade-in relative">
            <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-2xl font-black text-slate-800">Catálogo de Premios</h2>
                 <div className="bg-brand-yellow px-4 py-2 rounded-xl text-brand-blue font-black text-sm shadow-lg shadow-brand-yellow/20 flex items-center gap-2">
                     <Ticket size={16} /> {user.tickets.length * 100} Ptos
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {prizes.map(prize => (
                <div 
                    key={prize.id} 
                    onClick={() => setSelectedPrize(prize)}
                    className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative w-full h-32 mb-3 rounded-2xl overflow-hidden bg-slate-100">
                       <img src={prize.image} alt={prize.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-tight px-1 mb-1">{prize.name}</h3>
                  <div className="mt-auto px-1 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Ver detalles</span>
                       <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Prize Detail Modal */}
            {selectedPrize && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-fade-in-up">
                        <button onClick={() => setSelectedPrize(null)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/40 transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="h-64 bg-slate-100">
                             <img src={selectedPrize.image} alt={selectedPrize.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{selectedPrize.name}</h3>
                            <p className="text-slate-500 font-medium mb-6 leading-relaxed">{selectedPrize.description}</p>
                            
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                <div className="flex items-center gap-3">
                                    <Info className="text-brand-teal" size={20} />
                                    <p className="text-xs text-slate-500">Acércate a los puntos autorizados con tu código QR para reclamar este premio.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
        case 'downloads':
            return (
              <div className="space-y-6 p-4 pb-24 animate-fade-in">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>
                     <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-teal/20 rounded-full blur-3xl"></div>
                     <h2 className="text-3xl font-black relative z-10 mb-2">Zona Digital</h2>
                     <p className="text-slate-400 relative z-10 font-medium">Las mejores herramientas y entretenimiento, gratis para ti.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INSTALLERS.map(app => (
                  <div key={app.id} className={`p-6 rounded-[2rem] shadow-lg border relative overflow-hidden group hover:-translate-y-1 transition-transform ${
                      app.category === 'Movies' ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700/30' :
                      app.category === 'Music' ? 'bg-gradient-to-br from-green-900 to-emerald-900 border-green-700/30' :
                      app.category === 'Games' ? 'bg-gradient-to-br from-rose-900 to-red-900 border-red-700/30' :
                      'bg-white border-slate-100'
                  }`}>
                    {/* Background Icon Faded */}
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        {app.category === 'Movies' && <PlayCircle size={150} className="text-white" />}
                        {app.category === 'Music' && <Music size={150} className="text-white" />}
                        {app.category === 'Games' && <Gamepad2 size={150} className="text-white" />}
                        {app.category === 'Tutorial' && <BookOpen size={150} className="text-slate-900" />}
                    </div>

                    <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${
                            app.category === 'Tutorial' ? 'bg-slate-100 text-slate-800' : 'bg-white/20 backdrop-blur-md text-white'
                        }`}>
                             {app.category === 'Movies' && <PlayCircle size={28} />}
                             {app.category === 'Music' && <Music size={28} />}
                             {app.category === 'Games' && <Gamepad2 size={28} />}
                             {app.category === 'Tutorial' && <BookOpen size={28} />}
                        </div>
                        
                        <h3 className={`text-xl font-black mb-1 ${app.category === 'Tutorial' ? 'text-slate-800' : 'text-white'}`}>{app.name}</h3>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-6 ${app.category === 'Tutorial' ? 'text-slate-400' : 'text-white/60'}`}>{app.version} • {app.category}</p>
                        
                        <a href={app.downloadLink} target="_blank" rel="noreferrer" className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                            app.category === 'Tutorial' 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-white text-slate-900 hover:bg-white/90'
                        }`}>
                            <Download size={18} /> {app.buttonText}
                        </a>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            );
      case 'profile':
        return (
          <div className="p-4 pb-24 space-y-6 animate-fade-in">
            {/* Gamified Profile Header */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${currentRank.bg.replace('/10','')} to-transparent opacity-20`}></div>
                
                <div className="relative z-10">
                    <div className="w-28 h-28 mx-auto mb-4 relative">
                        <div className="w-full h-full rounded-full p-1 bg-white shadow-xl">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-pink to-rose-500 flex items-center justify-center text-white text-4xl font-black">
                                    {user.firstName[0]}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-slate-100">
                             <currentRank.icon className={currentRank.color} size={20} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-1">{user.firstName} {user.lastName}</h2>
                    <p className={`text-sm font-black uppercase tracking-widest mb-6 ${currentRank.color}`}>{currentRank.name}</p>

                    {/* Progress Bar */}
                    <div className="max-w-xs mx-auto mb-6">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>{userPoints} XP</span>
                            <span>{nextRank ? nextRank.minPoints : 'MAX'} XP</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-teal to-brand-blue rounded-full transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            {nextRank ? `Te faltan ${nextRank.minPoints - userPoints} puntos para ser ${nextRank.name}` : '¡Has alcanzado el rango máximo!'}
                        </p>
                    </div>

                    <button onClick={onLogout} className="flex items-center justify-center gap-2 mx-auto text-red-500 font-bold text-xs bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl transition-colors">
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* AI Avatar Generator */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Sparkles size={24} /></div>
                   <div>
                       <h3 className="font-black text-lg text-slate-800 leading-none">AI Studio</h3>
                       <p className="text-xs text-slate-400 font-bold">Crea tu avatar único</p>
                   </div>
               </div>
               
               <div className="space-y-4">
                   <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                       {ANIME_STYLES.map(style => (
                           <button 
                             key={style.id} 
                             onClick={() => setSelectedStyle(style)}
                             className={`flex-shrink-0 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wide transition-all ${
                                 selectedStyle.id === style.id 
                                 ? `bg-gradient-to-r ${style.color} text-white shadow-lg transform scale-105` 
                                 : 'bg-slate-50 text-slate-500 border border-slate-100'
                             }`}
                           >
                               {style.label}
                           </button>
                       ))}
                   </div>

                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-brand-teal hover:bg-slate-50 transition-all cursor-pointer group"
                   >
                       {uploadedImage ? (
                           <img src={uploadedImage} alt="Upload" className="max-h-48 mx-auto rounded-xl shadow-md" />
                       ) : (
                           <div className="text-slate-400 group-hover:text-brand-teal transition-colors">
                               <Upload className="mx-auto mb-3" size={32} />
                               <p className="text-sm font-bold">Toca para subir tu foto</p>
                           </div>
                       )}
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                   </div>

                   <button 
                     onClick={handleGenerateAvatar} 
                     disabled={!uploadedImage || isGenerating}
                     className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                   >
                       {isGenerating ? <Loader2 className="animate-spin" /> : <><Wand2 size={18} /> GENERAR AVATAR</>}
                   </button>

                   {generatedAvatar && (
                       <div className="mt-6 animate-fade-in p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
                           <img src={generatedAvatar} alt="Generated" className="w-full rounded-[1.5rem] shadow-lg" />
                           <button className="w-full mt-2 py-3 text-brand-blue font-black text-xs hover:bg-white rounded-xl transition-colors">
                               Guardar en Perfil
                           </button>
                       </div>
                   )}
               </div>
            </div>
          </div>
        );
      case 'los33':
        return <Los33View />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-gold selection:text-brand-blue">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
         <div 
            onClick={() => setActiveTab('feed')} 
            className="w-24 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
         >
             <AppLogo />
         </div>
         <div 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-teal to-brand-blue p-[2px] cursor-pointer"
         >
             <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-brand-blue text-sm hover:bg-slate-50 transition-colors">
                 {user.firstName[0]}
             </div>
         </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto">
          {renderContent()}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-2 py-2 flex justify-around items-center z-50 md:hidden pb-safe">
          <NavButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={Home} label="Muro" />
          <NavButton active={activeTab === 'surveys'} onClick={() => setActiveTab('surveys')} icon={Vote} label="Votar" />
          <div className="relative -top-5">
              <button 
                onClick={() => setActiveTab('los33')}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/30 border-4 border-white transition-transform active:scale-95 ${activeTab === 'los33' ? 'bg-brand-gold text-white' : 'bg-slate-900 text-brand-gold'}`}
              >
                  <Star fill="currentColor" size={24} />
              </button>
          </div>
          <NavButton active={activeTab === 'prizes'} onClick={() => setActiveTab('prizes')} icon={Gift} label="Premios" />
          <NavButton active={activeTab === 'downloads'} onClick={() => setActiveTab('downloads')} icon={Download} label="Apps" />
      </div>
      
      {/* Desktop Nav Warning */}
      <div className="hidden md:block fixed bottom-10 left-10 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 max-w-xs animate-fade-in-up">
          <h4 className="font-black text-slate-800 mb-2">Versión Móvil</h4>
          <p className="text-sm text-slate-500 font-medium mb-4">Esta experiencia está diseñada para ser disfrutada en tu celular.</p>
          <div className="flex gap-2">
              <button onClick={() => setActiveTab('feed')} className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Inicio</button>
              <button onClick={() => setActiveTab('profile')} className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Perfil</button>
          </div>
      </div>
    </div>
  );
};

// Helper Component for Nav
const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: any, label: string }> = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all ${active ? 'text-brand-teal' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        <Icon size={22} strokeWidth={active ? 3 : 2} className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`} />
        <span className="text-[9px] font-black tracking-wide">{label}</span>
    </button>
);

function SmileIcon(props: any) {
    return <Heart {...props} />
}

// 3. Main App Container
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Check local storage for user
    const stored = storageService.getCurrentUser();
    if (stored) setUser(stored);

    // PWA Install Handler
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = () => {
     if (deferredPrompt) {
         deferredPrompt.prompt();
         deferredPrompt.userChoice.then((result: any) => {
             if (result.outcome === 'accepted') {
                 console.log('Accepted');
             }
             setDeferredPrompt(null);
             setShowInstall(false);
         });
     }
  };

  if (!user) {
      return (
          <>
            <AuthView onLogin={(u) => {
                storageService.setCurrentUser(u);
                setUser(u);
            }} />
            {showInstall && <PWAInstallPrompt prompt={deferredPrompt} onInstall={handleInstall} onClose={() => setShowInstall(false)} />}
          </>
      );
  }

  return <Dashboard user={user} onLogout={() => {
      storageService.setCurrentUser(null);
      setUser(null);
  }} />;
};

export default App;
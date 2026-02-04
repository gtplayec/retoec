import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize, Post, Comment, DemoMember, DeliveryInfo 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo, DEMO_MEMBERS_33 } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2, KeyRound, Users, Upload, FileCheck, Sparkles, Zap, Play, Music, Gamepad2, Shield, ShieldOff, UserMinus, UserPlus, Pencil, Ticket, MousePointerClick, RefreshCw, BookOpen, GraduationCap, Wand2, Camera, ChevronRight, Quote, Key, BarChart3, Briefcase, Heart, Building2, LayoutGrid, Home, MoreHorizontal, Share, MapPin, Calendar, Clock, Smartphone, PlayCircle, Headphones, Rocket, Edit3, MessageCircle, Send, Share2, ThumbsUp, UserPlus as UserPlusIcon, Users as UsersIcon, Check, Repeat, Medal, FileDown, Award, Briefcase as BriefcaseIcon, Info, ChevronDown, PlusCircle, RefreshCcw, Lock, Eye, EyeOff, Package, Truck, PartyPopper, Filter, Globe, Map, PieChart
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
const USER_RANKS = [
    { name: 'Ciudadano', minPoints: 0, color: 'text-indigo-400', bg: 'bg-indigo-50', icon: Users },
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

// --- Helper Functions ---
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const downloadCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
        [Object.keys(data[0]).join(",")]
        .concat(data.map(e => Object.values(e).map(val => `"${val}"`).join(",")))
        .join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Sub-Components ---

// Privacy Policy Component
const PrivacyPolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] bg-indigo-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white/95 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-white/50">
            <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/50">
                <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                    <Lock size={20} className="text-brand-purple" /> Políticas de Privacidad
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-400"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto text-sm text-indigo-900/70 leading-relaxed space-y-4">
                <p><strong>1. Responsable del Tratamiento:</strong> RETO EC (en adelante, "la Plataforma") es la responsable del tratamiento de los datos personales de los usuarios de Santo Domingo y La Concordia.</p>
                <p><strong>2. Datos Recopilados:</strong> Recopilamos nombres, correos electrónicos, imágenes de perfil, ubicación aproximada (sector) y preferencias de votación con el fin de gestionar las encuestas y la entrega de premios.</p>
                <p><strong>3. Finalidad:</strong> Los datos se utilizan exclusivamente para: (a) Validar la autenticidad de los votos, (b) Gestionar el sorteo de premios, (c) Mejorar la experiencia comunitaria.</p>
                <p><strong>4. Derechos del Usuario:</strong> De acuerdo con la Ley Orgánica de Protección de Datos Personales, usted tiene derecho a acceder, rectificar, eliminar y oponerse al tratamiento de sus datos. Puede ejercer estos derechos contactando al administrador.</p>
                <p><strong>5. Seguridad:</strong> Implementamos medidas técnicas para proteger su información. No compartimos sus datos con terceros sin su consentimiento explícito.</p>
                <p className="text-xs text-indigo-300 mt-8 pt-4 border-t border-indigo-50">Última actualización: Octubre 2023. Ley Vigente de Ecuador.</p>
            </div>
            <div className="p-4 border-t border-indigo-50 bg-indigo-50/50 text-center">
                <button onClick={onClose} className="bg-gradient-to-r from-brand-blue to-brand-purple text-white px-10 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-0.5">Entendido</button>
            </div>
        </div>
    </div>
);

// PWA Install Modal
const PWAInstallPrompt: React.FC<{ prompt: any, onInstall: () => void, onClose: () => void }> = ({ prompt, onInstall, onClose }) => {
  if (!prompt) return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)] border border-white/60 flex items-center justify-between ring-1 ring-white/50 relative overflow-hidden">
        <div className="flex items-center relative z-10">
           <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-4 rounded-2xl mr-4 shadow-lg shadow-brand-purple/30 text-white">
             <Download className="w-6 h-6" />
           </div>
           <div>
             <h4 className="text-indigo-950 font-black text-lg leading-tight">Instalar App</h4>
             <p className="text-indigo-400 text-xs mt-0.5 font-bold">Experiencia completa y sin esperas</p>
           </div>
        </div>
        <div className="flex items-center space-x-2 relative z-10">
          <button onClick={onClose} className="p-3 text-indigo-300 hover:text-indigo-500 rounded-full hover:bg-indigo-50 transition-colors"><X size={20} /></button>
          <button onClick={onInstall} className="bg-gradient-to-r from-brand-purple to-brand-pink text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-brand-purple/20 hover:scale-105 transition active:scale-95">
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

// NavButton Component
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; label: string }> = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all active:scale-95 duration-300 group`}>
        <div className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-gradient-to-tr from-brand-purple to-brand-pink text-white shadow-lg shadow-brand-purple/40 -translate-y-2' : 'text-indigo-300 hover:text-indigo-500 hover:bg-indigo-50'}`}>
             <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-bold mt-1 transition-all ${active ? 'text-brand-purple opacity-100' : 'text-indigo-300 opacity-0 group-hover:opacity-100'}`}>{label}</span>
    </button>
);

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

    // Master Admin Hardcode
    if (email === 'gtplayec@gmail.com' && password === 'RETO2026') {
      onLogin({ id: 'admin', firstName: 'Admin', lastName: 'Master', age: 30, phone: '0', zone: 'Santo Domingo', sector: 'Centro', email, role: 'admin', isMasterAdmin: true, downloadHistory: [], surveyHistory: [], tickets: [], friends: [], friendRequests: [] }); return;
    }
    if (email === 'retoec@gmail.com' && password === 'RETO123') {
      onLogin({ id: 'test', firstName: 'Usuario', lastName: 'Demo', age: 25, phone: '0999999999', zone: 'Santo Domingo', sector: 'Zaracay', email, role: 'user', downloadHistory: [], surveyHistory: [], tickets: [1024, 2045, 8812], friends: [], friendRequests: [] }); return;
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
        friends: [], friendRequests: [], rank: 'Ciudadano' 
    };
    storageService.saveUser(newUser);
    onLogin(newUser);
  };

  // ... (Keep recovery handlers same as before) ...
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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden grid md:grid-cols-5 relative z-10 min-h-[650px] ring-1 ring-white/50">
        {/* Left Side (Visuals) */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 relative flex-col justify-between p-12 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
            
            <div className="relative z-10">
               <div className="bg-white/20 backdrop-blur-md p-4 rounded-[2rem] inline-block mb-8 border border-white/20 shadow-lg">
                  <AppLogo />
               </div>
               <h1 className="text-5xl font-black leading-tight tracking-tighter mb-6">
                 Tu Voz <br/>
                 <span className="text-brand-yellow drop-shadow-md">Transforma</span> <br/>
                 La Ciudad.
               </h1>
               <p className="text-indigo-100 text-lg font-medium leading-relaxed opacity-90">
                 Únete a la comunidad digital más grande de Santo Domingo. Participa, gana premios y conecta con tu gente.
               </p>
            </div>
            
            <div className="relative z-10 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
            </div>
        </div>

        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="md:hidden mb-8 flex justify-center">
               <div className="scale-125">
                   <AppLogo />
               </div>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
                <div className="max-w-md mx-auto w-full animate-fade-in-up">
                    <div className="mb-8">
                        <h2 className="text-4xl font-black text-indigo-950 mb-2">¡Hola de nuevo! 👋</h2>
                        <p className="text-indigo-400 font-bold text-sm">Ingresa tus datos para continuar la aventura.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center focus-within:border-brand-purple focus-within:ring-4 focus-within:ring-brand-purple/10 transition-all shadow-sm">
                             <div className="p-3 bg-indigo-50 rounded-xl text-brand-purple"><Mail size={20}/></div>
                             <input type="email" placeholder="Correo Electrónico" className="w-full bg-transparent p-3 font-bold text-indigo-900 outline-none placeholder:text-indigo-300" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center focus-within:border-brand-purple focus-within:ring-4 focus-within:ring-brand-purple/10 transition-all shadow-sm">
                             <div className="p-3 bg-indigo-50 rounded-xl text-brand-purple"><KeyRound size={20}/></div>
                             <input type="password" placeholder="Contraseña" className="w-full bg-transparent p-3 font-bold text-indigo-900 outline-none placeholder:text-indigo-300" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        
                        {loginError && (
                            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-sm font-bold flex gap-3 items-center animate-shake">
                                <AlertTriangle size={20}/> {loginError}
                            </div>
                        )}
                        
                        <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-brand-blue/30 hover:scale-[1.02] transition-all active:scale-95">
                            Iniciar Sesión
                        </button>
                        
                        <div className="text-center pt-4">
                            <button type="button" onClick={() => setMode('register')} className="text-indigo-400 font-bold text-sm hover:text-brand-pink transition-colors">
                                ¿No tienes cuenta? <span className="text-brand-purple underline decoration-2 underline-offset-4">Regístrate aquí</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
                <div className="max-w-xl mx-auto w-full animate-fade-in-up">
                     <div className="mb-6 text-center md:text-left">
                        <h2 className="text-3xl font-black text-indigo-950">Crear Cuenta 🚀</h2>
                        <p className="text-indigo-400 font-bold text-sm">Rellena el formulario para unirte.</p>
                     </div>

                    <form onSubmit={handlePreRegister} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 focus-within:border-brand-purple transition-all">
                                <span className="text-[10px] uppercase font-black text-indigo-300 ml-2">Nombre</span>
                                <input placeholder="Tu Nombre" className="w-full bg-transparent p-2 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                             </div>
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 focus-within:border-brand-purple transition-all">
                                <span className="text-[10px] uppercase font-black text-indigo-300 ml-2">Apellido</span>
                                <input placeholder="Tu Apellido" className="w-full bg-transparent p-2 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                             </div>
                        </div>
                        
                        {/* Age & Phone */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center gap-2 focus-within:border-brand-purple transition-all">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400"><UsersIcon size={16}/></div>
                                <input placeholder="Edad" type="number" className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                             </div>
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center gap-2 focus-within:border-brand-purple transition-all">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400"><Smartphone size={16}/></div>
                                <input placeholder="Teléfono" className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                             </div>
                        </div>

                        {/* Email & Pass */}
                        <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center gap-2 focus-within:border-brand-purple transition-all">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400"><Mail size={16}/></div>
                            <input placeholder="Correo Electrónico" type="email" className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 flex items-center gap-2 focus-within:border-brand-purple transition-all">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400"><Lock size={16}/></div>
                            <input placeholder="Contraseña Segura" type="password" className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm placeholder:text-indigo-200" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        
                        {/* Zone & Sector */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 focus-within:border-brand-purple transition-all">
                                 <span className="text-[10px] uppercase font-black text-indigo-300 ml-2">Zona</span>
                                 <select className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value as Zone, sector: ''})}>
                                    <option value="Santo Domingo">Sto. Domingo</option>
                                    <option value="La Concordia">La Concordia</option>
                                 </select>
                             </div>
                             <div className="bg-white border-2 border-indigo-50 rounded-2xl p-2 focus-within:border-brand-purple transition-all">
                                 <span className="text-[10px] uppercase font-black text-indigo-300 ml-2">Sector</span>
                                 <select className="w-full bg-transparent p-1 font-bold text-indigo-900 outline-none text-sm" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                                    <option value="">Selecciona...</option>
                                    {LOCATIONS[formData.zone].map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                             </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full mt-4 bg-gradient-to-r from-brand-pink to-rose-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-pink/20 hover:scale-[1.02] transition-all flex items-center justify-center">
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Crear Cuenta'}
                        </button>
                        
                        <button type="button" onClick={() => setMode('login')} className="w-full text-center text-indigo-400 text-xs font-bold mt-2 hover:text-indigo-600 transition-colors">
                            Volver al inicio
                        </button>
                    </form>
                </div>
            )}

            {/* Verify Code */}
             {mode === 'verify_register' && (
                 <form onSubmit={handleFinalRegister} className="max-w-md mx-auto w-full text-center animate-fade-in-up">
                     <div className="w-24 h-24 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle size={48}/></div>
                     <h2 className="text-3xl font-black mb-2 text-indigo-950">Verifica tu Correo</h2>
                     <p className="text-sm text-indigo-400 mb-8 font-medium">Hemos enviado un código secreto a <br/> <span className="text-indigo-600">{formData.email}</span></p>
                     <input placeholder="000000" maxLength={6} className="w-full bg-indigo-50 border-2 border-indigo-100 p-5 text-center text-4xl font-black tracking-[0.5em] rounded-3xl mb-8 outline-none focus:border-brand-teal focus:bg-white transition-all text-indigo-900" value={inputCode} onChange={e => setInputCode(e.target.value)} />
                     <button type="submit" className="w-full bg-brand-teal text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-teal/30 hover:scale-105 transition-transform">Confirmar Código</button>
                 </form>
             )}
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Component

const Los33View: React.FC = () => {
    // ... (Keep existing implementation)
    const [selectedMember, setSelectedMember] = useState<User | DemoMember | null>(null);
    const [downloading, setDownloading] = useState(false);
    const realUsers = storageService.getUsers().filter(u => u.isMemberOf33);
    const displayMembers = [...realUsers, ...DEMO_MEMBERS_33.filter(d => !realUsers.find(r => r.id === d.id))];

    const handleDownloadCV = () => {
        setDownloading(true);
        setTimeout(() => { setDownloading(false); alert("Descarga completada: hoja_de_vida.pdf"); }, 2000);
    };

    if (selectedMember) {
        return (
            <div className="animate-fade-in pb-28 pt-4 px-4">
                <button 
                    onClick={() => setSelectedMember(null)} 
                    className="flex items-center gap-2 text-indigo-500 font-black mb-6 hover:text-indigo-800 transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-indigo-50"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
                
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white relative">
                     {/* Cover Background */}
                     <div className="h-40 bg-gradient-to-r from-brand-gold via-yellow-500 to-orange-500 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute top-0 right-0 p-6 opacity-30">
                            <Star size={120} className="text-white fill-white"/>
                        </div>
                     </div>

                     {/* Profile Content */}
                     <div className="px-8 pb-10 -mt-16 relative z-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden bg-indigo-50 relative">
                                    {selectedMember.profilePicture ? (
                                        <img src={selectedMember.profilePicture} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white text-4xl font-black text-indigo-300">
                                            {selectedMember.firstName[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-indigo-950 mb-1 leading-tight">
                                {selectedMember.firstName} <br/> {selectedMember.lastName}
                            </h2>
                            <div className="bg-indigo-50 text-indigo-600 font-bold text-xs uppercase px-4 py-1.5 rounded-full tracking-widest mb-8 border border-indigo-100">
                                {selectedMember.role || 'Líder 33'}
                            </div>

                            {/* Info Cards */}
                            <div className="w-full space-y-4 text-left">
                                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-blue/10 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="font-black text-brand-blue text-sm flex items-center gap-2 mb-2 relative z-10">
                                        <GraduationCap size={20}/> Formación
                                    </h4>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed relative z-10">
                                        {selectedMember.academic || 'Información en proceso.'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-[2rem] border border-teal-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-teal/10 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="font-black text-brand-teal text-sm flex items-center gap-2 mb-2 relative z-10">
                                        <BriefcaseIcon size={20}/> Experiencia
                                    </h4>
                                    <p className="text-sm text-teal-900 font-medium leading-relaxed relative z-10">
                                        {selectedMember.publicExp || 'Información en proceso.'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-[2rem] border border-pink-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-pink/10 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="font-black text-brand-pink text-sm flex items-center gap-2 mb-2 relative z-10">
                                        <Heart size={20}/> Comunitario
                                    </h4>
                                    <p className="text-sm text-pink-900 font-medium leading-relaxed relative z-10">
                                        {selectedMember.community || 'Información en proceso.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-32 px-4 pt-4">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-[3rem] p-10 text-white text-center relative overflow-hidden shadow-2xl mb-8 border border-white/10">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                 <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/20 rounded-full blur-[60px]"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-purple/40 rounded-full blur-[60px]"></div>
                 
                 <div className="relative z-10">
                     <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md border border-white/20">
                        <Star className="text-brand-gold fill-brand-gold w-8 h-8 animate-pulse-slow" />
                     </div>
                     <h2 className="text-5xl font-black mb-2 tracking-tighter drop-shadow-lg">LOS 33</h2>
                     <p className="text-indigo-200 font-medium text-sm tracking-wide uppercase">Líderes de Transformación</p>
                 </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayMembers.map((member, index) => (
                    <div 
                        key={member.id} 
                        onClick={() => setSelectedMember(member)} 
                        className="bg-white rounded-[2.5rem] p-4 shadow-lg border border-transparent hover:border-brand-gold/50 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden hover:-translate-y-1 duration-300"
                    >
                        {/* Number Badge */}
                        <div className="absolute top-4 left-4 text-[10px] font-black text-indigo-200 opacity-50 group-hover:text-brand-gold group-hover:opacity-100 transition-all">
                            #{String(index + 1).padStart(2, '0')}
                        </div>

                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-gold via-yellow-300 to-white shadow-md mb-3 group-hover:scale-105 transition-transform relative z-10">
                             <div className="w-full h-full rounded-full bg-indigo-50 overflow-hidden relative border-2 border-white">
                                {member.profilePicture ? (
                                    <img src={member.profilePicture} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-300 bg-white">
                                        {member.firstName[0]}
                                    </div>
                                )}
                             </div>
                        </div>
                        
                        <h3 className="font-bold text-indigo-950 text-sm leading-tight mb-1 relative z-10">
                            {member.firstName} <br/> {member.lastName}
                        </h3>
                        <p className="text-[10px] uppercase font-bold text-brand-gold tracking-wider mb-3 relative z-10">
                            {member.role?.split(' ')[0] || 'Líder'}
                        </p>
                        
                        <div className="mt-auto w-full">
                            <span className="block w-full py-2 rounded-xl bg-indigo-50 text-indigo-400 text-[10px] font-black uppercase group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                Ver Perfil
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Add onUserUpdate Prop for Dashboard
const Dashboard: React.FC<{ user: User, onLogout: () => void, onUserUpdate: (u: User) => void }> = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<Post[]>(storageService.getPosts());
  const [surveys, setSurveys] = useState<Survey[]>(storageService.getSurveys());
  const [prizes, setPrizes] = useState<Prize[]>(storageService.getPrizes());
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  
  // Post Targeting State
  const [postTargetType, setPostTargetType] = useState<'global' | 'sector' | 'age'>('global');
  const [postTargetSector, setPostTargetSector] = useState('');
  const [postTargetMinAge, setPostTargetMinAge] = useState('');
  const [postTargetMaxAge, setPostTargetMaxAge] = useState('');

  const [ticketModal, setTicketModal] = useState<number | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Delivery Form State
  const [deliveryData, setDeliveryData] = useState({address: '', reference: '', phone: user.phone});
  const [deliverySaved, setDeliverySaved] = useState(false);
  
  // Los 33 Edit Profile State
  const [edit33Data, setEdit33Data] = useState({ academic: user.academic || '', publicExp: user.publicExp || '', community: user.community || '' });
  const [isEditing33, setIsEditing33] = useState(false);

  const postFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Admin State
  const [adminView, setAdminView] = useState<'surveys' | 'raffle' | 'users' | 'prizes'>('surveys');
  const [allUsers, setAllUsers] = useState<User[]>(storageService.getUsers());
  const [resetStatus, setResetStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
  
  // Admin User Filtering
  const [filterSector, setFilterSector] = useState('');
  const [filterAgeMin, setFilterAgeMin] = useState('');
  const [filterAgeMax, setFilterAgeMax] = useState('');
  
  // Admin Raffle Results State
  const [raffleResult, setRaffleResult] = useState<{winner: {name: string, ticket: number}, voided: number[]} | null>(null);

  // Admin Survey Create State
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyOptions, setNewSurveyOptions] = useState<{label: string, image: string}[]>([{label: '', image: ''}, {label: '', image: ''}]);
  
  // Admin Survey Stats
  const [surveyStats, setSurveyStats] = useState<Survey | null>(null);

  // Admin Prize Edit State
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const userPoints = user.surveyHistory.length * 10;
  const currentRank = USER_RANKS.slice().reverse().find(r => userPoints >= r.minPoints) || USER_RANKS[0];

  // Refresh posts when entering feed
  useEffect(() => {
      if (activeTab === 'feed') {
          setPosts(storageService.getPosts());
      }
  }, [activeTab]);

  // --- Handlers ---
  
  const handleCreatePost = () => {
      if (!newPostContent.trim() && !newPostImage) return;
      
      const targetAudience = {
          type: postTargetType,
          sector: postTargetType === 'sector' ? postTargetSector : undefined,
          minAge: postTargetType === 'age' && postTargetMinAge ? parseInt(postTargetMinAge) : undefined,
          maxAge: postTargetType === 'age' && postTargetMaxAge ? parseInt(postTargetMaxAge) : undefined
      };

      const newPost: Post = {
          id: Date.now().toString(),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userAvatar: user.profilePicture,
          content: newPostContent,
          image: newPostImage || undefined,
          isGold: user.isMemberOf33, // Flag for Los 33 styling
          targetAudience,
          likes: [],
          shares: 0,
          comments: [],
          date: new Date().toISOString()
      };
      const updatedPosts = storageService.addPost(newPost);
      setPosts(updatedPosts);
      setNewPostContent('');
      setNewPostImage(null);
      // Reset targets
      setPostTargetType('global');
      setPostTargetSector('');
      setPostTargetMinAge('');
      setPostTargetMaxAge('');
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const base64 = await convertFileToBase64(e.target.files[0]);
          setNewPostImage(base64);
      }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const base64 = await convertFileToBase64(e.target.files[0]);
          const updatedUser = { ...user, profilePicture: base64 };
          storageService.saveUser(updatedUser);
          onUserUpdate(updatedUser); // Updated to use prop instead of reload
      }
  };
  
  const handleSave33Profile = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedUser = { ...user, ...edit33Data };
      storageService.saveUser(updatedUser);
      onUserUpdate(updatedUser);
      setIsEditing33(false);
  };

  const handleVote = (surveyId: string, optionId: string) => {
      if (user.surveyHistory.includes(surveyId)) {
          alert("Ya has votado en esta encuesta.");
          return;
      }
      try {
          const result = storageService.submitVote(surveyId, optionId, user);
          setSurveys(storageService.getSurveys());
          // Update the user state via parent callback instead of reloading
          onUserUpdate(result.user);
          if (result.ticketNumber) {
              setTicketModal(result.ticketNumber);
          } else {
              alert("Voto registrado. Como miembro de Los 33, tu participación cuenta pero no generas tickets para el sorteo.");
          }
      } catch (e) {
          alert("Error al votar");
      }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedUser = storageService.saveDeliveryDetails(user.id, {
          ...deliveryData,
          status: 'pending'
      });
      if (updatedUser) {
          onUserUpdate(updatedUser);
          setDeliverySaved(true);
      }
  };

  const handleDownloadDatabase = () => {
      if (!user.isMasterAdmin) return;
      const csvData = allUsers.map(u => ({
          ID: u.id,
          Nombre: u.firstName,
          Apellido: u.lastName,
          Email: u.email,
          Edad: u.age,
          Telefono: u.phone,
          Zona: u.zone,
          Sector: u.sector,
          Rol: u.role,
          Tickets: u.tickets.join('; '),
          Es33: u.isMemberOf33 ? 'Si' : 'No'
      }));
      downloadCSV(csvData, `Base_Usuarios_RETO_${new Date().toLocaleDateString()}.csv`);
  };

  // --- Admin Handlers ---
  
  const handleAdminResetInit = () => {
      setResetStatus('confirming');
  };

  const handleAdminResetConfirm = () => {
      try {
          storageService.resetWeeklyDraw();
          setRaffleResult(null); // Clear previous results
          setResetStatus('success');
      } catch (error) {
          console.error(error);
          setResetStatus('error');
      }
  };

  const handleRunRaffle = () => {
      try {
          const result = storageService.runWeeklyRaffle();
          if (result.winner) {
              setRaffleResult(result as any);
          }
      } catch (e: any) {
          alert(e.message || "Error al realizar el sorteo");
      }
  };

  const handlePromoteUser = (userId: string) => {
      storageService.toggleLos33(userId);
      setAllUsers(storageService.getUsers());
  };
  
  const handleToggleAdmin = (userId: string) => {
      // Logic: Anyone admin can make admin, only master can remove admin
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) return;
      
      const isCurrentlyAdmin = targetUser.role === 'admin';
      
      if (isCurrentlyAdmin && !user.isMasterAdmin) {
          alert("Solo el Administrador Master puede eliminar permisos de administrador.");
          return;
      }
      
      storageService.toggleAdminRole(userId);
      setAllUsers(storageService.getUsers());
  };

  const handleChangeRank = (userId: string, newRank: string) => {
      storageService.updateUserRank(userId, newRank);
      setAllUsers(storageService.getUsers());
  };

  const handleDeleteSurvey = (id: string) => {
      if(confirm("Eliminar encuesta?")) {
          storageService.deleteSurvey(id);
          setSurveys(storageService.getSurveys());
      }
  }

  // Visual Survey Creation Logic
  const addSurveyOption = () => setNewSurveyOptions([...newSurveyOptions, {label: '', image: ''}]);
  
  const updateSurveyOption = (idx: number, field: 'label' | 'image', value: string) => {
      const newOpts = [...newSurveyOptions];
      if(field === 'label') newOpts[idx].label = value;
      else newOpts[idx].image = value;
      setNewSurveyOptions(newOpts);
  };

  const handleSurveyOptionImage = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files?.[0]){
          const base64 = await convertFileToBase64(e.target.files[0]);
          updateSurveyOption(idx, 'image', base64);
      }
  };

  const handleCreateVisualSurvey = (e: React.FormEvent) => {
      e.preventDefault();
      const optionsPayload = newSurveyOptions
        .filter(o => o.label.trim() !== '')
        .map((o, i) => ({
            id: `opt-${Date.now()}-${i}`,
            label: o.label,
            imageUrl: o.image || undefined,
            votes: 0
        }));

      const newSurvey: Survey = {
          id: Date.now().toString(),
          title: newSurveyTitle,
          category: 'Nacional', 
          active: true,
          options: optionsPayload,
          voteRecords: []
      };
      storageService.createSurvey(newSurvey);
      setSurveys(storageService.getSurveys());
      setNewSurveyTitle('');
      setNewSurveyOptions([{label: '', image: ''}, {label: '', image: ''}]);
      alert("Encuesta Creada");
  };

  // Prize Management
  const handleSavePrize = () => {
      if (!editingPrize) return;
      if (prizes.find(p => p.id === editingPrize.id)) {
          storageService.updatePrize(editingPrize);
      } else {
          storageService.addPrize(editingPrize);
      }
      setPrizes(storageService.getPrizes());
      setEditingPrize(null);
  };

  const handleDeletePrize = (id: string) => {
      if(confirm("¿Eliminar premio?")){
          storageService.deletePrize(id);
          setPrizes(storageService.getPrizes());
      }
  }

  // --- Render Helpers ---

  const renderSurveyStats = (survey: Survey) => {
      if (!survey.voteRecords) return <p className="text-sm text-indigo-400">Sin datos detallados.</p>;

      // Aggregate Data
      const ageGroups = { '16-29': 0, '30-50': 0, '50+': 0 };
      const sectorCounts: Record<string, number> = {};

      survey.voteRecords.forEach(record => {
          // Age
          if (record.userAge < 30) ageGroups['16-29']++;
          else if (record.userAge <= 50) ageGroups['30-50']++;
          else ageGroups['50+']++;

          // Sector
          sectorCounts[record.userSector] = (sectorCounts[record.userSector] || 0) + 1;
      });

      const sortedSectors = Object.entries(sectorCounts).sort((a,b) => b[1] - a[1]).slice(0, 5); // Top 5

      return (
          <div className="fixed inset-0 z-[100] bg-indigo-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black text-indigo-950 pr-4">{survey.title}</h3>
                      <button onClick={() => setSurveyStats(null)} className="p-2 bg-indigo-50 rounded-full hover:bg-indigo-100"><X size={20} className="text-indigo-400"/></button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                      {/* Age Stats */}
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><Users size={18}/> Votos por Edad</h4>
                          <div className="space-y-3">
                              {Object.entries(ageGroups).map(([label, count]) => (
                                  <div key={label}>
                                      <div className="flex justify-between text-xs font-bold text-indigo-600 mb-1">
                                          <span>{label} años</span>
                                          <span>{count} votos</span>
                                      </div>
                                      <div className="h-3 bg-white rounded-full overflow-hidden">
                                          <div className="h-full bg-brand-purple" style={{width: `${survey.voteRecords!.length ? (count / survey.voteRecords!.length * 100) : 0}%`}}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Sector Stats */}
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><MapPin size={18}/> Top 5 Sectores</h4>
                          <div className="space-y-3">
                              {sortedSectors.map(([sector, count]) => (
                                  <div key={sector} className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                      <span className="text-xs font-bold text-indigo-800">{sector}</span>
                                      <span className="bg-brand-teal text-white text-[10px] font-black px-2 py-1 rounded-md">{count}</span>
                                  </div>
                              ))}
                              {sortedSectors.length === 0 && <p className="text-xs text-indigo-400 italic">No hay datos de sectores aún.</p>}
                          </div>
                      </div>
                  </div>
                  
                  {/* Detailed Options Breakdown (Simple) */}
                  <div className="mt-6">
                      <h4 className="font-bold text-indigo-900 mb-2">Detalle por Opción</h4>
                      <div className="grid grid-cols-2 gap-2">
                          {survey.options.map(opt => (
                              <div key={opt.id} className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center">
                                  <p className="text-xs text-indigo-500 font-medium">{opt.label}</p>
                                  <p className="text-xl font-black text-indigo-900">{opt.votes}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const renderAdminContent = () => {
      // Filter Users Logic
      const filteredUsers = allUsers.filter(u => {
          if (filterSector && u.sector !== filterSector) return false;
          if (filterAgeMin && u.age < parseInt(filterAgeMin)) return false;
          if (filterAgeMax && u.age > parseInt(filterAgeMax)) return false;
          return true;
      });

      return (
          <div className="p-4 pb-28 space-y-6">
              <h2 className="text-2xl font-black text-indigo-950 mb-4 flex items-center gap-2">
                  <Shield size={24} className="text-brand-blue"/> Panel Master
              </h2>
              
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  <button onClick={() => setAdminView('surveys')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${adminView === 'surveys' ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-indigo-400'}`}>Encuestas</button>
                  <button onClick={() => setAdminView('prizes')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${adminView === 'prizes' ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-indigo-400'}`}>Premios</button>
                  <button onClick={() => setAdminView('users')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${adminView === 'users' ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-indigo-400'}`}>Usuarios</button>
                  <button onClick={() => setAdminView('raffle')} className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${adminView === 'raffle' ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-indigo-400'}`}>Reset Sorteo</button>
              </div>

              {adminView === 'surveys' && (
                  <div className="space-y-4">
                       <form onSubmit={handleCreateVisualSurvey} className="bg-white p-6 rounded-[2rem] shadow-lg border border-indigo-50">
                          <h3 className="font-bold mb-4 text-indigo-900">Nueva Encuesta</h3>
                          <input className="w-full bg-indigo-50 p-4 rounded-2xl mb-4 text-sm font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-brand-teal/50" placeholder="Título de la encuesta..." value={newSurveyTitle} onChange={e => setNewSurveyTitle(e.target.value)} required />
                          <div className="space-y-3 mb-4">
                              {newSurveyOptions.map((opt, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                      <div className="relative w-12 h-12 bg-indigo-50 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer border border-indigo-100 hover:border-brand-teal transition-colors flex items-center justify-center">
                                          {opt.image ? <img src={opt.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-indigo-300" size={20} />}
                                          <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleSurveyOptionImage(idx, e)} accept="image/*" />
                                      </div>
                                      <input className="flex-1 bg-indigo-50 p-3 rounded-xl text-sm font-medium text-indigo-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-teal/20" placeholder={`Opción ${idx + 1}`} value={opt.label} onChange={(e) => updateSurveyOption(idx, 'label', e.target.value)} required={idx < 2} />
                                  </div>
                              ))}
                              <button type="button" onClick={addSurveyOption} className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:text-teal-600 transition-colors">+ Agregar Opción</button>
                          </div>
                          <button type="submit" className="w-full bg-brand-teal text-white px-4 py-3 rounded-xl text-sm font-black shadow-lg shadow-brand-teal/30 hover:scale-105 transition-transform">Crear Encuesta</button>
                      </form>
                      {/* List of surveys */}
                      <div className="space-y-3">
                          {surveys.map(s => (
                              <div key={s.id} className="bg-white p-4 rounded-2xl border border-indigo-50 flex flex-col gap-3 shadow-sm">
                                  <div className="flex justify-between items-start">
                                      <span className="font-medium text-sm text-indigo-900 w-2/3">{s.title}</span>
                                      <div className="flex gap-2">
                                          {user.isMasterAdmin && (
                                              <button onClick={() => setSurveyStats(s)} className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-100 transition-colors" title="Ver Estadísticas"><BarChart3 size={16}/></button>
                                          )}
                                          <button onClick={() => handleDeleteSurvey(s.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      {surveyStats && renderSurveyStats(surveyStats)}
                  </div>
              )}

              {adminView === 'prizes' && (
                  <div className="space-y-4">
                      {editingPrize ? (
                          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-brand-teal/20 animate-fade-in-up">
                              <h3 className="font-bold mb-4 text-indigo-900">{editingPrize.id.startsWith('new') ? 'Nuevo Premio' : 'Editar Premio'}</h3>
                              <div className="space-y-3">
                                  <input className="w-full bg-indigo-50 p-3 rounded-xl text-sm font-bold text-indigo-900 outline-none" placeholder="Nombre" value={editingPrize.name} onChange={e => setEditingPrize({...editingPrize, name: e.target.value})} />
                                  <textarea className="w-full bg-indigo-50 p-3 rounded-xl text-sm text-indigo-900 outline-none" placeholder="Descripción" value={editingPrize.description} onChange={e => setEditingPrize({...editingPrize, description: e.target.value})} />
                                  <div className="w-full h-32 bg-indigo-50 rounded-xl overflow-hidden relative border-2 border-dashed border-indigo-200 flex items-center justify-center group hover:border-brand-teal transition-colors">
                                      {editingPrize.image ? <img src={editingPrize.image} className="w-full h-full object-cover" /> : <div className="text-indigo-300 text-xs font-bold">Subir Imagen</div>}
                                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                                          if(e.target.files?.[0]) {
                                              const b64 = await convertFileToBase64(e.target.files[0]);
                                              setEditingPrize({...editingPrize, image: b64});
                                          }
                                      }} accept="image/*" />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                      <button onClick={() => setEditingPrize(null)} className="flex-1 bg-indigo-50 text-indigo-400 py-3 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">Cancelar</button>
                                      <button onClick={handleSavePrize} className="flex-1 bg-brand-teal text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-teal/30">Guardar</button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <button onClick={() => setEditingPrize({id: `new-${Date.now()}`, name: '', description: '', image: ''})} className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-300 font-bold hover:border-brand-teal hover:text-brand-teal transition-all bg-white">+ Agregar Nuevo Premio</button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                          {prizes.map(p => (
                              <div key={p.id} className="bg-white p-3 rounded-2xl border border-indigo-50 relative group shadow-sm hover:shadow-md transition-shadow">
                                  <img src={p.image} className="w-full h-24 object-cover rounded-xl mb-2 bg-indigo-50" />
                                  <p className="font-bold text-xs truncate text-indigo-900">{p.name}</p>
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setEditingPrize(p)} className="p-1.5 bg-white text-brand-blue rounded-lg shadow-sm"><Edit3 size={14}/></button>
                                      <button onClick={() => handleDeletePrize(p.id)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {adminView === 'users' && (
                  <div className="space-y-4">
                      {/* FILTERS & DOWNLOAD */}
                      <div className="bg-white p-4 rounded-[1.5rem] border border-indigo-50 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-black text-indigo-400 uppercase flex items-center gap-1"><Filter size={12}/> Filtros</h4>
                              {user.isMasterAdmin && (
                                  <button onClick={handleDownloadDatabase} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md hover:bg-green-600 transition-colors">
                                      <FileDown size={12}/> Descargar CSV
                                  </button>
                              )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                              <select className="bg-indigo-50 p-2 rounded-xl text-xs font-bold text-indigo-700 outline-none" value={filterSector} onChange={e => setFilterSector(e.target.value)}>
                                  <option value="">Todos los Sectores</option>
                                  {LOCATIONS['Santo Domingo'].map(s => <option key={s} value={s}>{s}</option>)}
                                  {LOCATIONS['La Concordia'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <div className="flex gap-1">
                                  <input placeholder="Edad Min" type="number" className="w-1/2 bg-indigo-50 p-2 rounded-xl text-xs font-bold outline-none" value={filterAgeMin} onChange={e => setFilterAgeMin(e.target.value)} />
                                  <input placeholder="Edad Max" type="number" className="w-1/2 bg-indigo-50 p-2 rounded-xl text-xs font-bold outline-none" value={filterAgeMax} onChange={e => setFilterAgeMax(e.target.value)} />
                              </div>
                          </div>
                          <div className="text-[10px] text-indigo-300 font-bold text-right">
                              Mostrando {filteredUsers.length} usuarios
                          </div>
                      </div>

                      {filteredUsers.map(u => (
                          <div key={u.id} className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-300 overflow-hidden relative">
                                      {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover"/> : u.firstName[0]}
                                      {u.isWinner && <div className="absolute top-0 right-0 w-3 h-3 bg-brand-gold rounded-full border border-white animate-pulse"></div>}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between">
                                          <p className="font-bold text-sm text-indigo-950 flex items-center gap-1">
                                              {u.firstName} {u.lastName} 
                                              {u.role === 'admin' && <Shield size={12} className="text-brand-blue" />}
                                          </p>
                                          {u.deliveryDetails && <Gift size={16} className="text-brand-pink" />}
                                      </div>
                                      <p className="text-[10px] text-indigo-400">{u.email} • {u.age} años • {u.sector}</p>
                                  </div>
                              </div>
                              
                              {/* Show Delivery Info if available */}
                              {u.deliveryDetails && (
                                  <div className="bg-green-50 p-3 rounded-xl mb-3 text-xs border border-green-100 text-green-800">
                                      <p className="font-bold flex items-center gap-1 mb-1"><Truck size={12}/> Datos de Envío:</p>
                                      <p>{u.deliveryDetails.address}</p>
                                      <p className="opacity-70">Ref: {u.deliveryDetails.reference}</p>
                                      <p className="opacity-70">Tel: {u.deliveryDetails.phone}</p>
                                  </div>
                              )}

                              <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                      <select className="bg-indigo-50 text-xs font-bold p-2 rounded-lg border-none outline-none text-indigo-700 flex-1" value={u.rank || 'Ciudadano'} onChange={(e) => handleChangeRank(u.id, e.target.value)}>{USER_RANKS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}</select>
                                      <button onClick={() => handlePromoteUser(u.id)} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${u.isMemberOf33 ? 'bg-brand-gold text-white shadow-md' : 'bg-indigo-50 text-indigo-400'}`}><Star size={14} fill={u.isMemberOf33 ? "currentColor" : "none"} /> {u.isMemberOf33 ? 'Es 33' : 'Hacer 33'}</button>
                                  </div>
                                  <button onClick={() => handleToggleAdmin(u.id)} className={`w-full p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${u.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                      {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              
              {/* UPDATED RAFFLE UI */}
              {adminView === 'raffle' && (
                  <div className="space-y-6">
                      {/* 1. RAFFLE ACTION */}
                      <div className="bg-gradient-to-r from-brand-blue to-brand-teal p-8 rounded-[2rem] text-center text-white shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse-slow"></div>
                          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-purple/40 rounded-full blur-3xl"></div>
                          
                          <Gift size={48} className="mx-auto mb-4 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                          <h3 className="text-2xl font-black mb-2 relative z-10">Sorteo Semanal</h3>
                          <p className="text-blue-100 text-sm mb-6 relative z-10 font-medium">Generar ganador y anular tickets con un solo clic.</p>
                          <button onClick={handleRunRaffle} className="w-full bg-white text-brand-blue py-4 rounded-xl font-black shadow-lg hover:scale-105 transition-transform relative z-10">
                              REALIZAR SORTEO AHORA
                          </button>
                      </div>

                      {/* 2. RESULTS DISPLAY */}
                      {raffleResult && (
                          <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-brand-gold animate-fade-in-up relative overflow-hidden">
                              <div className="absolute inset-0 bg-brand-gold/5"></div>
                              <h4 className="text-center text-brand-gold font-black uppercase tracking-widest mb-4 relative z-10">Resultados</h4>
                              <div className="text-center mb-6 relative z-10">
                                  <p className="text-indigo-300 text-xs font-bold uppercase">Ganador</p>
                                  <p className="text-3xl font-black text-indigo-900">{raffleResult.winner.name}</p>
                                  <div className="flex items-center justify-center gap-2 mt-2">
                                      <PartyPopper className="text-brand-gold" size={20}/>
                                      <span className="bg-brand-gold text-white px-3 py-1 rounded-full font-mono font-bold text-lg inline-block shadow-md">Ticket #{raffleResult.winner.ticket}</span>
                                      <PartyPopper className="text-brand-gold" size={20}/>
                                  </div>
                              </div>
                              <div className="bg-indigo-50 p-4 rounded-xl relative z-10">
                                  <p className="text-indigo-400 text-xs font-bold uppercase mb-2">Tickets Anulados (10)</p>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                      {raffleResult.voided.map(t => (
                                          <span key={t} className="bg-white text-indigo-300 px-2 py-1 rounded-md font-mono text-xs line-through border border-indigo-100">{t}</span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* 3. DANGER ZONE (RESET) */}
                      <div className="bg-white p-8 rounded-[2rem] text-center border-2 border-red-100 relative overflow-hidden mt-8 shadow-sm">
                          <AlertTriangle size={32} className="text-red-400 mx-auto mb-2 relative z-10" />
                          <h3 className="text-lg font-black text-indigo-900 mb-1 relative z-10">Zona de Peligro</h3>
                          <p className="text-indigo-400 text-xs mb-4 relative z-10">
                            Elimina todos los tickets para iniciar nueva semana.
                          </p>

                          {resetStatus === 'idle' && (
                              <button onClick={handleAdminResetInit} className="w-full bg-red-50 text-red-500 py-3 rounded-xl font-bold shadow-sm hover:bg-red-100 transition-colors relative z-10 text-sm border border-red-200">
                                  REINICIAR TODO
                              </button>
                          )}

                          {resetStatus === 'confirming' && (
                              <div className="bg-red-50 p-4 rounded-xl animate-fade-in-up relative z-10">
                                  <p className="text-red-800 font-bold text-sm mb-4">¿Confirmas reinicio total?</p>
                                  <div className="flex gap-2">
                                      <button onClick={() => setResetStatus('idle')} className="flex-1 bg-white text-indigo-600 py-2 rounded-lg font-bold text-xs shadow-sm">No</button>
                                      <button onClick={handleAdminResetConfirm} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-xs shadow-md">Sí</button>
                                  </div>
                              </div>
                          )}

                          {resetStatus === 'success' && (
                              <div className="bg-green-50 p-4 rounded-xl animate-fade-in-up flex items-center justify-center gap-3 relative z-10">
                                  <CheckCircle className="text-green-500" />
                                  <span className="text-green-800 font-bold text-sm">¡Reiniciado!</span>
                                  <button onClick={() => setResetStatus('idle')} className="ml-2 text-xs text-green-600 underline">OK</button>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )
  }

  const renderContent = () => {
    // Admin Override
    if (activeTab === 'admin' && user.role === 'admin') return renderAdminContent();

    switch(activeTab) {
      case 'feed':
        // Filter Posts based on Target Audience
        const visiblePosts = posts.filter(post => {
            // Global posts or user's own posts always visible
            if (!post.targetAudience || post.targetAudience.type === 'global' || post.userId === user.id) return true;
            
            // Check Sector
            if (post.targetAudience.type === 'sector' && post.targetAudience.sector) {
                return post.targetAudience.sector === user.sector;
            }
            
            // Check Age
            if (post.targetAudience.type === 'age') {
                const min = post.targetAudience.minAge || 0;
                const max = post.targetAudience.maxAge || 100;
                return user.age >= min && user.age <= max;
            }
            
            return true;
        });

        return (
          <div className="space-y-6 p-4 pb-28 animate-fade-in">
             {/* Feed Header / Creator */}
             <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 border border-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-pink p-[2px] flex-shrink-0">
                         <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-brand-purple overflow-hidden">
                             {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover"/> : user.firstName[0]}
                         </div>
                    </div>
                    <textarea 
                        className="flex-1 bg-indigo-50/50 rounded-2xl p-4 text-indigo-900 text-sm font-medium border border-transparent focus:bg-white focus:border-brand-purple/20 focus:ring-4 focus:ring-brand-purple/10 resize-none h-20 placeholder:text-indigo-300 outline-none transition-all"
                        placeholder={`¿Qué estás pensando hoy, ${user.firstName}?`}
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                    />
                </div>
                
                {/* Admin Targeting Options */}
                {user.role === 'admin' && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 flex items-center gap-1"><Shield size={10}/> Segmentar Publicación</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button onClick={() => setPostTargetType('global')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${postTargetType === 'global' ? 'bg-brand-purple text-white' : 'bg-white text-indigo-400'}`}><Globe size={12}/> Global</button>
                            <button onClick={() => setPostTargetType('sector')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${postTargetType === 'sector' ? 'bg-brand-purple text-white' : 'bg-white text-indigo-400'}`}><Map size={12}/> Por Sector</button>
                            <button onClick={() => setPostTargetType('age')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${postTargetType === 'age' ? 'bg-brand-purple text-white' : 'bg-white text-indigo-400'}`}><Users size={12}/> Por Edad</button>
                        </div>
                        
                        {postTargetType === 'sector' && (
                            <select className="w-full mt-2 bg-white p-2 rounded-lg text-xs font-bold text-indigo-800 outline-none" value={postTargetSector} onChange={e => setPostTargetSector(e.target.value)}>
                                <option value="">Selecciona Sector...</option>
                                {LOCATIONS['Santo Domingo'].map(s => <option key={s} value={s}>{s}</option>)}
                                {LOCATIONS['La Concordia'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        )}
                        
                        {postTargetType === 'age' && (
                            <div className="flex gap-2 mt-2 items-center">
                                <input type="number" placeholder="Min" className="w-16 bg-white p-2 rounded-lg text-xs font-bold text-indigo-800 outline-none" value={postTargetMinAge} onChange={e => setPostTargetMinAge(e.target.value)} />
                                <span className="text-xs text-indigo-400">-</span>
                                <input type="number" placeholder="Max" className="w-16 bg-white p-2 rounded-lg text-xs font-bold text-indigo-800 outline-none" value={postTargetMaxAge} onChange={e => setPostTargetMaxAge(e.target.value)} />
                                <div className="flex gap-1 overflow-x-auto">
                                    <button onClick={() => {setPostTargetMinAge('16'); setPostTargetMaxAge('29')}} className="bg-white px-2 py-1 rounded-md text-[10px] text-indigo-500 font-bold whitespace-nowrap">Joven</button>
                                    <button onClick={() => {setPostTargetMinAge('30'); setPostTargetMaxAge('64')}} className="bg-white px-2 py-1 rounded-md text-[10px] text-indigo-500 font-bold whitespace-nowrap">Adulto</button>
                                    <button onClick={() => {setPostTargetMinAge('65'); setPostTargetMaxAge('100')}} className="bg-white px-2 py-1 rounded-md text-[10px] text-indigo-500 font-bold whitespace-nowrap">Mayor</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {newPostImage && (
                    <div className="mb-4 relative group">
                        <img src={newPostImage} className="rounded-2xl max-h-48 w-full object-cover shadow-md" />
                        <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"><X size={16}/></button>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-indigo-50">
                    <button onClick={() => postFileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-brand-pink transition-colors bg-indigo-50 px-3 py-2 rounded-xl">
                        <ImageIcon size={18} /> Foto
                    </button>
                    <input type="file" ref={postFileInputRef} className="hidden" accept="image/*" onChange={handlePostImageUpload} />
                    
                    <button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() && !newPostImage}
                        className="bg-gradient-to-r from-brand-blue to-brand-purple text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-blue/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Publicar
                    </button>
                </div>
             </div>

            <h2 className="text-xl font-black text-indigo-950 px-2 flex items-center gap-2">
                <Sparkles className="text-brand-yellow drop-shadow-sm" size={24} /> Muro Comunitario
            </h2>

            {visiblePosts.map(post => (
              <div key={post.id} className={`rounded-[2.5rem] shadow-lg border overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ${post.isGold ? 'bg-gradient-to-br from-white via-indigo-50 to-brand-gold/10 border-brand-gold/30' : 'bg-white border-white'}`}>
                <div className="flex justify-between items-center px-6 pt-4">
                    {post.isGold && <div className="bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Post Oficial • Los 33</div>}
                    {post.targetAudience && post.targetAudience.type !== 'global' && (
                        <div className="bg-indigo-100 text-indigo-500 text-[10px] font-bold uppercase px-2 py-1 rounded-md flex items-center gap-1">
                            {post.targetAudience.type === 'age' ? <Users size={10}/> : <Map size={10}/>} 
                            {post.targetAudience.type === 'age' ? `Edad: ${post.targetAudience.minAge}-${post.targetAudience.maxAge}` : `Sector: ${post.targetAudience.sector}`}
                        </div>
                    )}
                </div>
                <div className="p-6 pt-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-indigo-400 border-2 shadow-sm overflow-hidden ${post.isGold ? 'border-brand-gold bg-brand-gold/10' : 'border-indigo-50 bg-indigo-50'}`}>
                        {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover"/> : post.userName[0]}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg leading-tight ${post.isGold ? 'text-brand-blue' : 'text-indigo-950'}`}>{post.userName} {post.isGold && <Star size={14} className="inline text-brand-gold fill-current"/>}</h3>
                        <p className="text-xs text-indigo-300 font-medium flex items-center gap-1">
                            <Clock size={12} /> {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-indigo-900 mb-4 leading-relaxed font-medium text-lg">{post.content}</p>
                    
                    {post.image && (
                        <div className="mb-4 rounded-[1.5rem] overflow-hidden shadow-md">
                            <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="flex items-center justify-between text-indigo-300 text-sm font-bold border-t border-indigo-50 pt-4 mt-2">
                      <button className="flex items-center gap-2 hover:text-brand-pink transition-colors group">
                          <Heart size={20} className="group-hover:fill-brand-pink group-active:scale-125 transition-transform" /> 
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
          <div className="space-y-6 p-4 pb-28 animate-fade-in">
            {/* Same Survey implementation */}
             <div className="bg-gradient-to-br from-brand-pink to-brand-purple p-8 rounded-[2.5rem] text-white shadow-2xl shadow-brand-pink/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse-slow"></div>
                <h2 className="text-3xl font-black mb-2 relative z-10">Tu Voz Cuenta</h2>
                <p className="opacity-90 font-medium relative z-10 text-pink-100">Solo números y porcentajes, transparencia total.</p>
            </div>

            {surveys.map(survey => (
              <div key={survey.id} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-white">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl text-indigo-950 leading-tight w-3/4">{survey.title}</h3>
                    <span className="bg-indigo-50 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{survey.category}</span>
                </div>
                
                <div className={survey.options.some(opt => opt.imageUrl) ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                    {survey.options.map((opt, idx) => {
                        const maxVotes = Math.max(...survey.options.map(o => o.votes));
                        const totalVotes = survey.options.reduce((acc, curr) => acc + curr.votes, 0);
                        const percent = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : "0";
                        const isLeader = opt.votes === maxVotes && maxVotes > 0;

                        if (opt.imageUrl) {
                             return (
                                <button key={opt.id} onClick={() => handleVote(survey.id, opt.id)} className={`relative group overflow-hidden rounded-2xl aspect-square border-4 transition-all shadow-md ${isLeader ? 'border-brand-gold ring-4 ring-brand-gold/20' : 'border-transparent hover:border-brand-pink hover:scale-[1.02]'}`}>
                                    <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/90 to-transparent p-4 pt-10 text-left">
                                        <span className="text-white font-bold text-sm block leading-tight mb-1">{opt.label}</span>
                                        <div className="flex justify-between items-end">
                                            <span className="text-brand-yellow font-black text-lg">{percent}%</span>
                                            <span className="text-indigo-200 text-[10px] font-bold">{opt.votes} v</span>
                                        </div>
                                    </div>
                                </button>
                             );
                        } else {
                            return (
                                <button key={opt.id} onClick={() => handleVote(survey.id, opt.id)} className="w-full relative bg-indigo-50/50 hover:bg-white border border-indigo-50 hover:border-brand-teal p-4 rounded-2xl flex justify-between items-center transition-all group overflow-hidden shadow-sm hover:shadow-md">
                                    <div className="absolute left-0 top-0 bottom-0 bg-brand-teal/20 transition-all duration-1000 rounded-r-xl" style={{width: `${percent}%`}}></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${isLeader ? 'bg-brand-gold text-white border-brand-gold shadow-md' : 'bg-white text-indigo-300 border-indigo-100'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="font-bold text-indigo-900 text-left">{opt.label}</span>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <span className="block font-black text-brand-teal text-lg">{percent}%</span>
                                        <span className="text-[10px] font-bold text-indigo-300">{opt.votes} votos</span>
                                    </div>
                                </button>
                            );
                        }
                    })}
                </div>
              </div>
            ))}
          </div>
        );
      case 'prizes':
        return (
          <div className="space-y-6 p-4 pb-28 animate-fade-in relative">
            <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-2xl font-black text-indigo-950">Catálogo de Premios</h2>
                 <div className="bg-brand-yellow px-4 py-2 rounded-2xl text-brand-blue font-black text-sm shadow-lg shadow-brand-yellow/30 flex items-center gap-2 transform rotate-1">
                     <Ticket size={16} /> {user.tickets.length * 100} Ptos
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {prizes.map(prize => (
                <div 
                    key={prize.id} 
                    onClick={() => setSelectedPrize(prize)}
                    className="bg-white p-3 rounded-[2rem] shadow-lg shadow-indigo-100 border border-white flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative w-full h-36 mb-3 rounded-[1.5rem] overflow-hidden bg-indigo-50">
                       <img src={prize.image} alt={prize.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-indigo-900 leading-tight px-1 mb-1">{prize.name}</h3>
                  <div className="mt-auto px-1 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg group-hover:bg-brand-purple group-hover:text-white transition-colors">Ver detalles</span>
                       <ChevronRight size={16} className="text-indigo-200 group-hover:text-brand-purple transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {selectedPrize && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-indigo-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-fade-in-up">
                        <button onClick={() => setSelectedPrize(null)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/40 transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="h-72 bg-indigo-50 relative">
                             <img src={selectedPrize.image} alt={selectedPrize.name} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-20"></div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-3xl font-black text-indigo-950 mb-3 leading-tight">{selectedPrize.name}</h3>
                            <p className="text-indigo-500 font-medium mb-8 leading-relaxed">{selectedPrize.description}</p>
                            <button className="w-full bg-indigo-950 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform">
                                Lo quiero
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
        case 'downloads':
            return (
              <div className="space-y-6 p-4 pb-28 animate-fade-in">
                <div className="bg-gradient-to-br from-brand-blue to-cyan-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                     <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-purple/30 rounded-full blur-3xl"></div>
                     <h2 className="text-3xl font-black relative z-10 mb-2">Zona Digital</h2>
                     <p className="text-blue-100 relative z-10 font-medium">Las mejores herramientas y entretenimiento, gratis para ti.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                {INSTALLERS.map(app => (
                  <div key={app.id} className="relative rounded-[2.5rem] shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 bg-white">
                    {/* Visual Card Header */}
                    <div className={`h-32 bg-gradient-to-r ${app.colorFrom || 'from-indigo-500'} ${app.colorTo || 'to-purple-500'} relative`}>
                        {app.image && (
                            <img src={app.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Cover" />
                        )}
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                             {app.category === 'Movies' && <PlayCircle size={24} />}
                             {app.category === 'Music' && <Music size={24} />}
                             {app.category === 'Games' && <Gamepad2 size={24} />}
                             {app.category === 'Tutorial' && <BookOpen size={24} />}
                        </div>
                    </div>
                    
                    <div className="p-6 relative">
                        <div className="-mt-16 mb-3 relative z-10">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.colorFrom} ${app.colorTo} shadow-lg border-4 border-white flex items-center justify-center text-white`}>
                                 {app.category === 'Movies' && <PlayCircle size={32} />}
                                 {app.category === 'Music' && <Music size={32} />}
                                 {app.category === 'Games' && <Gamepad2 size={32} />}
                                 {app.category === 'Tutorial' && <BookOpen size={32} />}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-indigo-950 leading-none">{app.name}</h3>
                                <p className="text-sm font-bold text-indigo-400 mt-1">{app.version} • {app.category}</p>
                            </div>
                        </div>
                        
                        {app.warningText && (
                            <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-4 text-[10px] text-orange-800 leading-snug">
                                <span className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={10}/> Importante:</span>
                                {app.warningText.substring(0, 100)}...
                            </div>
                        )}

                        <a href={app.downloadLink} target="_blank" rel="noreferrer" className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all text-white shadow-lg bg-gradient-to-r ${app.colorFrom} ${app.colorTo} hover:shadow-xl hover:opacity-90`}>
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
          <div className="p-4 pb-28 space-y-6 animate-fade-in">
            {/* Gamified Profile Header */}
            <div className="bg-white rounded-[3rem] p-8 pb-10 shadow-xl border border-indigo-50 text-center relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${currentRank.bg.replace('/10','')} to-transparent opacity-20`}></div>
                
                <div className="relative z-10">
                    {/* Non-invasive Logout Button */}
                    <button onClick={onLogout} className="absolute top-0 right-0 p-3 text-indigo-300 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>

                    <div className="w-36 h-36 mx-auto mb-4 relative group">
                        <div className="w-full h-full rounded-full p-1.5 bg-white shadow-xl overflow-hidden relative">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center text-white text-5xl font-black">
                                    {user.firstName[0]}
                                </div>
                            )}
                            {/* Upload Overlay */}
                            <div onClick={() => profileFileInputRef.current?.click()} className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full backdrop-blur-sm">
                                <Camera className="text-white" size={32} />
                            </div>
                            <input type="file" ref={profileFileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-lg border border-indigo-50">
                             <currentRank.icon className={currentRank.color} size={22} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-indigo-950 mb-1">{user.firstName} {user.lastName}</h2>
                    <p className={`text-sm font-black uppercase tracking-widest mb-3 ${currentRank.color}`}>{user.rank || 'Ciudadano'}</p>
                    {user.isMemberOf33 && <span className="bg-brand-gold text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-md shadow-brand-gold/20">Miembro Oficial 33</span>}
                    
                    <button onClick={() => setShowPrivacy(true)} className="block mx-auto mt-6 text-xs text-indigo-300 underline hover:text-brand-purple transition-colors">
                        Ver Políticas de Privacidad
                    </button>
                </div>
            </div>
            
            {/* Los 33 Profile Edit */}
            {user.isMemberOf33 && (
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="font-black text-xl flex items-center gap-2"><Star size={20} className="fill-current text-brand-gold"/> Perfil Oficial 33</h3>
                        <button onClick={() => setIsEditing33(!isEditing33)} className="bg-white/20 hover:bg-white/40 p-2 rounded-xl transition-colors">
                            <Edit3 size={18} />
                        </button>
                    </div>
                    
                    {!isEditing33 ? (
                        <div className="space-y-3 relative z-10">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold opacity-60">Formación Académica</p>
                                <p className="text-sm font-medium">{user.academic || 'Sin información'}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold opacity-60">Experiencia Pública</p>
                                <p className="text-sm font-medium">{user.publicExp || 'Sin información'}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold opacity-60">Trabajo Comunitario</p>
                                <p className="text-sm font-medium">{user.community || 'Sin información'}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave33Profile} className="space-y-3 relative z-10">
                            <textarea className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/50 border border-transparent focus:border-white/50 outline-none text-sm" placeholder="Tu Formación Académica..." value={edit33Data.academic} onChange={e => setEdit33Data({...edit33Data, academic: e.target.value})} rows={2} />
                            <textarea className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/50 border border-transparent focus:border-white/50 outline-none text-sm" placeholder="Tu Experiencia Pública..." value={edit33Data.publicExp} onChange={e => setEdit33Data({...edit33Data, publicExp: e.target.value})} rows={2} />
                            <textarea className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/50 border border-transparent focus:border-white/50 outline-none text-sm" placeholder="Tu Trabajo Comunitario..." value={edit33Data.community} onChange={e => setEdit33Data({...edit33Data, community: e.target.value})} rows={2} />
                            <button type="submit" className="w-full bg-white text-violet-700 py-3 rounded-xl font-black shadow-lg">Guardar Perfil</button>
                        </form>
                    )}
                </div>
            )}

            {/* WINNER SECTION */}
            {user.isWinner && (
                <div className="bg-gradient-to-br from-brand-gold to-orange-500 rounded-[3rem] p-8 text-white shadow-2xl shadow-orange-500/30 relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
                    <div className="relative z-10">
                        <Trophy size={56} className="mb-4 text-white drop-shadow-md mx-auto" />
                        <h3 className="text-4xl font-black leading-none mb-2 text-center">¡FELICIDADES!</h3>
                        <p className="font-medium opacity-90 mb-8 text-center text-orange-100">Eres el ganador del sorteo semanal. <br/>Ingresa tus datos para enviarte el premio.</p>
                        
                        {!deliverySaved ? (
                            <form onSubmit={handleDeliverySubmit} className="space-y-4 bg-white/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/30 shadow-inner">
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-80 pl-2 text-orange-50">Dirección de Entrega</label>
                                    <input required className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/60 border border-transparent focus:border-white/50 outline-none transition-all" placeholder="Calle principal y secundaria" value={deliveryData.address} onChange={e => setDeliveryData({...deliveryData, address: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-80 pl-2 text-orange-50">Referencia</label>
                                    <input required className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/60 border border-transparent focus:border-white/50 outline-none transition-all" placeholder="Frente a la tienda..." value={deliveryData.reference} onChange={e => setDeliveryData({...deliveryData, reference: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-80 pl-2 text-orange-50">Teléfono</label>
                                    <input required className="w-full bg-black/20 rounded-xl p-3 text-white placeholder:text-white/60 border border-transparent focus:border-white/50 outline-none transition-all" placeholder="099..." value={deliveryData.phone} onChange={e => setDeliveryData({...deliveryData, phone: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-white text-orange-600 py-4 rounded-xl font-black shadow-lg hover:scale-105 transition-transform mt-2">
                                    Enviar Datos
                                </button>
                            </form>
                        ) : (
                            <div className="bg-white/20 p-8 rounded-[2rem] text-center backdrop-blur-md border border-white/30">
                                <CheckCircle size={48} className="mx-auto mb-4 text-white" />
                                <h4 className="font-black text-2xl mb-1">¡Datos Recibidos!</h4>
                                <p className="text-sm opacity-90">Nos pondremos en contacto contigo pronto.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ticket Wallet Section */}
            {!user.isMemberOf33 && (
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative">
                     <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-gold/30 rounded-full blur-3xl"></div>
                     <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-brand-pink/30 rounded-full blur-3xl"></div>
                     
                     <div className="flex items-center gap-4 mb-6 relative z-10">
                         <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><Ticket size={28} className="text-brand-gold"/></div>
                         <div>
                             <h3 className="font-black text-xl">Billetera de Sorteos</h3>
                             <p className="text-xs text-indigo-200">Tus boletos para el próximo premio</p>
                         </div>
                     </div>

                     {user.tickets.length > 0 ? (
                         <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                             {user.tickets.map((ticket, i) => (
                                 <div key={i} className="snap-center flex-shrink-0 w-36 h-20 bg-gradient-to-r from-brand-gold to-orange-400 text-indigo-950 rounded-2xl flex flex-col items-center justify-center shadow-lg relative border-2 border-dashed border-indigo-900/20 group hover:scale-105 transition-transform">
                                     <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 bg-indigo-700 rounded-full"></div>
                                     <div className="absolute -right-2 top-1/2 -mt-2 w-4 h-4 bg-indigo-700 rounded-full"></div>
                                     <span className="text-[9px] uppercase font-bold opacity-60 mb-0.5">Ticket</span>
                                     <span className="font-mono text-2xl font-black tracking-widest">#{ticket}</span>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="text-center py-8 bg-white/5 rounded-3xl border-2 border-dashed border-white/20">
                             <p className="text-sm font-bold text-indigo-200">Aún no tienes tickets.</p>
                             <button onClick={() => setActiveTab('surveys')} className="text-brand-gold text-xs font-black mt-2 underline hover:text-white transition-colors">Ir a Votar</button>
                         </div>
                     )}
                </div>
            )}
            
            {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
          </div>
        );
      case 'los33':
        return <Los33View />;
      default: return null;
    }
  };

  // ... (Keep render logic)
  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-brand-purple selection:text-white relative">
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-indigo-50 px-6 py-4 flex justify-between items-center shadow-sm">
         <div onClick={() => setActiveTab('feed')} className="w-28 cursor-pointer hover:opacity-80 transition-opacity active:scale-95">
             <AppLogo />
         </div>
         <div onClick={() => setActiveTab('profile')} className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-purple to-brand-pink p-[2px] cursor-pointer overflow-hidden shadow-lg shadow-brand-purple/20 transition-transform active:scale-95">
             <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-brand-purple text-sm hover:bg-indigo-50 transition-colors">
                 {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover rounded-full" /> : user.firstName[0]}
             </div>
         </div>
      </div>
      <main className="max-w-3xl mx-auto">
          {renderContent()}
      </main>
      {/* Ticket Modal logic remains */}
      {ticketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-[2.5rem] p-10 text-center max-w-sm w-full relative overflow-hidden animate-fade-in-up border border-white/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent"></div>
                  <div className="relative z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-brand-gold to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-gold/40 animate-bounce">
                          <Ticket size={48} className="text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-indigo-950 mb-2">¡Voto Registrado!</h3>
                      <p className="text-indigo-400 mb-8 text-sm font-medium">Has ganado un boleto para el sorteo semanal.</p>
                      
                      <div className="bg-indigo-950 text-brand-gold font-mono text-4xl font-black py-6 rounded-2xl mb-8 tracking-widest border-2 border-brand-gold border-dashed shadow-inner">
                          #{ticketModal}
                      </div>
                      
                      <button onClick={() => setTicketModal(null)} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-blue/30 hover:scale-105 transition-transform">
                          Genial, continuar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 px-6 py-3 rounded-[2rem] shadow-2xl shadow-indigo-200/50 flex justify-between items-center w-full max-w-md">
              <NavButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={Home} label="Muro" />
              <NavButton active={activeTab === 'surveys'} onClick={() => setActiveTab('surveys')} icon={Vote} label="Votar" />
              <div className="relative -top-8 mx-2">
                  <button onClick={() => setActiveTab('los33')} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-brand-gold/40 border-4 border-white/80 transition-transform active:scale-95 bg-gradient-to-br from-brand-gold to-orange-400 text-white`}>
                      <Star fill="currentColor" size={32} />
                  </button>
              </div>
              <NavButton active={activeTab === 'prizes'} onClick={() => setActiveTab('prizes')} icon={Gift} label="Premios" />
              {user.role === 'admin' ? (
                  <NavButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={Shield} label="Admin" />
              ) : (
                  <NavButton active={activeTab === 'downloads'} onClick={() => setActiveTab('downloads')} icon={Download} label="Apps" />
              )}
          </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const loadedUser = storageService.getCurrentUser();
    if (loadedUser) setUser(loadedUser);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleLogin = (u: User) => {
    storageService.setCurrentUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
  };
  
  const handleUserUpdate = (u: User) => {
      setUser(u);
      storageService.setCurrentUser(u);
  };

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      ) : (
        <AuthView onLogin={handleLogin} />
      )}
      <PWAInstallPrompt prompt={installPrompt} onInstall={() => {
          if(installPrompt) {
              installPrompt.prompt();
              setInstallPrompt(null);
          }
      }} onClose={() => setInstallPrompt(null)} />
    </>
  );
};

export default App;
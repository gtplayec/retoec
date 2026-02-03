import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { GoogleGenAI } from "@google/genai";
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2, KeyRound, Users, Upload, FileCheck, Sparkles, Zap, Play, Music, Gamepad2, Shield, ShieldOff, UserMinus, UserPlus, Pencil, Ticket, MousePointerClick, RefreshCw, BookOpen, GraduationCap, Wand2, Camera, ChevronRight
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
    // Admin Check
    if (email === 'gtplayec@gmail.com' && password === 'RETO2026@') {
      const adminUser: User = {
        id: 'admin-main',
        firstName: 'Admin',
        lastName: 'Principal',
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
    
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Use Nano Banana (gemini-2.5-flash-image)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const styleConfig = ANIME_STYLES.find(s => s.id === selectedStyle);
      const prompt = styleConfig?.prompt || "Anime style";

      // Extract base64 without prefix
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `${prompt}. Keep the pose and composition similar to the original image. High quality, detailed.`
          }
        ],
      });

      // Extract image from response
      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) {
        alert("La IA no pudo generar la imagen. Inténtalo de nuevo.");
      }

    } catch (error) {
      console.error("Error generating anime:", error);
      alert("Hubo un error al conectar con la IA. Verifica tu conexión.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
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
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
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
    <div className="space-y-8 animate-fade-in pb-10">
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
    <div className="space-y-8 animate-fade-in pb-10">
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
          return (
          <div key={survey.id} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-800">{survey.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {survey.options.map(opt => {
                const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                return (
                <div key={opt.id} className={`group relative overflow-hidden rounded-2xl border-4 cursor-pointer transition-all duration-300 hover:shadow-2xl ${user.surveyHistory.includes(survey.id) ? 'border-gray-200 opacity-80 cursor-default' : 'border-gray-100 hover:border-brand-teal transform hover:-translate-y-2'}`}
                     onClick={() => !user.surveyHistory.includes(survey.id) && handleVote(survey.id, opt.id)}>
                   
                   <div className="aspect-square bg-gray-100 relative group-hover:brightness-90 transition-all">
                     {opt.imageUrl ? (
                       <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                         <ImageIcon size={48} />
                       </div>
                     )}
                     
                     {/* Overlay for non-voters to prompt click */}
                     {!user.surveyHistory.includes(survey.id) && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
                           <div className="bg-brand-teal text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center transform scale-90 group-hover:scale-100 transition-transform">
                             <MousePointerClick className="mr-2" /> VOTAR AQUÍ
                           </div>
                        </div>
                     )}

                     {/* Overlay Gradient for Text */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
                        <div className="text-white font-bold text-lg leading-tight drop-shadow-md">{opt.label}</div>
                        {user.surveyHistory.includes(survey.id) && (
                          <div className="w-full mt-2">
                             <div className="flex justify-between items-end mb-1">
                               <span className="text-brand-yellow font-black text-2xl leading-none">{percent}%</span>
                               <span className="text-white text-xs font-bold opacity-90">{opt.votes} Votos</span>
                             </div>
                             <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                               <div className="h-full bg-brand-yellow rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
                             </div>
                          </div>
                        )}
                     </div>
                   </div>

                   {/* Checkmark overlay if voted */}
                   {user.surveyHistory.includes(survey.id) && (
                     <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-lg z-20">
                       <CheckCircle size={20} />
                     </div>
                   )}
                </div>
              )})}
            </div>
            {user.surveyHistory.includes(survey.id) && (
               <div className="mt-6 bg-green-50 text-green-700 py-3 px-4 rounded-xl text-center font-bold border border-green-200 flex items-center justify-center">
                 <CheckCircle className="mr-2"/> ¡Gracias por participar en esta encuesta!
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
    // Get all users who are members of "The 33"
    const allUsers = storageService.getUsers();
    setMembers(allUsers.filter(u => u.isMemberOf33));
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
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-brand-gold text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="relative z-10">
           <h2 className="text-5xl font-black flex items-center mb-4 text-brand-gold tracking-tight">LOS 33 <Star className="ml-4 fill-current animate-pulse"/></h2>
           <p className="text-xl text-gray-300 font-light max-w-2xl">Un círculo exclusivo de líderes y perfiles destacados que están marcando la diferencia.</p>
        </div>
      </div>

      {/* Editor for Members */}
      {user.isMemberOf33 && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-brand-gold/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-gold text-black font-bold px-4 py-1 rounded-bl-xl text-xs uppercase">Acceso VIP</div>
          <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
            <Settings className="mr-3 text-brand-gold" /> Gestionar Tu Perfil
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tu Presentación (Bio)</label>
              <textarea 
                className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 focus:border-brand-gold outline-none transition"
                placeholder="Escribe algo inspirador sobre ti..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
               <div className="flex-grow w-full">
                 <label className="block text-sm font-bold text-gray-700 mb-2">Cargar Hoja de Vida (PDF)</label>
                 <div className="flex items-center gap-4">
                   <label className="cursor-pointer bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl flex items-center shadow-lg transition transform hover:scale-105">
                     <Upload size={18} className="mr-2" /> Seleccionar PDF
                     <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                   </label>
                   {user.cvPdf && <span className="text-sm text-green-600 font-bold flex items-center bg-green-50 px-3 py-1 rounded-full"><CheckCircle size={14} className="mr-1"/> PDF Listo</span>}
                 </div>
               </div>
               <button onClick={saveBio} className="bg-brand-teal text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 w-full md:w-auto">
                 Publicar Cambios
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map(member => (
          <div key={member.id} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 relative">
               {/* Placeholder Avatar if no image */}
               <div className="absolute -bottom-10 left-6 h-20 w-20 bg-brand-gold rounded-2xl shadow-lg flex items-center justify-center text-white font-black text-2xl border-4 border-white">
                 {member.firstName.charAt(0)}{member.lastName.charAt(0)}
               </div>
            </div>
            <div className="pt-12 px-6 pb-6 flex-grow">
               <h3 className="text-2xl font-black text-gray-800">{member.firstName} {member.lastName}</h3>
               <p className="text-xs font-bold uppercase tracking-wide text-brand-blue mb-4">{member.zone}</p>
               <p className="text-gray-600 text-sm leading-relaxed mb-6">
                 {member.bio || "Este miembro aún no ha agregado su biografía."}
               </p>
            </div>
            <div className="p-4 bg-gray-50 border-t mt-auto">
              {member.cvPdf ? (
                 <a 
                   href={member.cvPdf} 
                   download={`HojaVida_${member.firstName}_${member.lastName}.pdf`}
                   className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-brand-pink transition font-bold shadow-md"
                 >
                   <FileCheck size={18} className="mr-2" /> Descargar CV
                 </a>
              ) : (
                <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center">
                   <FileText size={18} className="mr-2" /> CV No Disponible
                </button>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <Users size={64} className="mx-auto text-gray-300 mb-4"/>
             <p className="text-gray-500 font-medium">Aún no hay miembros registrados en Los 33.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const PrizesSection: React.FC<{ viewMode: 'prizes' | 'winners' }> = ({ viewMode }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const winners = storageService.getWinners();

  useEffect(() => {
    setPrizes(storageService.getPrizes());
  }, []);
  
  return (
    <div className="space-y-8 animate-fade-in pb-10">
       {viewMode === 'prizes' && (
         <div>
           <div className="bg-gradient-to-r from-brand-pink to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                <Gift size={200} />
              </div>
              <h2 className="text-4xl font-black mb-2 relative z-10">Premios de la Semana</h2>
              <p className="text-pink-100 text-lg relative z-10">Participa en las encuestas y llévate increíbles recompensas.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {prizes.map(prize => (
                <div key={prize.id} className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
                  <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gray-100">
                    {prize.image ? (
                      <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Gift size={48}/></div>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 leading-tight mb-2">{prize.name}</h4>
                  <p className="text-gray-500 text-sm mt-auto">{prize.description}</p>
                </div>
              ))}
           </div>
         </div>
       )}

       {viewMode === 'winners' && (
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
           <h2 className="text-3xl font-black text-brand-gold flex items-center mb-8"><Trophy className="mr-4 w-10 h-10 fill-current" /> Muro de la Fama</h2>
           
           {winners.length === 0 ? (
             <div className="text-center py-10 bg-gray-50 rounded-2xl">
               <Trophy size={48} className="mx-auto text-gray-300 mb-2"/>
               <p className="text-gray-500">Aún no hay ganadores registrados. ¡Tú podrías ser el primero!</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b-2 border-gray-100">
                     <th className="p-4 text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                     <th className="p-4 text-gray-500 text-xs uppercase tracking-wider">Ganador</th>
                     <th className="p-4 text-gray-500 text-xs uppercase tracking-wider">Premio</th>
                     <th className="p-4 text-gray-500 text-xs uppercase tracking-wider text-right">Boleto #</th>
                   </tr>
                 </thead>
                 <tbody>
                   {winners.map(w => (
                     <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                       <td className="p-4 font-medium text-gray-600">{w.date}</td>
                       <td className="p-4 font-bold text-gray-800 flex items-center">
                         <span className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-xs mr-3 shadow-sm">👑</span>
                         {w.winnerName}
                       </td>
                       <td className="p-4 text-gray-600">{w.prizeName}</td>
                       <td className="p-4 text-right font-mono text-brand-pink font-bold">{w.ticketNumber}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       )}
    </div>
  );
};

const CoursesSection: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fade-in p-8">
    <div className="bg-orange-100 p-8 rounded-full shadow-lg">
      <GraduationCap size={80} className="text-orange-500" />
    </div>
    <div className="max-w-md">
      <h2 className="text-4xl font-black text-gray-800 mb-2">Cursos Online</h2>
      <p className="text-gray-500 text-lg">Aprende nuevas habilidades y potencia tu futuro profesional totalmente gratis.</p>
    </div>
    <div className="bg-brand-yellow text-brand-blue font-black px-8 py-3 rounded-full text-xl shadow-xl border-2 border-brand-blue border-dashed animate-pulse mt-4">
      🚧 PRÓXIMAMENTE 🚧
    </div>
  </div>
);

const BooksSection: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fade-in p-8">
    <div className="bg-blue-100 p-8 rounded-full shadow-lg">
      <BookOpen size={80} className="text-brand-blue" />
    </div>
    <div className="max-w-md">
      <h2 className="text-4xl font-black text-gray-800 mb-2">Libros PDF Gratis</h2>
      <p className="text-gray-500 text-lg">Tu biblioteca digital personal. Accede a cientos de libros educativos y literarios.</p>
    </div>
    <div className="bg-brand-yellow text-brand-blue font-black px-8 py-3 rounded-full text-xl shadow-xl border-2 border-brand-blue border-dashed animate-pulse mt-4">
      🚧 EN CONSTRUCCIÓN 🚧
    </div>
  </div>
);

const PrivacyPolicy: React.FC = () => (
  <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto my-8">
    <h1 className="text-2xl font-bold mb-4">Política de Privacidad</h1>
    <div className="prose text-sm text-gray-700">
      <p><strong>Última actualización:</strong> 2023</p>
      <p>RETO33 SD respeta su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.</p>
      
      <h3 className="font-bold mt-4">1. Recopilación de Información</h3>
      <p>Recopilamos información que usted proporciona al registrarse, como su nombre, correo electrónico, número de teléfono y ubicación.</p>

      <h3 className="font-bold mt-4">2. Uso de la Información</h3>
      <p>Utilizamos su información para administrar sorteos, mejorar nuestros servicios y comunicarnos con usted.</p>

      <h3 className="font-bold mt-4">3. Compartir Información</h3>
      <p>No vendemos ni compartimos su información personal con terceros, excepto cuando sea necesario para cumplir con la ley.</p>
      
      <h3 className="font-bold mt-4">4. Seguridad</h3>
      <p>Implementamos medidas de seguridad para proteger sus datos personales.</p>
    </div>
  </div>
);

// 3. Admin Panel (Kept Clean but Modernized slightly)
const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'stats' | 'surveys' | 'prizes' | 'admins'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // Survey Form State
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyCat, setNewSurveyCat] = useState<'Alcalde' | 'Prefecto' | 'Obras' | 'Nacional'>('Alcalde');
  const [surveyOptions, setSurveyOptions] = useState<SurveyOption[]>([{ id: '1', label: '', votes: 0 }]);

  // Prize Form State
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeDesc, setNewPrizeDesc] = useState('');
  const [newPrizeImage, setNewPrizeImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setUsers(storageService.getUsers());
    setSurveys(storageService.getSurveys());
    setPrizes(storageService.getPrizes());
  }, []);

  const downloadExcel = () => {
    // Simulate CSV download
    const headers = ["ID", "Nombre", "Apellido", "Edad", "Telefono", "Zona", "Sector", "Email"];
    const rows = users.map(u => [u.id, u.firstName, u.lastName, u.age, u.phone, u.zone, u.sector, u.email]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "participantes_reto33sd.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addAdmin = () => {
    const userToPromote = users.find(u => u.email === newAdminEmail);
    if (userToPromote) {
      userToPromote.role = 'admin';
      storageService.saveUser(userToPromote);
      setUsers(storageService.getUsers());
      setNewAdminEmail('');
      alert(`${userToPromote.firstName} es ahora administrador.`);
    } else {
      alert("Usuario no encontrado.");
    }
  };

  const toggleLos33Member = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const currentCount = users.filter(u => u.isMemberOf33).length;
      if (!user.isMemberOf33 && currentCount >= 33) {
        alert("Ya existen 33 miembros asignados. Debes quitar a uno antes de agregar otro.");
        return;
      }
      
      user.isMemberOf33 = !user.isMemberOf33;
      storageService.saveUser(user);
      setUsers([...storageService.getUsers()]); // Refresh list
    }
  };

  const updateUserRole = (userId: string, newRole: 'user' | 'admin') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      storageService.saveUser(user);
      setUsers([...storageService.getUsers()]);
    }
  };

  const deleteUser = (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario permanentemente?")) {
      storageService.deleteUser(userId);
      setUsers(storageService.getUsers());
    }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newOpts = [...surveyOptions];
        newOpts[index].imageUrl = ev.target?.result as string;
        setSurveyOptions(newOpts);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startEditSurvey = (survey: Survey) => {
    setNewSurveyTitle(survey.title);
    setNewSurveyCat(survey.category);
    setSurveyOptions(survey.options.map(o => ({...o}))); // Clone options
    setEditingSurveyId(survey.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSurveyId(null);
    setNewSurveyTitle('');
    setSurveyOptions([{ id: Date.now().toString(), label: '', votes: 0 }]);
  };

  const saveSurvey = () => {
    if (!newSurveyTitle) return alert("Título requerido");
    
    let updatedSurveys;
    if (editingSurveyId) {
      updatedSurveys = surveys.map(s => s.id === editingSurveyId ? {
        ...s,
        title: newSurveyTitle,
        category: newSurveyCat,
        options: surveyOptions
      } : s);
      alert("Encuesta actualizada");
    } else {
      const newSurvey: Survey = {
        id: Date.now().toString(),
        title: newSurveyTitle,
        category: newSurveyCat,
        active: true,
        options: surveyOptions
      };
      updatedSurveys = [...surveys, newSurvey];
      alert("Encuesta creada");
    }
    
    storageService.saveSurveys(updatedSurveys);
    setSurveys(updatedSurveys);
    cancelEdit();
  };

  // Prize Functions
  const handlePrizeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPrizeImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addPrize = () => {
    if (!newPrizeName || !newPrizeDesc) {
      alert("Por favor ingrese nombre y descripción del premio");
      return;
    }
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: newPrizeName,
      description: newPrizeDesc,
      image: newPrizeImage
    };
    const updated = [newPrize, ...prizes].slice(0, 10); // Keep max 10 latest
    storageService.savePrizes(updated);
    setPrizes(updated);
    setNewPrizeName('');
    setNewPrizeDesc('');
    setNewPrizeImage(undefined);
  };

  const deletePrize = (id: string) => {
    const updated = prizes.filter(p => p.id !== id);
    storageService.savePrizes(updated);
    setPrizes(updated);
  };

  const resetWeeklyDraw = () => {
    if (confirm("⚠️ ATENCIÓN: ¿Estás seguro de que quieres REINICIAR el sorteo? Esto borrará los tickets y el historial de votos de TODOS los usuarios para comenzar una nueva semana.")) {
        if(confirm("Confirma nuevamente: Esta acción es irreversible.")) {
            storageService.resetWeeklyDraw();
            setUsers(storageService.getUsers()); // Refresh UI
            alert("El sorteo ha sido reiniciado. Los usuarios pueden volver a votar.");
        }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white p-6 flex justify-between items-center overflow-x-auto shadow-md">
        <div className="flex items-center">
            <h2 className="text-xl font-bold whitespace-nowrap mr-6 tracking-wide">PANEL DE CONTROL</h2>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
            {['stats', 'surveys', 'prizes', 'admins'].map((view) => (
                <button 
                key={view}
                onClick={() => setActiveView(view as any)} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeView === view ? 'bg-brand-blue text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                {view === 'stats' && 'Estadísticas'}
                {view === 'surveys' && 'Encuestas'}
                {view === 'prizes' && 'Premios'}
                {view === 'admins' && 'Usuarios'}
                </button>
            ))}
            </div>
            <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition" title="Salir">
                <LogOut size={20} />
            </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {activeView === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-gray-500 font-bold uppercase text-xs mb-2">Total Usuarios</h3>
                <p className="text-5xl font-black text-brand-blue">{users.length}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-gray-500 font-bold uppercase text-xs mb-2">Encuestas Activas</h3>
                <p className="text-5xl font-black text-brand-teal">{surveys.filter(s => s.active).length}</p>
                </div>
                <div className="bg-gradient-to-br from-brand-blue to-purple-800 p-8 rounded-2xl shadow-lg flex flex-col justify-center text-white">
                <button onClick={downloadExcel} className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center transition backdrop-blur-sm">
                    <Download className="mr-2" /> Descargar Base de Datos
                </button>
                </div>
            </div>

            {/* Reset Weekly Draw Section */}
            <div className="bg-red-50 border-2 border-red-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                    <h3 className="text-red-700 font-black text-xl flex items-center"><AlertTriangle className="mr-2"/> ZONA DE PELIGRO: Sorteo Semanal</h3>
                    <p className="text-red-600 text-sm mt-1">
                        Utiliza esta opción al finalizar la semana. Esto borrará los tickets acumulados y permitirá a los usuarios votar nuevamente.
                    </p>
                </div>
                <button 
                    onClick={resetWeeklyDraw}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105 flex items-center"
                >
                    <RefreshCw className="mr-2" /> REINICIAR BOLETOS
                </button>
            </div>
          </div>
        )}

        {activeView === 'admins' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl border shadow-sm">
               <h3 className="font-bold mb-4 text-gray-800">Agregar Nuevo Administrador Rápido</h3>
               <div className="flex gap-3">
                 <input 
                   placeholder="Email del usuario existente" 
                   className="border p-3 flex-grow rounded-xl bg-gray-50" 
                   value={newAdminEmail}
                   onChange={e => setNewAdminEmail(e.target.value)}
                 />
                 <button onClick={addAdmin} className="bg-brand-teal text-white px-6 rounded-xl font-bold hover:bg-teal-700 transition">Promover</button>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-800">Lista de Usuarios</h3>
                 <span className="text-xs bg-brand-gold text-white px-3 py-1 rounded-full font-bold">
                   Miembros R33: {users.filter(u => u.isMemberOf33).length}/33
                 </span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">
                            {u.firstName} {u.lastName}
                            <div className="text-xs text-gray-400">{u.zone}</div>
                          </td>
                          <td className="p-4 text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {u.role === 'admin' && <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700">Admin</span>}
                              {u.isMemberOf33 && <span className="px-2 py-1 rounded text-xs font-bold bg-brand-gold text-white">R33</span>}
                              {u.role === 'user' && !u.isMemberOf33 && <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">Usuario</span>}
                            </div>
                          </td>
                          <td className="p-4 flex items-center justify-end gap-2">
                            {u.role !== 'admin' || u.id !== 'admin-main' ? (
                              <>
                                {/* R33 Toggle */}
                                <button 
                                  onClick={() => toggleLos33Member(u.id)}
                                  title={u.isMemberOf33 ? "Quitar de R33" : "Ascender a R33"}
                                  className={`p-2 rounded-lg transition ${u.isMemberOf33 ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-500'}`}
                                >
                                  {u.isMemberOf33 ? <Star size={16} fill="currentColor"/> : <Star size={16} />}
                                </button>

                                {/* Admin Toggle */}
                                <button 
                                  onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                  title={u.role === 'admin' ? "Degradar a Usuario" : "Ascender a Admin"}
                                  className={`p-2 rounded-lg transition ${u.role === 'admin' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-purple-100 hover:text-purple-500'}`}
                                >
                                  {u.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                                </button>

                                {/* Delete */}
                                <button 
                                  onClick={() => deleteUser(u.id)}
                                  title="Eliminar Usuario"
                                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Principal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          </div>
        )}

        {/* ... (Similar UI updates for Surveys and Prizes in Admin) ... */}
        {activeView === 'surveys' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-brand-blue">
                   {editingSurveyId ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}
                 </h3>
                 {editingSurveyId && (
                   <button onClick={cancelEdit} className="text-sm text-red-500 font-bold hover:underline">
                     Cancelar Edición
                   </button>
                 )}
               </div>
               
               <div className="space-y-4">
                 <input 
                   placeholder="Título de la Encuesta" 
                   className="w-full p-3 border rounded-xl bg-gray-50"
                   value={newSurveyTitle}
                   onChange={e => setNewSurveyTitle(e.target.value)}
                 />
                 <select 
                  className="w-full p-3 border rounded-xl bg-gray-50"
                  value={newSurveyCat}
                  onChange={e => setNewSurveyCat(e.target.value as any)}
                 >
                   <option value="Alcalde">Alcalde</option>
                   <option value="Prefecto">Prefecto</option>
                   <option value="Obras">Obras Prioritarias</option>
                   <option value="Nacional">Nacional</option>
                 </select>

                 <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                   <p className="font-bold text-gray-600 text-sm">Opciones de Voto:</p>
                   {surveyOptions.map((opt, idx) => (
                     <div key={idx} className="flex gap-3 items-start flex-col sm:flex-row">
                       <input 
                         placeholder={`Opción ${idx + 1}`} 
                         className="flex-grow p-2 border rounded-lg w-full sm:w-auto"
                         value={opt.label}
                         onChange={e => {
                           const newOpts = [...surveyOptions];
                           newOpts[idx].label = e.target.value;
                           setSurveyOptions(newOpts);
                         }}
                       />
                       {(newSurveyCat === 'Alcalde' || newSurveyCat === 'Prefecto') && (
                         <div className="flex items-center gap-2">
                           {opt.imageUrl && (
                             <img src={opt.imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border" />
                           )}
                           <input 
                             type="file" 
                             accept="image/*"
                             className="text-xs w-full sm:w-32"
                             onChange={e => handleImageUpload(idx, e)}
                           />
                         </div>
                       )}
                     </div>
                   ))}
                   <button 
                     onClick={() => setSurveyOptions([...surveyOptions, { id: Date.now().toString(), label: '', votes: 0 }])}
                     className="text-sm text-brand-blue font-bold hover:underline mt-2"
                   >
                     + Agregar Opción
                   </button>
                 </div>
                 
                 <button onClick={saveSurvey} className="bg-brand-pink text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition w-full">
                   {editingSurveyId ? 'Guardar Cambios' : 'Publicar Encuesta'}
                 </button>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-500 uppercase text-xs">Encuestas Activas</h3>
              {surveys.map(s => (
                <div key={s.id} className="border p-5 rounded-xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
                  <div>
                    <span className="font-bold text-gray-800 block">{s.title}</span> 
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-brand-teal text-white px-2 py-0.5 rounded font-bold">{s.category}</span>
                        <span className="text-xs text-gray-500">Votos: {s.options.reduce((acc, curr) => acc + curr.votes, 0)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditSurvey(s)}
                      className="text-brand-blue hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition"
                      title="Editar Encuesta"
                    >
                      <Pencil size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("¿Borrar encuesta permanentemente?")) {
                          const updated = surveys.filter(sv => sv.id !== s.id);
                          storageService.saveSurveys(updated);
                          setSurveys(updated);
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                      title="Eliminar Encuesta"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'prizes' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
               <h3 className="text-xl font-bold mb-6 text-brand-gold">Agregar Premio</h3>
               <div className="space-y-4">
                 <input 
                   placeholder="Nombre del Premio" 
                   className="w-full p-3 border rounded-xl bg-gray-50"
                   value={newPrizeName}
                   onChange={e => setNewPrizeName(e.target.value)}
                 />
                 <input 
                   placeholder="Descripción" 
                   className="w-full p-3 border rounded-xl bg-gray-50"
                   value={newPrizeDesc}
                   onChange={e => setNewPrizeDesc(e.target.value)}
                 />
                 <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                   <label className="block text-sm font-bold text-gray-500 mb-2">Imagen del Premio</label>
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePrizeImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-white hover:file:bg-yellow-600"
                   />
                   {newPrizeImage && <img src={newPrizeImage} alt="Preview" className="h-32 w-full object-cover mt-4 rounded-lg shadow-sm" />}
                 </div>
                 <button onClick={addPrize} className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-blue-800 transition w-full">
                   <Plus size={20} className="mr-2" /> Guardar Premio
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizes.map(p => (
                <div key={p.id} className="border border-gray-100 p-4 rounded-2xl bg-white flex flex-col justify-between shadow-sm hover:shadow-lg transition">
                  <div>
                    <div className="h-40 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                        {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>
                        )}
                    </div>
                    <h4 className="font-bold text-brand-blue text-lg">{p.name}</h4>
                    <p className="text-sm text-gray-600">{p.description}</p>
                  </div>
                  <button 
                    onClick={() => deletePrize(p.id)}
                    className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center justify-center font-bold w-full py-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} className="mr-1" /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`p-2 md:p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${active ? 'text-brand-blue bg-blue-50 md:bg-white md:shadow-md transform md:-translate-y-1' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
       {icon}
    </div>
    <span className={`text-[10px] md:text-xs font-bold mt-1 ${active ? 'text-brand-blue' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'surveys' | 'installers' | 'profile' | 'los33' | 'prizes' | 'winners' | 'courses' | 'books' | 'anime'>('surveys');
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const stored = storageService.getCurrentUser();
    if (stored) setCurrentUser(stored);
  }, []);

  const handleLogin = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
    // If admin, they handle their own view, but here we just set state.
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('surveys');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <AuthView onLogin={handleLogin} />
        <div className="text-center p-4 bg-gray-50 text-xs text-gray-500">
           <button onClick={() => setShowPrivacy(!showPrivacy)} className="underline hover:text-brand-blue">Política de Privacidad</button>
           {showPrivacy && <div className="mt-4 text-left max-w-lg mx-auto"><PrivacyPolicy /></div>}
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 md:pl-28 transition-all">
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-28 bg-white border-r border-gray-100 flex-col items-center py-8 shadow-xl z-50">
         <div className="mb-8 transform scale-75 hover:scale-90 transition duration-500">
           <AppLogo />
         </div>
         
         <div className="flex flex-col space-y-4 w-full px-4 overflow-y-auto no-scrollbar pb-20">
           <NavButton active={currentView === 'surveys'} onClick={() => setCurrentView('surveys')} icon={<Vote size={24} />} label="Votar" />
           <NavButton active={currentView === 'anime'} onClick={() => setCurrentView('anime')} icon={<Wand2 size={24} />} label="Anime IA" />
           <NavButton active={currentView === 'prizes'} onClick={() => setCurrentView('prizes')} icon={<Gift size={24} />} label="Premios" />
           <NavButton active={currentView === 'winners'} onClick={() => setCurrentView('winners')} icon={<Trophy size={24} />} label="Ganadores" />
           <NavButton active={currentView === 'installers'} onClick={() => setCurrentView('installers')} icon={<Download size={24} />} label="Apps" />
           <NavButton active={currentView === 'books'} onClick={() => setCurrentView('books')} icon={<BookOpen size={24} />} label="Libros" />
           <NavButton active={currentView === 'courses'} onClick={() => setCurrentView('courses')} icon={<GraduationCap size={24} />} label="Cursos" />
           <NavButton active={currentView === 'los33'} onClick={() => setCurrentView('los33')} icon={<Star size={24} />} label="Los 33" />
           <NavButton active={currentView === 'profile'} onClick={() => setCurrentView('profile')} icon={<UserIcon size={24} />} label="Perfil" />
         </div>
         
         <div className="mt-auto mb-4 w-full px-4">
            <button onClick={handleLogout} className="p-3 w-full text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex flex-col items-center" title="Cerrar Sesión">
              <LogOut size={24} />
              <span className="text-[10px] font-bold mt-1">Salir</span>
            </button>
         </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/90 backdrop-blur-md p-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
        <div className="h-10 w-auto transform scale-75 origin-left">
           <AppLogo />
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
             <span className="block font-bold text-gray-800 text-sm leading-tight">{currentUser.firstName}</span>
             <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">{currentUser.tickets?.length || 0} Tickets</span>
           </div>
           <button onClick={() => setCurrentView('profile')} className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-teal rounded-full text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white">
             {currentUser.firstName[0]}
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-10">
        {currentView === 'surveys' && <SurveysSection user={currentUser} onUpdateUser={handleLogin} />}
        {currentView === 'installers' && <InstallersSection user={currentUser} onUpdateUser={handleLogin} />}
        {currentView === 'books' && <BooksSection />}
        {currentView === 'courses' && <CoursesSection />}
        {currentView === 'anime' && <AnimeSection />}
        {currentView === 'profile' && <ProfileSection user={currentUser} onUpdate={handleLogin} onLogout={handleLogout} />}
        {currentView === 'los33' && <Los33Section user={currentUser} onUpdateUser={handleLogin} />}
        {currentView === 'prizes' && <PrizesSection viewMode="prizes" />}
        {currentView === 'winners' && <PrizesSection viewMode="winners" />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 overflow-x-auto">
         <div className="flex justify-start min-w-max p-2 pb-6 space-x-2 px-4">
            <NavButton active={currentView === 'surveys'} onClick={() => setCurrentView('surveys')} icon={<Vote size={20} />} label="Votar" />
            <NavButton active={currentView === 'anime'} onClick={() => setCurrentView('anime')} icon={<Wand2 size={20} />} label="Anime" />
            <NavButton active={currentView === 'prizes'} onClick={() => setCurrentView('prizes')} icon={<Gift size={20} />} label="Premios" />
            <NavButton active={currentView === 'winners'} onClick={() => setCurrentView('winners')} icon={<Trophy size={20} />} label="Ganadores" />
            <NavButton active={currentView === 'installers'} onClick={() => setCurrentView('installers')} icon={<Download size={20} />} label="Apps" />
            <NavButton active={currentView === 'books'} onClick={() => setCurrentView('books')} icon={<BookOpen size={20} />} label="Libros" />
            <NavButton active={currentView === 'courses'} onClick={() => setCurrentView('courses')} icon={<GraduationCap size={20} />} label="Cursos" />
            <NavButton active={currentView === 'los33'} onClick={() => setCurrentView('los33')} icon={<Star size={20} />} label="Los 33" />
         </div>
      </nav>
    </div>
  );
};

export default App;
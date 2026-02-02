import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2, KeyRound, Users, Upload, FileCheck, Sparkles, Zap, Play, Music, Gamepad2
} from 'lucide-react';

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
        surveyHistory: []
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
      surveyHistory: []
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
      ticketNumber: ticket
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
        
        {filteredSurveys.map(survey => (
          <div key={survey.id} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-800">{survey.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {survey.options.map(opt => (
                <div key={opt.id} className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl ${user.surveyHistory.includes(survey.id) ? 'border-gray-200 opacity-80' : 'border-gray-100 hover:border-brand-teal transform hover:-translate-y-2'}`}
                     onClick={() => !user.surveyHistory.includes(survey.id) && handleVote(survey.id, opt.id)}>
                   
                   <div className="aspect-square bg-gray-100 relative">
                     {opt.imageUrl ? (
                       <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                         <ImageIcon size={48} />
                       </div>
                     )}
                     
                     {/* Overlay Gradient */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                        <div className="text-white font-bold text-lg leading-tight">{opt.label}</div>
                        {user.surveyHistory.includes(survey.id) && (
                          <div className="text-brand-yellow font-black text-sm mt-1">{opt.votes} Votos</div>
                        )}
                     </div>
                   </div>

                   {/* Checkmark overlay if voted */}
                   {user.surveyHistory.includes(survey.id) && (
                     <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-lg">
                       <CheckCircle size={20} />
                     </div>
                   )}
                </div>
              ))}
            </div>
            {user.surveyHistory.includes(survey.id) && (
               <div className="mt-6 bg-green-50 text-green-700 py-3 px-4 rounded-xl text-center font-bold border border-green-200 flex items-center justify-center">
                 <CheckCircle className="mr-2"/> ¡Gracias por participar en esta encuesta!
               </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-3xl mt-8 flex flex-col md:flex-row items-center justify-between shadow-2xl">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl font-black mb-2 flex items-center"><Zap className="text-brand-yellow mr-2 fill-current"/> ¡Participa y Gana!</h3>
          <p className="text-gray-400">Cada encuesta completada es una oportunidad más para ganar.</p>
        </div>
        <div className="bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
           <span className="block text-gray-400 text-xs uppercase tracking-wider font-bold">Tickets Acumulados</span>
           <span className="text-4xl font-black text-brand-yellow">{user.surveyHistory.length}</span>
        </div>
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
const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'stats' | 'surveys' | 'prizes' | 'admins'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // Survey Form State
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

  const createSurvey = () => {
    const newSurvey: Survey = {
      id: Date.now().toString(),
      title: newSurveyTitle,
      category: newSurveyCat,
      active: true,
      options: surveyOptions
    };
    const updated = [...surveys, newSurvey];
    storageService.saveSurveys(updated);
    setSurveys(updated);
    alert("Encuesta creada");
    // Reset form
    setNewSurveyTitle('');
    setSurveyOptions([{ id: '1', label: '', votes: 0 }]);
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

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white p-6 flex justify-between items-center overflow-x-auto shadow-md">
        <h2 className="text-xl font-bold whitespace-nowrap mr-6 tracking-wide">PANEL DE CONTROL</h2>
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
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {activeView === 'stats' && (
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
        )}

        {/* ... (Keeping Admin Logic same, just cleaner UI) ... */}
        {activeView === 'admins' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl border shadow-sm">
               <h3 className="font-bold mb-4 text-gray-800">Agregar Nuevo Administrador</h3>
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
                   Miembros de Los 33: {users.filter(u => u.isMemberOf33).length}/33
                 </span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Rol</th><th className="p-4">Los 33</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                          <td className="p-4 text-gray-600">{u.email}</td>
                          <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                          <td className="p-4">
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => toggleLos33Member(u.id)}
                                className={`px-3 py-1 rounded text-xs font-bold transition ${u.isMemberOf33 ? 'bg-brand-gold text-white shadow-md' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                              >
                                {u.isMemberOf33 ? 'Miembro Activo' : 'Hacer Miembro'}
                              </button>
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
               <h3 className="text-xl font-bold mb-6 text-brand-blue">Crear Nueva Encuesta</h3>
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
                     <div key={idx} className="flex gap-3 items-center">
                       <input 
                         placeholder={`Opción ${idx + 1}`} 
                         className="flex-grow p-2 border rounded-lg"
                         value={opt.label}
                         onChange={e => {
                           const newOpts = [...surveyOptions];
                           newOpts[idx].label = e.target.value;
                           setSurveyOptions(newOpts);
                         }}
                       />
                       {(newSurveyCat === 'Alcalde' || newSurveyCat === 'Prefecto') && (
                         <input 
                           type="file" 
                           accept="image/*"
                           className="text-xs w-32"
                           onChange={e => handleImageUpload(idx, e)}
                         />
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
                 
                 <button onClick={createSurvey} className="bg-brand-pink text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition w-full">Publicar Encuesta</button>
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
                  <button 
                    onClick={() => {
                      const updated = surveys.filter(sv => sv.id !== s.id);
                      storageService.saveSurveys(updated);
                      setSurveys(updated);
                    }}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                  >
                    <Trash2 size={20} />
                  </button>
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

// --- Main App Layout ---

type SubView = 'menu' | 'downloads' | 'surveys' | 'prizes' | 'winners' | 'los33';

const MenuCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  bgImage: string;
  onClick: () => void;
  color: string;
}> = ({ title, subtitle, icon, bgImage, onClick, color }) => (
  <button 
    onClick={onClick}
    className="relative h-64 rounded-3xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-left w-full"
  >
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: `url('${bgImage}')` }}
    />
    
    {/* Gradient Overlay */}
    <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-80 transition-opacity duration-300 group-hover:opacity-90`} />
    
    {/* Content */}
    <div className="absolute inset-0 p-8 flex flex-col justify-end">
      <div className="mb-auto transform translate-y-4 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
         <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg border border-white/30">
           {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
         </div>
      </div>
      
      <h3 className="text-3xl font-black text-white mb-1 leading-tight drop-shadow-md">{title}</h3>
      <p className="text-white/90 text-sm font-medium">{subtitle}</p>
    </div>
  </button>
);

const DashboardMenu: React.FC<{ onSelect: (v: SubView) => void }> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in pb-12">
      <MenuCard 
        title="Descargas"
        subtitle="Apps Premium, Música y TV Gratis"
        icon={<Download />}
        bgImage="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
        color="from-brand-teal/90 to-blue-900/60"
        onClick={() => onSelect('downloads')}
      />
      
      <MenuCard 
        title="Encuestas"
        subtitle="Participa y gana tickets semanales"
        icon={<Vote />}
        bgImage="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80"
        color="from-brand-blue/90 to-indigo-900/60"
        onClick={() => onSelect('surveys')}
      />

      <MenuCard 
        title="Premios"
        subtitle="Mira lo que puedes ganar hoy"
        icon={<Gift />}
        bgImage="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80"
        color="from-brand-pink/90 to-purple-900/60"
        onClick={() => onSelect('prizes')}
      />

      <div className="lg:col-span-2">
         <MenuCard 
            title="Los 33"
            subtitle="Acceso exclusivo a perfiles de líderes"
            icon={<Users />}
            bgImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
            color="from-gray-900/95 to-brand-gold/40"
            onClick={() => onSelect('los33')}
          />
      </div>

      <MenuCard 
        title="Ganadores"
        subtitle="Muro de la fama y sorteos pasados"
        icon={<Trophy />}
        bgImage="https://images.unsplash.com/photo-1565514020176-87d25bb5c851?auto=format&fit=crop&q=80"
        color="from-brand-gold/90 to-yellow-700/60"
        onClick={() => onSelect('winners')}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'privacy'>('home');
  const [subView, setSubView] = useState<SubView>('menu');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check session
    const stored = storageService.getCurrentUser();
    if (stored) setCurrentUser(stored);
  }, []);

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setSubView('menu');
  };

  const handleUserUpdate = (updated: User) => {
    storageService.saveUser(updated);
    setCurrentUser(updated);
  };

  const resetHome = () => {
    setCurrentView('home');
    setSubView('menu');
    setMobileMenuOpen(false);
  };

  if (!currentUser) {
    return <AuthView onLogin={user => {
      storageService.setCurrentUser(user);
      setCurrentUser(user);
    }} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
         <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="scale-75 origin-left"><AppLogo /></div>
            <button onClick={handleLogout} className="flex items-center text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"><LogOut size={16} className="mr-2"/> SALIR</button>
         </div>
         <AdminPanel />
      </div>
    );
  }

  // User Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 selection:bg-brand-pink selection:text-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div onClick={resetHome} className="cursor-pointer transform hover:scale-105 transition">
            <AppLogo />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-2 items-center">
            <button onClick={resetHome} className={`px-4 py-2 rounded-full font-bold transition ${currentView === 'home' ? 'bg-brand-teal text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Inicio</button>
            <button onClick={() => setCurrentView('profile')} className={`px-4 py-2 rounded-full font-bold transition ${currentView === 'profile' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Mi Perfil</button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button onClick={handleLogout} className="text-red-500 font-bold flex items-center px-4 py-2 rounded-full hover:bg-red-50 transition"><LogOut className="w-4 h-4 mr-2" /> Salir</button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
           <div className="md:hidden bg-white border-t p-4 flex flex-col space-y-2 shadow-xl absolute w-full animate-fade-in z-50">
             <button onClick={() => { resetHome(); setMobileMenuOpen(false); }} className="p-3 text-left font-bold text-gray-700 hover:bg-gray-50 rounded-lg">Inicio</button>
             <button onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }} className="p-3 text-left font-bold text-gray-700 hover:bg-gray-50 rounded-lg">Mi Perfil</button>
             <button onClick={handleLogout} className="p-3 text-left font-bold text-red-500 hover:bg-red-50 rounded-lg">Cerrar Sesión</button>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {currentView === 'privacy' && <PrivacyPolicy />}
        
        {currentView === 'profile' && (
          <div className="animate-fade-in">
            <ProfileSection user={currentUser} onUpdate={handleUserUpdate} onLogout={handleLogout} />
          </div>
        )}

        {currentView === 'home' && (
          <div>
            {/* Show Back Button if not in menu */}
            {subView !== 'menu' && (
              <button 
                onClick={() => setSubView('menu')}
                className="mb-8 flex items-center text-gray-500 hover:text-brand-blue font-bold transition group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
                   <ArrowLeft size={20} />
                </div>
                Volver al Menú Principal
              </button>
            )}

            {subView === 'menu' && (
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-black text-gray-800">¡Hola, {currentUser.firstName}! 👋</h1>
                      <p className="text-gray-500 font-medium">¿Qué quieres hacer hoy?</p>
                    </div>
                 </div>
                 <DashboardMenu onSelect={setSubView} />
              </div>
            )}

            {subView === 'downloads' && (
              <InstallersSection user={currentUser} onUpdateUser={handleUserUpdate} />
            )}

            {subView === 'surveys' && (
              <SurveysSection user={currentUser} onUpdateUser={handleUserUpdate} />
            )}

            {subView === 'prizes' && (
              <PrizesSection viewMode="prizes" />
            )}

            {subView === 'winners' && (
              <PrizesSection viewMode="winners" />
            )}

            {subView === 'los33' && (
              <Los33Section user={currentUser} onUpdateUser={handleUserUpdate} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center opacity-80 hover:opacity-100 transition">
            <div className="scale-90">
              <AppLogo />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium">© 2026 RETO33 SD. Hecho con ❤️ para la juventud.</p>
          <div>
            <button onClick={() => setCurrentView('privacy')} className="text-xs text-brand-blue hover:text-brand-pink font-bold uppercase tracking-widest transition-colors">Política de Privacidad</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
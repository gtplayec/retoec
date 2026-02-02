import React, { useState, useEffect, useRef } from 'react';
import * as emailjs from '@emailjs/browser';
import { 
  User, Survey, SurveyOption, Winner, Zone, AppInstaller, Prize 
} from './types';
import { LOCATIONS, INITIAL_PRIZES, INSTALLERS, AppLogo } from './constants';
import { storageService } from './services/storage';
import { 
  LogOut, User as UserIcon, Download, Trophy, 
  Vote, Settings, Trash2, AlertTriangle, FileText, Menu, X, ArrowLeft, Star, Gift, Plus, Image as ImageIcon, Mail, CheckCircle, Loader2
} from 'lucide-react';

// --- View Components ---

// 1. Auth Component
const AuthView: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', phone: '', 
    zone: 'Santo Domingo' as Zone, sector: '', email: '', password: ''
  });

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    // Check for other admins stored
    const users = storageService.getUsers();
    // Normal User Login check
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      onLogin(foundUser);
    } else {
      alert("Credenciales incorrectas o usuario no encontrado.");
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando registro...");
    
    // Validación manual para asegurar feedback al usuario
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.phone || !formData.email || !formData.sector) {
      alert("Por favor completa todos los campos para continuar.");
      return;
    }

    // Check if user already exists
    const users = storageService.getUsers();
    if (users.find(u => u.email === formData.email)) {
        alert("Este correo electrónico ya está registrado.");
        return;
    }

    setIsSendingCode(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    try {
      // Intento de obtener la función send de varias formas posibles para compatibilidad
      // 'emailjs' importado como namespace (* as emailjs)
      const sendEmail = (emailjs as any).send || (emailjs as any).default?.send;

      if (typeof sendEmail !== 'function') {
         console.error("EmailJS import structure:", emailjs);
         throw new Error("No se pudo cargar la librería de envío de correos. Por favor recarga la página.");
      }

      await sendEmail(
        'service_pkc5h87',
        'template_rgm0xms',
        {
          to_name: `${formData.firstName} ${formData.lastName}`,
          email_registro: formData.email, 
          verification_code: code, // AQUI SE HIZO EL CAMBIO: Se usa el nombre de variable que configuraste en EmailJS
          message: `Tu código de verificación es: ${code}`
        },
        'owUYyPbGCKtFmhc8n'
      );
      
      setIsVerifying(true);
      alert(`Hemos enviado un código de verificación a ${formData.email}. Revisa tu bandeja de entrada o spam.`);
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert(`Error al enviar el correo: ${error.message || 'Inténtalo de nuevo'}.`);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode !== verificationCode) {
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
      role: 'user',
      downloadHistory: [],
      surveyHistory: []
    };
    storageService.saveUser(newUser);
    onLogin(newUser);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-4 text-brand-teal">
            <Mail size={48} />
          </div>
          <h2 className="text-2xl font-bold text-brand-blue mb-2">Verifica tu Correo</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Hemos enviado un código de 6 dígitos a <br/><strong>{formData.email}</strong>
          </p>
          
          <form onSubmit={handleFinalRegister} className="space-y-4">
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000" 
              className="w-full text-center text-3xl tracking-widest p-2 border-2 border-brand-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
            />
            
            <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-lg hover:bg-blue-900 transition font-bold flex justify-center items-center">
              <CheckCircle size={20} className="mr-2" /> Verificar y Entrar
            </button>
          </form>

          <button 
            onClick={() => setIsVerifying(false)} 
            className="mt-4 text-gray-500 text-sm underline"
          >
            Corregir correo electrónico
          </button>
        </div>
      </div>
    );
  }

  if (!isRegistering) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6"><AppLogo /></div>
          <h2 className="text-2xl font-bold text-center text-brand-blue mb-6">Iniciar Sesión</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required className="w-full p-2 border rounded mt-1" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña (Solo Admin) / Email (Usuario)</label>
              <input type="password" className="w-full p-2 border rounded mt-1" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña para admin..." />
              <p className="text-xs text-gray-500 mt-1">Usuarios normales pueden usar cualquier contraseña para demo.</p>
            </div>
            <button type="submit" className="w-full bg-brand-teal text-white py-2 rounded hover:bg-teal-600 transition">Entrar</button>
          </form>
          <div className="mt-4 text-center">
            <p>¿No tienes cuenta? <button onClick={() => setIsRegistering(true)} className="text-brand-blue font-bold underline">Regístrate</button></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full my-8">
        <div className="flex justify-center mb-6"><AppLogo /></div>
        <h2 className="text-2xl font-bold text-center text-brand-blue mb-6">Registro de Usuario</h2>
        <form onSubmit={handlePreRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nombre" className="p-2 border rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <input placeholder="Apellido" className="p-2 border rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Edad" type="number" className="p-2 border rounded" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            <input placeholder="Teléfono" className="p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <input placeholder="Email" type="email" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Zona</label>
            <select className="w-full p-2 border rounded" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value as Zone, sector: ''})}>
              <option value="Santo Domingo">Santo Domingo</option>
              <option value="La Concordia">La Concordia</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Sector</label>
            <select className="w-full p-2 border rounded" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
              <option value="">Seleccione un sector...</option>
              {LOCATIONS[formData.zone].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSendingCode}
            className={`w-full text-white py-2 rounded transition font-bold flex justify-center items-center ${isSendingCode ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-pink hover:bg-pink-600'}`}
          >
            {isSendingCode ? <><Loader2 className="animate-spin mr-2" /> Enviando Código...</> : 'Registrarse y Verificar'}
          </button>
          <div className="text-center mt-2">
             <button type="button" onClick={() => setIsRegistering(false)} className="text-gray-500 text-sm underline">Volver al login</button>
          </div>
        </form>
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-brand-blue mb-4 flex items-center"><UserIcon className="mr-2" /> Mi Perfil</h2>
      
      {isEditing ? (
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
            <input className="border p-2 rounded" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} />
            <input className="border p-2 rounded" type="number" value={editData.age} onChange={e => setEditData({...editData, age: parseInt(e.target.value)})} />
            <input className="border p-2 rounded" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
           </div>
           <div>
             <select className="border p-2 rounded w-full" value={editData.zone} onChange={e => setEditData({...editData, zone: e.target.value as Zone, sector: ''})}>
               <option value="Santo Domingo">Santo Domingo</option>
               <option value="La Concordia">La Concordia</option>
             </select>
           </div>
           <div>
             <select className="border p-2 rounded w-full" value={editData.sector} onChange={e => setEditData({...editData, sector: e.target.value})}>
               {LOCATIONS[editData.zone].map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           <div className="flex space-x-2">
             <button onClick={handleSave} className="bg-brand-teal text-white px-4 py-2 rounded">Guardar</button>
             <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancelar</button>
           </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Edad:</strong> {user.age}</p>
          <p><strong>Teléfono:</strong> {user.phone}</p>
          <p><strong>Ubicación:</strong> {user.sector}, {user.zone}</p>
          <button onClick={() => setIsEditing(true)} className="text-brand-blue underline text-sm">Editar Información</button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-bold text-lg mb-2">Historial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-brand-teal">Descargas</h4>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              {user.downloadHistory.length > 0 ? user.downloadHistory.map((d, i) => <li key={i}>{d}</li>) : <li>Sin descargas</li>}
            </ul>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-brand-pink">Encuestas</h4>
             <ul className="list-disc pl-4 text-sm text-gray-600">
              {user.surveyHistory.length > 0 ? user.surveyHistory.map((s, i) => <li key={i}>Encuesta ID: {s}</li>) : <li>Sin participación</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-4">
        <button onClick={handleDelete} className="flex items-center text-red-600 hover:text-red-800">
          <Trash2 className="w-4 h-4 mr-2" /> Eliminar mi cuenta
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
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-brand-blue flex items-center"><Download className="mr-3" /> Zona de Descargas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {INSTALLERS.map(installer => (
          <div key={installer.id} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand-teal flex flex-col justify-between hover:shadow-xl transition">
            <div>
               <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-brand-blue mx-auto">
                 {installer.category === 'Movies' && '🎬'}
                 {installer.category === 'Music' && '🎵'}
                 {installer.category === 'Games' && '🎮'}
                 {installer.category === 'Tutorial' && '📺'}
               </div>
               <h3 className="text-xl font-bold text-center mb-1">{installer.name}</h3>
               <p className="text-gray-500 text-center text-sm mb-4">{installer.version}</p>
            </div>
            <button 
              onClick={() => handleDownloadClick(installer)}
              disabled={installer.downloadLink === '#'}
              className={`w-full py-2 rounded font-bold text-white transition ${installer.downloadLink === '#' ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-pink hover:bg-pink-600'}`}
            >
              {installer.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Warning Modal */}
      {modalData.isOpen && modalData.installer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <div className="flex items-center text-amber-500 mb-4">
              <AlertTriangle className="w-8 h-8 mr-2" />
              <h3 className="text-xl font-bold">ADVERTENCIA</h3>
            </div>
            <div className="bg-amber-50 p-4 rounded border border-amber-200 text-sm whitespace-pre-line mb-6 text-gray-800">
              {modalData.installer.warningText}
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setModalData({ isOpen: false, installer: null })} className="px-4 py-2 bg-gray-200 rounded text-gray-700">Cancelar</button>
              <button onClick={confirmDownload} className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-800">Aceptar y Descargar</button>
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
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-brand-blue flex items-center"><Vote className="mr-3" /> Encuestas</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['Alcalde', 'Prefecto', 'Obras', 'Nacional'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === cat ? 'bg-brand-teal text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSurveys.length === 0 && <p className="text-gray-500 italic">No hay encuestas activas en esta categoría.</p>}
        {filteredSurveys.map(survey => (
          <div key={survey.id} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-brand-blue">{survey.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {survey.options.map(opt => (
                <div key={opt.id} className={`border rounded-lg p-4 cursor-pointer transition hover:border-brand-teal ${user.surveyHistory.includes(survey.id) ? 'opacity-75' : ''}`}
                     onClick={() => !user.surveyHistory.includes(survey.id) && handleVote(survey.id, opt.id)}>
                   {opt.imageUrl && (
                     <img src={opt.imageUrl} alt={opt.label} className="w-full h-32 object-cover rounded mb-3 bg-gray-100" />
                   )}
                   <div className="text-center font-bold">{opt.label}</div>
                   {user.surveyHistory.includes(survey.id) && (
                     <div className="text-center text-sm text-brand-pink font-bold mt-2">{opt.votes} Votos</div>
                   )}
                </div>
              ))}
            </div>
            {user.surveyHistory.includes(survey.id) && (
               <div className="mt-4 bg-green-100 text-green-800 p-2 rounded text-center text-sm">Ya participaste en esta encuesta.</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-brand-blue text-white p-6 rounded-xl mt-8">
        <h3 className="text-xl font-bold mb-2">¡Participa y Gana!</h3>
        <p>Cada vez que completas una encuesta, generas un ticket para el sorteo semanal.</p>
        <div className="mt-4 text-brand-yellow font-bold text-2xl">
          Tus Tickets Acumulados: {user.surveyHistory.length}
        </div>
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
    <div className="space-y-8 animate-fade-in">
       {viewMode === 'prizes' && (
         <div>
           <h2 className="text-3xl font-bold text-brand-blue flex items-center mb-6"><Gift className="mr-3 text-brand-gold" /> Premios de la Semana</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {prizes.map(prize => (
                <div key={prize.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-brand-gold hover:shadow-lg transition">
                  {prize.image && (
                    <img src={prize.image} alt={prize.name} className="w-full h-32 object-cover rounded mb-3 bg-gray-100" />
                  )}
                  <h4 className="font-bold text-lg">{prize.name}</h4>
                  <p className="text-gray-600 text-sm">{prize.description}</p>
                </div>
              ))}
           </div>
         </div>
       )}

       {viewMode === 'winners' && (
         <div className="bg-white p-6 rounded-xl shadow-lg">
           <h2 className="text-3xl font-bold text-brand-blue flex items-center mb-6"><Trophy className="mr-3 text-brand-gold" /> Muro de la Fama</h2>
           <h3 className="text-xl font-semibold mb-4 text-gray-700">Ganadores Anteriores</h3>
           {winners.length === 0 ? (
             <p className="text-gray-500 italic">Aún no hay ganadores registrados en el sistema.</p>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="p-3">Fecha</th>
                     <th className="p-3">Ganador</th>
                     <th className="p-3">Premio</th>
                     <th className="p-3">Boleto #</th>
                   </tr>
                 </thead>
                 <tbody>
                   {winners.map(w => (
                     <tr key={w.id} className="border-t">
                       <td className="p-3">{w.date}</td>
                       <td className="p-3 font-semibold">{w.winnerName}</td>
                       <td className="p-3">{w.prizeName}</td>
                       <td className="p-3 text-brand-pink">{w.ticketNumber}</td>
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
      <p>GTPlay Ecuador respeta su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.</p>
      
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

// 3. Admin Panel
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
    link.setAttribute("download", "participantes_gtplay.csv");
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
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center overflow-x-auto">
        <h2 className="text-xl font-bold whitespace-nowrap mr-4">Panel de Administración</h2>
        <div className="flex space-x-4">
          <button onClick={() => setActiveView('stats')} className={activeView === 'stats' ? 'text-brand-yellow font-bold underline' : 'hover:text-gray-300'}>Estadísticas</button>
          <button onClick={() => setActiveView('surveys')} className={activeView === 'surveys' ? 'text-brand-yellow font-bold underline' : 'hover:text-gray-300'}>Encuestas</button>
          <button onClick={() => setActiveView('prizes')} className={activeView === 'prizes' ? 'text-brand-yellow font-bold underline' : 'hover:text-gray-300'}>Premios</button>
          <button onClick={() => setActiveView('admins')} className={activeView === 'admins' ? 'text-brand-yellow font-bold underline' : 'hover:text-gray-300'}>Usuarios/Admins</button>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {activeView === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold">Total Usuarios</h3>
              <p className="text-4xl">{users.length}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
               <h3 className="text-xl font-bold">Encuestas Activas</h3>
               <p className="text-4xl">{surveys.filter(s => s.active).length}</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg flex flex-col justify-center">
               <button onClick={downloadExcel} className="bg-brand-blue text-white py-2 px-4 rounded hover:bg-blue-800 flex items-center justify-center">
                 <Download className="mr-2" /> Descargar Base de Datos
               </button>
            </div>
          </div>
        )}

        {activeView === 'admins' && (
          <div className="space-y-6">
             <div className="bg-gray-50 p-6 rounded-lg border">
               <h3 className="font-bold mb-2">Agregar Nuevo Administrador</h3>
               <div className="flex gap-2">
                 <input 
                   placeholder="Email del usuario existente" 
                   className="border p-2 flex-grow rounded" 
                   value={newAdminEmail}
                   onChange={e => setNewAdminEmail(e.target.value)}
                 />
                 <button onClick={addAdmin} className="bg-brand-teal text-white px-4 rounded">Promover</button>
               </div>
               <p className="text-xs text-gray-500 mt-2">El usuario debe estar registrado previamente en la App.</p>
             </div>
             
             <div>
               <h3 className="font-bold mb-4">Lista de Usuarios</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-200"><th className="p-2">Nombre</th><th className="p-2">Email</th><th className="p-2">Rol</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b">
                          <td className="p-2">{u.firstName} {u.lastName}</td>
                          <td className="p-2">{u.email}</td>
                          <td className="p-2 font-bold">{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          </div>
        )}

        {activeView === 'surveys' && (
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
               <h3 className="text-lg font-bold mb-4 text-brand-blue">Crear Nueva Encuesta</h3>
               <div className="space-y-4">
                 <input 
                   placeholder="Título de la Encuesta" 
                   className="w-full p-2 border rounded"
                   value={newSurveyTitle}
                   onChange={e => setNewSurveyTitle(e.target.value)}
                 />
                 <select 
                  className="w-full p-2 border rounded"
                  value={newSurveyCat}
                  onChange={e => setNewSurveyCat(e.target.value as any)}
                 >
                   <option value="Alcalde">Alcalde</option>
                   <option value="Prefecto">Prefecto</option>
                   <option value="Obras">Obras Prioritarias</option>
                   <option value="Nacional">Nacional</option>
                 </select>

                 <div className="space-y-2">
                   <p className="font-semibold">Opciones:</p>
                   {surveyOptions.map((opt, idx) => (
                     <div key={idx} className="flex gap-2 items-center">
                       <input 
                         placeholder={`Opción ${idx + 1}`} 
                         className="flex-grow p-2 border rounded"
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
                           className="text-xs"
                           onChange={e => handleImageUpload(idx, e)}
                         />
                       )}
                     </div>
                   ))}
                   <button 
                     onClick={() => setSurveyOptions([...surveyOptions, { id: Date.now().toString(), label: '', votes: 0 }])}
                     className="text-sm text-brand-blue underline"
                   >
                     + Agregar Opción
                   </button>
                 </div>
                 
                 <button onClick={createSurvey} className="bg-brand-pink text-white px-6 py-2 rounded font-bold">Publicar Encuesta</button>
               </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Encuestas Existentes</h3>
              {surveys.map(s => (
                <div key={s.id} className="border p-4 mb-2 rounded flex justify-between items-center bg-white">
                  <div>
                    <span className="font-bold">{s.title}</span> <span className="text-xs bg-gray-200 px-2 rounded">{s.category}</span>
                    <div className="text-xs text-gray-500 mt-1">Votos totales: {s.options.reduce((acc, curr) => acc + curr.votes, 0)}</div>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = surveys.filter(sv => sv.id !== s.id);
                      storageService.saveSurveys(updated);
                      setSurveys(updated);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'prizes' && (
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
               <h3 className="text-lg font-bold mb-4 text-brand-gold">Agregar Nuevo Premio de la Semana</h3>
               <div className="space-y-4">
                 <input 
                   placeholder="Nombre del Premio" 
                   className="w-full p-2 border rounded"
                   value={newPrizeName}
                   onChange={e => setNewPrizeName(e.target.value)}
                 />
                 <input 
                   placeholder="Descripción" 
                   className="w-full p-2 border rounded"
                   value={newPrizeDesc}
                   onChange={e => setNewPrizeDesc(e.target.value)}
                 />
                 <div>
                   <label className="block text-sm font-medium mb-1">Imagen Referencial</label>
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePrizeImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-white hover:file:bg-yellow-600"
                   />
                   {newPrizeImage && <img src={newPrizeImage} alt="Preview" className="h-24 w-24 object-cover mt-2 rounded" />}
                 </div>
                 <button onClick={addPrize} className="bg-brand-blue text-white px-6 py-2 rounded font-bold flex items-center">
                   <Plus size={16} className="mr-2" /> Agregar Premio
                 </button>
               </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Lista de Premios Actuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prizes.map(p => (
                  <div key={p.id} className="border p-4 rounded bg-white flex flex-col justify-between shadow-sm">
                    <div>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                          <ImageIcon />
                        </div>
                      )}
                      <h4 className="font-bold text-brand-blue">{p.name}</h4>
                      <p className="text-sm text-gray-600">{p.description}</p>
                    </div>
                    <button 
                      onClick={() => deletePrize(p.id)}
                      className="mt-3 text-red-500 hover:text-red-700 text-sm flex items-center justify-end"
                    >
                      <Trash2 size={16} className="mr-1" /> Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Layout ---

type SubView = 'menu' | 'downloads' | 'surveys' | 'prizes' | 'winners';

const DashboardMenu: React.FC<{ onSelect: (v: SubView) => void }> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-8">
      <button 
        onClick={() => onSelect('downloads')}
        className="bg-brand-teal text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition duration-300 flex flex-col items-center justify-center h-64 group"
      >
        <Download size={64} className="mb-4 group-hover:animate-bounce" />
        <h3 className="text-2xl font-bold">Zona de Descargas</h3>
        <p className="mt-2 text-center opacity-90">Apps, Películas y Música Gratis</p>
      </button>

      <button 
        onClick={() => onSelect('surveys')}
        className="bg-brand-blue text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition duration-300 flex flex-col items-center justify-center h-64 group"
      >
        <Vote size={64} className="mb-4 group-hover:rotate-12 transition-transform" />
        <h3 className="text-2xl font-bold">Encuestas</h3>
        <p className="mt-2 text-center opacity-90">Participa y Gana Tickets</p>
      </button>

      <button 
        onClick={() => onSelect('prizes')}
        className="bg-brand-gold text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition duration-300 flex flex-col items-center justify-center h-64 group"
      >
        <Gift size={64} className="mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-2xl font-bold">Premios de la Semana</h3>
        <p className="mt-2 text-center opacity-90">Mira lo que puedes ganar</p>
      </button>

      <button 
        onClick={() => onSelect('winners')}
        className="bg-brand-pink text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition duration-300 flex flex-col items-center justify-center h-64 group"
      >
        <Trophy size={64} className="mb-4 group-hover:text-yellow-200 transition-colors" />
        <h3 className="text-2xl font-bold">Muro de la Fama</h3>
        <p className="mt-2 text-center opacity-90">Ganadores de sorteos anteriores</p>
      </button>
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
      <div className="min-h-screen">
         <div className="bg-white shadow p-4 flex justify-between items-center">
            <AppLogo />
            <button onClick={handleLogout} className="flex items-center text-red-500"><LogOut size={16} className="mr-1"/> Salir</button>
         </div>
         <AdminPanel />
      </div>
    );
  }

  // User Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div onClick={resetHome} className="cursor-pointer">
            <AppLogo />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            <button onClick={resetHome} className={`font-medium ${currentView === 'home' ? 'text-brand-teal' : 'text-gray-600'}`}>Inicio</button>
            <button onClick={() => setCurrentView('profile')} className={`font-medium ${currentView === 'profile' ? 'text-brand-teal' : 'text-gray-600'}`}>Mi Perfil</button>
            <button onClick={handleLogout} className="text-red-500 font-medium flex items-center"><LogOut className="w-4 h-4 mr-1" /> Salir</button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
           <div className="md:hidden bg-white border-t p-4 flex flex-col space-y-3 shadow-lg">
             <button onClick={resetHome}>Inicio</button>
             <button onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }}>Mi Perfil</button>
             <button onClick={handleLogout} className="text-red-500 text-left">Salir</button>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {currentView === 'privacy' && <PrivacyPolicy />}
        
        {currentView === 'profile' && (
          <ProfileSection user={currentUser} onUpdate={handleUserUpdate} onLogout={handleLogout} />
        )}

        {currentView === 'home' && (
          <div>
            {/* Show Back Button if not in menu */}
            {subView !== 'menu' && (
              <button 
                onClick={() => setSubView('menu')}
                className="mb-6 flex items-center text-gray-600 hover:text-brand-blue font-semibold transition"
              >
                <ArrowLeft className="mr-2" /> Volver al Menú Principal
              </button>
            )}

            {subView === 'menu' && (
              <DashboardMenu onSelect={setSubView} />
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl">
              <AppLogo />
            </div>
          </div>
          <p className="text-sm text-gray-400">© 2026 GTPlay Ecuador. Todos los derechos reservados.</p>
          <button onClick={() => setCurrentView('privacy')} className="text-xs text-gray-500 hover:text-white underline">Política de Privacidad</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
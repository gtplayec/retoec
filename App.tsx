import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Trophy, 
  Vote, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  Lock, 
  User as UserIcon,
  ChevronRight, 
  Gift, 
  Search, 
  Loader2, 
  Settings, 
  Calendar, 
  History, 
  Trash2, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Film, 
  Music, 
  Gamepad2, 
  BookOpen, 
  ArrowLeft, 
  Building2, 
  Map, 
  HardHat, 
  Flag, 
  Mail, 
  Send, 
  Shield, 
  Users, 
  Database, 
  Eye, 
  FileSpreadsheet, 
  KeyRound, 
  AlertCircle, 
  UserPlus, 
  FileText, 
  Edit, 
  Plus, 
  MinusCircle, 
  ImageIcon, 
  Upload, 
  Sparkles, 
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

import { User, Installer, Survey, PastDraw, Prize, SurveyOption, DownloadRecord, SurveyRecord } from './types';
import { 
  MOCK_INSTALLERS, 
  INITIAL_PRIZES, 
  MOCK_SURVEYS, 
  PAST_DRAWS, 
  ZONES 
} from './constants';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { generateWeeklySurvey } from './services/geminiService';

// --- Services Helper for "Mock Database" ---
const DB_KEY = 'reto33_master_db';
const SURVEYS_KEY = 'reto33_surveys';

const getMasterDB = (): User[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToMasterDB = (user: User) => {
  const db = getMasterDB();
  const existingIndex = db.findIndex(u => u.email === user.email);
  
  if (existingIndex >= 0) {
    db[existingIndex] = user;
  } else {
    db.push(user);
  }
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const removeFromMasterDB = (userId: string) => {
  const db = getMasterDB().filter(u => u.id !== userId);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- INITIALIZATION OF DEFAULT ADMIN ---
const initDefaultAdmin = () => {
  const db = getMasterDB();
  const adminEmail = 'gtplayec@gmail.com';
  
  // Check if admin already exists
  if (!db.find(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
    const defaultAdmin: User = {
      id: 'admin-master-001',
      name: 'Admin',
      surname: 'Principal',
      age: 99,
      phone: '0999999999',
      sector: 'Administración',
      email: adminEmail,
      password: 'RETO2026', // Password defined by user
      role: 'admin',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
      hasVotedCurrentWeek: false,
      downloadHistory: [],
      surveyHistory: []
    };
    db.push(defaultAdmin);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    console.log('Default administrator initialized.');
  }
};

// Run initialization immediately
initDefaultAdmin();

// --- Layout Components ---

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-reto-light flex flex-col items-center justify-center p-4">
    <div className="mb-8 scale-110">
      <Link to="/" className="block hover:opacity-90 transition-opacity">
        <Logo size="lg" />
      </Link>
    </div>
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border-t-4 border-reto-pink">
      {children}
    </div>
    <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
      <p>&copy; {new Date().getFullYear()} Reto 33. Todos los derechos reservados.</p>
      <Link to="/privacy" className="text-reto-navy hover:underline font-medium">
        Políticas de Privacidad y Uso de Datos
      </Link>
    </div>
  </div>
);

const MainLayout: React.FC<{ children: React.ReactNode; user: User | null; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const logoLink = isAdmin ? '/admin' : '/dashboard';

  const NavItem = ({ to, icon: Icon, label, highlight = false }: { to: string; icon: any; label: string, highlight?: boolean }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-reto-navy text-white' 
            : highlight 
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'text-gray-600 hover:bg-gray-100 hover:text-reto-navy'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-reto-gold' : ''} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-reto-light flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-center border-b border-gray-100">
            <Link to={logoLink} className="hover:opacity-90 transition-opacity">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-reto-navy text-white flex items-center justify-center font-bold">
                {user?.name.charAt(0)}{user?.surname.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name} {isAdmin && '👑'}</p>
                <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Administrador' : user?.sector}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavItem to="/dashboard" icon={UserIcon} label="Mi Panel" />
              
              {isAdmin && (
                <div className="py-2">
                  <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
                  <NavItem to="/admin" icon={Shield} label="Panel de Control" highlight />
                </div>
              )}

              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Comunidad</p>
              <NavItem to="/profile" icon={Settings} label="Mi Perfil" />
              <NavItem to="/downloads" icon={Download} label="Descargas" />
              <NavItem to="/surveys" icon={Vote} label="Encuestas" />
              <NavItem to="/winners" icon={Trophy} label="Premios y Ganadores" />
              <NavItem to="/privacy" icon={FileText} label="Políticas de Privacidad" />
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-gray-100">
            <button 
              onClick={onLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white shadow-sm lg:hidden sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <Link to={logoLink} className="hover:opacity-90 transition-opacity">
              <Logo size="sm" />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Screens & Components ---

const PrivacyPolicyScreen = () => {
  const sections = [
    {
      title: "1. Responsable del Tratamiento",
      content: "Reto 33: Renovación Total es la entidad responsable de la recolección, almacenamiento y tratamiento de los datos personales proporcionados por los usuarios a través de esta plataforma digital."
    },
    {
      title: "2. Datos Personales Recopilados",
      content: "Para brindar nuestros servicios, recopilamos la siguiente información personal:\n• Datos de Identificación: Nombre, Apellido y Edad (para verificar mayoría de edad).\n• Datos de Contacto: Correo electrónico y número de teléfono celular.\n• Datos Demográficos: Sector y zona de residencia (Cantón/Parroquia) para segmentación de encuestas y beneficios locales.\n• Datos de Interacción: Historial de descargas, participación en encuestas y registro de premios ganados."
    },
    {
      title: "3. Finalidad del Tratamiento de Datos",
      content: "La información recolectada tiene los siguientes propósitos exclusivos:\n• Gestión de Usuarios: Creación y administración de cuentas personales para acceso a la plataforma.\n• Sorteos y Premios: Verificación de identidad para la participación legal en sorteos semanales y contacto con los ganadores.\n• Estadísticas Comunitarias: Análisis agregado de las respuestas en encuestas para entender las necesidades de los sectores (los votos son anónimos en su reporte final).\n• Comunicación: Envío de notificaciones sobre nuevos instaladores, ganadores de sorteos y actualizaciones importantes."
    },
    {
      title: "4. No Divulgación a Terceros",
      content: "Reto 33 se compromete a no vender, alquilar ni compartir sus datos personales con empresas terceras para fines publicitarios. Los datos pueden ser compartidos únicamente si existe una obligación legal o una orden judicial."
    },
    {
      title: "5. Derechos del Usuario (ARCO)",
      content: "Como titular de sus datos, usted tiene derecho a:\n• Acceso: Conocer qué datos suyos tenemos.\n• Rectificación: Actualizar sus datos desde la sección 'Mi Perfil'.\n• Cancelación: Solicitar la eliminación definitiva de su cuenta y sus datos de nuestros registros.\n• Oposición: Oponerse al uso de sus datos para fines específicos.\n\nPara ejercer estos derechos, puede utilizar las herramientas automáticas en la sección 'Mi Perfil' o contactar al administrador."
    },
    {
      title: "6. Seguridad de la Información",
      content: "Implementamos medidas técnicas para proteger su información contra acceso no autorizado. Sin embargo, el usuario es responsable de mantener la confidencialidad de su contraseña y notificar cualquier uso indebido de su cuenta."
    },
    {
      title: "7. Publicidad de Ganadores",
      content: "Al aceptar estas políticas, los usuarios consienten que, en caso de resultar ganadores de un sorteo, su nombre y la inicial de su apellido, así como el sector de residencia, puedan ser publicados en la sección de 'Ganadores' para fines de transparencia del concurso."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="text-center space-y-4">
         <div className="inline-flex p-3 bg-reto-navy/10 rounded-full mb-2">
           <Shield className="w-10 h-10 text-reto-navy" />
         </div>
         <h1 className="text-3xl md:text-4xl font-black text-reto-navy">Políticas de Privacidad</h1>
         <p className="text-gray-600 max-w-2xl mx-auto">
           En Reto 33 valoramos tu confianza. A continuación detallamos cómo protegemos y utilizamos tu información personal.
         </p>
         <p className="text-xs text-gray-500">Última actualización: Febrero 2025</p>
       </div>

       <div className="grid gap-6">
         {sections.map((section, idx) => (
           <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
             <h3 className="text-lg font-bold text-reto-navy mb-3">{section.title}</h3>
             <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
               {section.content}
             </p>
           </div>
         ))}
       </div>

       <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
         <h4 className="font-bold text-reto-navy mb-2">¿Tienes dudas adicionales?</h4>
         <p className="text-sm text-gray-600 mb-4">
           Nuestro equipo de soporte está disponible para responder cualquier inquietud sobre el manejo de tus datos.
         </p>
         <a href="mailto:soporte@reto33.com" className="text-reto-pink font-bold hover:underline">
           Contactar a Soporte
         </a>
       </div>
       
       <div className="flex justify-center pt-4">
          <Link to="/" className="text-gray-500 hover:text-reto-navy flex items-center text-sm font-medium">
             <ArrowLeft size={16} className="mr-1"/> Volver al Inicio
          </Link>
       </div>
    </div>
  );
};

const SurveyManager = ({ surveys, onUpdateSurvey, onAddSurvey }: { surveys: Survey[], onUpdateSurvey: (s: Survey) => void, onAddSurvey?: (s: Survey) => void }) => {
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Survey | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const startEdit = (survey: Survey) => {
    setEditingSurveyId(survey.id);
    setEditForm(JSON.parse(JSON.stringify(survey)));
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateSurvey(editForm);
      setEditingSurveyId(null);
      setEditForm(null);
    }
  };

  const updateOption = (index: number, field: keyof SurveyOption, value: any) => {
    if (!editForm) return;
    const newOptions = [...editForm.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setEditForm({ ...editForm, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!editForm) return;
    const newOptions = editForm.options.filter((_, i) => i !== index);
    setEditForm({ ...editForm, options: newOptions });
  };

  const addOption = () => {
    if (!editForm) return;
    const newOption: SurveyOption = {
      id: `opt-${Date.now()}`,
      text: 'Nueva Opción',
      votes: 0,
      image: editForm.category.includes('Alcalde') || editForm.category.includes('Prefecto') ? '' : undefined
    };
    setEditForm({ ...editForm, options: [...editForm.options, newOption] });
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Simple size check (1MB)
      if (file.size > 1024 * 1024) { 
        alert("La imagen es muy grande. Por favor usa una imagen menor a 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateOption(index, 'image', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const newSurvey = await generateWeeklySurvey();
    setIsGenerating(false);
    if (newSurvey && onAddSurvey) {
      onAddSurvey(newSurvey);
    } else if (!newSurvey) {
      alert("No se pudo generar la encuesta. Verifica la API Key y la conexión.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-reto-navy flex items-center">
          <Vote className="mr-2" /> Gestión de Encuestas
        </h3>
        {onAddSurvey && (
          <Button onClick={handleGenerateAI} disabled={isGenerating} className="flex items-center gap-2 text-sm py-2">
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generar Encuesta (IA)
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {editingSurveyId === survey.id && editForm ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{editForm.category}</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" onClick={() => setEditingSurveyId(null)} className="py-1 px-3 text-sm">Cancelar</Button>
                    <Button onClick={handleSave} className="py-1 px-3 text-sm">Guardar</Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2" 
                    value={editForm.question}
                    onChange={(e) => setEditForm({...editForm, question: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Opciones</label>
                  {editForm.options.map((opt, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-400 w-6">{idx + 1}.</span>
                        <input 
                          type="text" 
                          className="flex-1 border rounded p-1 text-sm" 
                          value={opt.text}
                          onChange={(e) => updateOption(idx, 'text', e.target.value)}
                          placeholder="Texto de la opción"
                        />
                        <button onClick={() => removeOption(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <MinusCircle size={16} />
                        </button>
                      </div>
                      
                      {(editForm.category.includes('Alcalde') || editForm.category.includes('Prefecto')) && (
                        <div className="flex items-center gap-3 ml-8 mt-1 p-2 bg-white rounded border border-dashed border-gray-300">
                           {/* Preview */}
                           <div className="relative w-12 h-12 shrink-0">
                             {opt.image ? (
                               <img src={opt.image} alt="Preview" className="w-full h-full rounded-full object-cover border bg-gray-100" />
                             ) : (
                               <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border text-gray-400">
                                 <UserIcon size={20} />
                               </div>
                             )}
                           </div>
                           
                           {/* File Input */}
                           <div className="flex-1">
                             <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-reto-navy text-white rounded-md shadow-sm text-xs font-medium hover:bg-opacity-90 transition-colors">
                               <Upload size={14} className="mr-2" />
                               {opt.image ? 'Cambiar Foto' : 'Subir Foto'}
                               <input 
                                 type="file" 
                                 accept="image/*"
                                 className="hidden" 
                                 onChange={(e) => handleImageUpload(idx, e)}
                               />
                             </label>
                             <p className="text-[10px] text-gray-500 mt-1">Soporta JPG, PNG. Máx 1MB.</p>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={addOption} className="text-sm text-reto-navy font-medium flex items-center hover:underline mt-2">
                    <Plus size={16} className="mr-1" /> Agregar Opción
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded mb-2 inline-block">
                      {survey.category}
                    </span>
                    <h4 className="font-bold text-lg text-gray-900">{survey.question}</h4>
                  </div>
                  <button onClick={() => startEdit(survey)} className="text-reto-navy hover:bg-blue-50 p-2 rounded-full transition-colors">
                    <Edit size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  {survey.options.map((opt, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <div className="w-full bg-gray-100 rounded-full h-2 mr-3 relative overflow-hidden">
                         <div 
                           className="absolute top-0 left-0 h-full bg-reto-navy opacity-20" 
                           style={{ width: `${(opt.votes / Math.max(1, survey.options.reduce((a,b) => a+b.votes, 0))) * 100}%` }}
                         />
                      </div>
                      <span className="w-1/3 truncate font-medium">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AddAdminModal = ({ onClose, onSave }: { onClose: () => void, onSave: (admin: User) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin: User = {
      id: Date.now().toString(),
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      age: 30, // Default age
      sector: 'Administración',
      role: 'admin',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
      hasVotedCurrentWeek: false,
      downloadHistory: [],
      surveyHistory: []
    };
    onSave(newAdmin);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-reto-navy p-4 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center">
            <Shield className="mr-2" size={20} />
            Nuevo Administrador
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input required type="text" className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-reto-navy focus:border-reto-navy outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input required type="text" className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-reto-navy focus:border-reto-navy outline-none" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input required type="email" className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-reto-navy focus:border-reto-navy outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input required type="tel" className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-reto-navy focus:border-reto-navy outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input required type="password" className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-reto-navy focus:border-reto-navy outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <p className="text-xs text-gray-500 mt-1">Este usuario tendrá acceso completo al panel de control.</p>
          </div>
          <div className="pt-4 flex gap-3">
             <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
             <Button type="submit" fullWidth>Crear Admin</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ surveys, onUpdateSurvey, onAddSurvey }: { surveys: Survey[], onUpdateSurvey: (s: Survey) => void, onAddSurvey?: (s: Survey) => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'surveys'>('users');

  useEffect(() => {
    setUsers(getMasterDB());
  }, []);

  const handleExportExcel = () => {
    const dataToExport = users.map(u => ({
      ID: u.id,
      Nombre: u.name,
      Apellido: u.surname,
      Email: u.email,
      Teléfono: u.phone,
      Edad: u.age,
      Sector: u.sector,
      Rol: u.role,
      Verificado: u.isVerified ? 'Sí' : 'No',
      "Fecha Registro": new Date(u.registeredAt).toLocaleString(),
      "Último Acceso": new Date(u.lastLogin).toLocaleString(),
      "Total Descargas": u.downloadHistory.length,
      "Total Encuestas": u.surveyHistory.length
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios Reto 33");

    const fileName = `reto33_usuarios_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleCreateAdmin = (newAdmin: User) => {
    if (users.some(u => u.email.toLowerCase() === newAdmin.email.toLowerCase())) {
      alert('El email ya existe en la base de datos.');
      return;
    }
    saveToMasterDB(newAdmin);
    setUsers([...users, newAdmin]);
    setShowAdminModal(false);
    alert('Administrador agregado correctamente.');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    today: users.filter(u => {
      const today = new Date().toDateString();
      return new Date(u.registeredAt).toDateString() === today;
    }).length
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-reto-navy flex items-center">
            <Shield className="mr-3 text-reto-pink" size={32} />
            Panel de Control
          </h1>
          <p className="text-gray-600">Gestión de usuarios y control de ingresos.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('users')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white shadow text-reto-navy' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Usuarios
           </button>
           <button 
             onClick={() => setActiveTab('surveys')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'surveys' ? 'bg-white shadow text-reto-navy' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Encuestas
           </button>
        </div>
      </div>

      {activeTab === 'surveys' ? (
        <SurveyManager surveys={surveys} onUpdateSurvey={onUpdateSurvey} onAddSurvey={onAddSurvey} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Usuarios Totales</p>
                  <p className="text-3xl font-bold text-reto-navy mt-1">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-reto-navy">
                  <Users size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Verificados</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Registros Hoy</p>
                  <p className="text-3xl font-bold text-reto-pink mt-1">{stats.today}</p>
                </div>
                <div className="bg-pink-100 p-3 rounded-full text-reto-pink">
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mb-4">
             <button 
              onClick={() => setShowAdminModal(true)}
              className="flex items-center space-x-2 bg-reto-navy text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-sm font-medium"
            >
              <UserPlus size={18} />
              <span>Agregar Admin</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
            >
              <FileSpreadsheet size={18} />
              <span>Exportar Excel</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Database className="mr-2 text-gray-400" size={20}/>
                Base de Datos de Suscriptores
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, email..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-reto-navy focus:border-reto-navy"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Registro / Último Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios</td>
                     </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${u.role === 'admin' ? 'bg-reto-gold text-reto-navy' : 'bg-reto-navy text-white'} flex items-center justify-center font-bold text-xs mr-3`}>
                              {u.name.charAt(0)}{u.surname.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 flex items-center">
                                 {u.name} {u.surname}
                                 {u.role === 'admin' && <Shield size={12} className="ml-1 text-reto-gold" fill="currentColor"/>}
                              </p>
                              <p className="text-xs text-gray-500">Edad: {u.age}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">{u.email}</span>
                            <span className="text-gray-500 text-xs">{u.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                            {u.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           {u.isVerified ? (
                             <span className="inline-flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                               <CheckCircle size={12} className="mr-1"/> Verificado
                             </span>
                           ) : (
                             <span className="inline-flex items-center text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full">
                               Pendiente
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          <div>Reg: {new Date(u.registeredAt).toLocaleDateString()}</div>
                          <div className="text-reto-navy font-medium mt-1">
                            Acceso: {new Date(u.lastLogin).toLocaleDateString()} {new Date(u.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showAdminModal && (
        <AddAdminModal onClose={() => setShowAdminModal(false)} onSave={handleCreateAdmin} />
      )}
    </div>
  );
};

const DashboardScreen = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'installers'>('menu');
  const [warningInstaller, setWarningInstaller] = useState<Installer | null>(null);

  const processDownload = (installer: Installer) => {
    const updatedUser = { ...user };
    updatedUser.downloadHistory.push({
      installerId: installer.id,
      installerTitle: installer.title,
      date: new Date().toISOString()
    });
    saveToMasterDB(updatedUser);
    
    // Actually trigger download/link
    if (installer.downloadUrl && installer.downloadUrl !== '#') {
       window.open(installer.downloadUrl, '_blank');
    } else {
       alert("Iniciando descarga (Simulación)...");
    }
  };

  const handleDownloadClick = (installer: Installer) => {
    // Check if it is the "Películas y TV Gratis" (id: '1') or "App de Música Gratis" (id: '2')
    if (installer.id === '1' || installer.id === '2') {
      setWarningInstaller(installer);
    } else {
      processDownload(installer);
    }
  };

  const handleAcceptWarning = () => {
    if (warningInstaller) {
      processDownload(warningInstaller);
      setWarningInstaller(null);
    }
  };

  if (view === 'menu') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-reto-navy to-blue-800 rounded-2xl p-8 text-white shadow-lg text-center">
           <h1 className="text-3xl font-bold mb-2">¡Hola, {user.name}!</h1>
           <p className="opacity-90">Selecciona una opción para comenzar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/surveys')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-reto-navy/20 hover:-translate-y-1 transition-all cursor-pointer group text-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-reto-navy mx-auto mb-4 group-hover:bg-reto-navy group-hover:text-white transition-colors">
              <Vote size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ENCUESTAS</h3>
            <p className="text-gray-500 text-sm">Participa en las decisiones de tu comunidad</p>
          </div>

          <div 
            onClick={() => setView('installers')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-reto-navy/20 hover:-translate-y-1 transition-all cursor-pointer group text-center"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Download size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">INSTALADORES</h3>
            <p className="text-gray-500 text-sm">Descarga aplicaciones premium gratis</p>
          </div>

          <div 
            onClick={() => navigate('/winners')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-reto-navy/20 hover:-translate-y-1 transition-all cursor-pointer group text-center"
          >
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-4 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">PREMIOS Y GANADORES</h3>
            <p className="text-gray-500 text-sm">Consulta los sorteos y ganadores</p>
          </div>
        </div>
      </div>
    );
  }

  // view === 'installers'
  return (
    <div className="space-y-6 relative animate-in fade-in slide-in-from-right-4 duration-300">
      <button 
        onClick={() => setView('menu')}
        className="flex items-center text-gray-600 hover:text-reto-navy font-medium transition-colors mb-4"
      >
        <ArrowLeft size={20} className="mr-2"/> Volver al Menú
      </button>

      <div className="bg-gradient-to-r from-reto-navy to-blue-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Instaladores</h1>
        <p className="opacity-90">Descargas disponibles de Febrero 2025.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {MOCK_INSTALLERS.map(inst => (
          <div key={inst.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-reto-navy">
                {inst.icon === 'film' ? <Film /> : inst.icon === 'music' ? <Music /> : inst.icon === 'gamepad' ? <Gamepad2 /> : <BookOpen />}
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">{inst.size}</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">{inst.title}</h4>
            <p className="text-sm text-gray-500 mb-4">{inst.description}</p>
            <Button fullWidth variant="outline" onClick={() => handleDownloadClick(inst)}>
              Descargar {inst.version}
            </Button>
          </div>
        ))}
      </div>

      {/* Security Warning Modal */}
      {warningInstaller && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-yellow-500 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center text-lg">
                <AlertTriangle className="mr-2" size={24} />
                ADVERTENCIA ⚠️
              </h3>
              <button onClick={() => setWarningInstaller(null)} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                 {warningInstaller.id === '1' ? (
                   // Movie App Text
                   `Al darle click en el siguiente enlace, saldrá un anuncio que dice que esta instalación es dañina, dale en DESCARGAR DE TODOS MODOS, esa advertencia es porque estas una app gratuita de uso libre. Para poder instalar debes PERMITIR LA INSTALACIÓN DE FUENTES DESCONOCIDAS.

                   Una vez que ingresas regístrate con un correo personal. Recuerda en la medida de las posibilidades utilizar correos secundarios para evitar spam y saturación en tu correo.`
                 ) : (
                   // Music App Text
                   `No utilices la misma contraseña que utilizas para tu correo para que no pongas en peligro tus cuentas, utiliza contraseña diferente.

                   INSTRUCCIONES PARA INSTALAR:

                   Antes de instalar, desinstala la app oficial de Spotify

                   Al ingresar regístrate como nuevo usuario con CORREO ELECTRÓNICO, no se requiere verificación.`
                 )}
               </p>
               <div className="pt-2 flex gap-3">
                  <Button variant="ghost" fullWidth onClick={() => setWarningInstaller(null)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleAcceptWarning} className="bg-yellow-600 hover:bg-yellow-700 text-white border-transparent">
                    Aceptar y Descargar
                  </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Additional Screens ---

const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getMasterDB();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simple password check (In real app, hash this)
    if (user && (user.password === password || (!user.password && password === 'admin123'))) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      saveToMasterDB(updatedUser);
      onLogin(updatedUser);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-reto-navy text-center mb-6">Iniciar Sesión</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" required className="w-full mt-1 p-2 border rounded-md focus:ring-reto-navy focus:border-reto-navy" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input type="password" required className="w-full mt-1 p-2 border rounded-md focus:ring-reto-navy focus:border-reto-navy" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button fullWidth type="submit">Ingresar</Button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">¿No tienes cuenta?</span>
        <Link to="/register" className="ml-2 font-bold text-reto-navy hover:underline">Regístrate</Link>
      </div>
    </AuthLayout>
  );
};

const RegisterScreen = ({ onRegister }: { onRegister: (u: User) => void }) => {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    name: '', surname: '', age: '', phone: '', email: '', password: '',
    canton: Object.keys(ZONES)[0], sector: ZONES[Object.keys(ZONES)[0]][0]
  });
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleCantonChange = (canton: string) => {
    setFormData({ ...formData, canton, sector: ZONES[canton][0] });
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for existing user
    const users = getMasterDB();
    if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      alert("El correo electrónico ya está registrado.");
      return;
    }

    setIsSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    const templateParams = {
      to_name: `${formData.name} ${formData.surname}`,
      to_email: formData.email,
      otp_code: code,
      message: `Tu código de verificación para Reto 33 es: ${code}` 
    };

    try {
      // Using provided credentials
      await emailjs.send('service_pkc5h87', 'template_rgm0xms', templateParams, 'owUYyPbGCKtFmhc8n');
      
      // Keep console log for dev convenience
      console.log("OTP Sent:", code);
      alert("Código de verificación enviado a tu correo.");
      setStep('verify');
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("Hubo un error enviando el código. Por favor verifica tu correo o intenta más tarde. (Revisa la consola para el código si es una prueba local)");
      // For fallback in case quota exceeded or config error during testing
      console.log("Fallback OTP:", code); 
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp === generatedOtp) {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        surname: formData.surname,
        age: parseInt(formData.age),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        sector: `${formData.canton} - ${formData.sector}`,
        role: 'user',
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: true,
        hasVotedCurrentWeek: false,
        downloadHistory: [],
        surveyHistory: []
      };
      saveToMasterDB(newUser);
      onRegister(newUser);
    } else {
      alert("Código incorrecto. Inténtalo de nuevo.");
    }
  };

  if (step === 'verify') {
    return (
      <AuthLayout>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 rounded-full text-reto-navy mb-3">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-reto-navy">Verifica tu Correo</h2>
          <p className="text-sm text-gray-600 mt-2">
            Hemos enviado un código de 6 dígitos a <br/>
            <span className="font-bold">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000" 
              className="w-full text-center text-3xl tracking-widest p-3 border rounded-lg focus:ring-2 focus:ring-reto-navy outline-none font-bold text-gray-800"
              value={userOtp}
              onChange={e => setUserOtp(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
             <Button variant="ghost" fullWidth type="button" onClick={() => setStep('form')}>Atrás</Button>
             <Button fullWidth type="submit">Verificar</Button>
          </div>
          <p className="text-xs text-center text-gray-400">Revisa tu carpeta de Spam si no encuentras el correo.</p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-reto-navy text-center mb-6">Registro de Usuario</h2>
      <form onSubmit={handleSendVerification} className="space-y-3">
        {/* Existing inputs */}
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Nombre" required className="p-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input placeholder="Apellido" required className="p-2 border rounded-md" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Edad" required className="p-2 border rounded-md" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          <input type="tel" placeholder="Celular" required className="p-2 border rounded-md" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select className="p-2 border rounded-md bg-white" value={formData.canton} onChange={e => handleCantonChange(e.target.value)}>
            {Object.keys(ZONES).map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <select className="p-2 border rounded-md bg-white" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
            {ZONES[formData.canton].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <input type="email" placeholder="Email" required className="w-full p-2 border rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Contraseña" required className="w-full p-2 border rounded-md" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <Button fullWidth type="submit" variant="secondary" disabled={isSending}>
           {isSending ? (
             <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={18}/> Enviando Código...</span>
           ) : "Registrarse y Verificar"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/" className="text-reto-navy hover:underline">Ya tengo cuenta</Link>
      </div>
    </AuthLayout>
  );
};

const SurveysScreen = ({ user, surveys, onVote }: { user: User, surveys: Survey[], onVote: (sId: string, oId: string) => void }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-reto-navy flex items-center"><Vote className="mr-2"/> Encuestas Activas</h1>
      <div className="grid gap-6">
        {surveys.filter(s => s.isActive).map(survey => {
          const hasVoted = user.surveyHistory.some(h => h.surveyId === survey.id);
          return (
            <div key={survey.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <span className="text-xs font-bold text-reto-navy bg-blue-100 px-2 py-1 rounded">{survey.category}</span>
                <h3 className="text-lg font-bold mt-2">{survey.question}</h3>
              </div>
              {hasVoted ? (
                <div className="space-y-3">
                  {survey.options.map(opt => (
                    <div key={opt.id} className="relative pt-1">
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{opt.text}</span>
                        <span>{opt.votes} votos</span>
                      </div>
                      <div className="overflow-hidden h-2 bg-gray-100 rounded">
                        <div style={{ width: `${(opt.votes / Math.max(1, survey.options.reduce((a,b)=>a+b.votes,0))) * 100}%` }} className="h-full bg-reto-navy opacity-75"></div>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-sm text-green-600 font-bold mt-4">¡Gracias por tu voto!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {survey.options.map(opt => (
                    <button 
                      key={opt.id} 
                      onClick={() => onVote(survey.id, opt.id)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-reto-navy hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center">
                        {opt.image && <img src={opt.image} alt="" className="w-10 h-10 rounded-full mr-3 object-cover"/>}
                        <span className="font-medium group-hover:text-reto-navy">{opt.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DownloadsScreen = ({ user }: { user: User }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-reto-navy flex items-center"><History className="mr-2"/> Historial de Descargas</h1>
    {user.downloadHistory.length === 0 ? (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <Download className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No hay descargas aún</h3>
        <p className="text-gray-500">Visita el panel principal para descargar contenido.</p>
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instalador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {user.downloadHistory.map((dl, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dl.installerTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(dl.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const WinnersScreen = () => {
  const [tab, setTab] = useState<'prizes' | 'history'>('prizes');
  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button onClick={() => setTab('prizes')} className={`pb-2 px-1 ${tab === 'prizes' ? 'border-b-2 border-reto-navy font-bold text-reto-navy' : 'text-gray-500'}`}>Premios de la Semana</button>
        <button onClick={() => setTab('history')} className={`pb-2 px-1 ${tab === 'history' ? 'border-b-2 border-reto-navy font-bold text-reto-navy' : 'text-gray-500'}`}>Ganadores Anteriores</button>
      </div>
      {tab === 'prizes' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {INITIAL_PRIZES.map(prize => (
            <div key={prize.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase font-bold text-gray-400">{prize.type}</span>
                <h4 className="font-bold text-gray-900 leading-tight">{prize.name}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PAST_DRAWS.map(draw => (
            <div key={draw.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-reto-navy mb-4">Sorteo del {draw.date}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {draw.winners.map((winner, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Trophy className="text-reto-gold mr-3" size={20} />
                    <div>
                      <p className="font-bold text-gray-900">{winner.userName}</p>
                      <p className="text-xs text-gray-500">Ganó: {winner.prizeName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileScreen = ({ user, onUpdate }: { user: User, onUpdate: (u: User) => void }) => {
  const [formData, setFormData] = useState({ name: user.name, surname: user.surname, phone: user.phone });
  
  const handleSave = () => {
    const updated = { ...user, ...formData };
    saveToMasterDB(updated);
    onUpdate(updated);
    alert('Perfil actualizado');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-reto-navy mb-6">Mi Perfil</h1>
      <div className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Email</label>
           <input disabled value={user.email} className="w-full mt-1 p-2 border rounded-md bg-gray-50 text-gray-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido</label>
            <input value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
          </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Teléfono</label>
           <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <Button onClick={handleSave} className="mt-4">Guardar Cambios</Button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reto33_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem(SURVEYS_KEY);
    return saved ? JSON.parse(saved) : MOCK_SURVEYS;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('reto33_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('reto33_session');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  }, [surveys]);

  const handleLogin = (u: User) => setUser(u);
  const handleRegister = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);
  
  const handleUpdateSurvey = (updatedSurvey: Survey) => {
    setSurveys(surveys.map(s => s.id === updatedSurvey.id ? updatedSurvey : s));
  };

  const handleAddSurvey = (newSurvey: Survey) => {
    setSurveys([newSurvey, ...surveys]);
  };

  const handleVote = (surveyId: string, optionId: string) => {
    if (!user) return;
    const updatedSurveys = surveys.map(s => {
      if (s.id !== surveyId) return s;
      return {
        ...s,
        options: s.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
      };
    });
    setSurveys(updatedSurveys);
    
    const updatedUser = { 
      ...user, 
      surveyHistory: [...user.surveyHistory, { surveyId, question: updatedSurveys.find(s => s.id === surveyId)?.question || '', date: new Date().toISOString() }] 
    };
    setUser(updatedUser);
    saveToMasterDB(updatedUser);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!user ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterScreen onRegister={handleRegister} /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={user ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <DashboardScreen user={user} />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />
        
        <Route path="/admin" element={user && user.role === 'admin' ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <AdminDashboard surveys={surveys} onUpdateSurvey={handleUpdateSurvey} onAddSurvey={handleAddSurvey} />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />

        <Route path="/surveys" element={user ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <SurveysScreen user={user} surveys={surveys} onVote={handleVote} />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />
        
        <Route path="/downloads" element={user ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <DownloadsScreen user={user} />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />
        
        <Route path="/winners" element={user ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <WinnersScreen />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />
        
        <Route path="/profile" element={user ? (
            <MainLayout user={user} onLogout={handleLogout}>
              <ProfileScreen user={user} onUpdate={setUser} />
            </MainLayout>
          ) : <Navigate to="/" />} 
        />

        <Route path="/privacy" element={<PrivacyPolicyScreen />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
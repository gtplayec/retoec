
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Download, Trophy, Vote, LogOut, Menu, X, CheckCircle, 
  User as UserIcon, Search, Settings, Film, Music, 
  Gamepad2, BookOpen, Shield, Users, FileSpreadsheet, 
  AlertCircle, Ticket, Sparkles, ArrowRight
} from 'lucide-react';

import { User, Installer, Survey, SurveyOption, SurveyRecord } from './types';
import { MOCK_INSTALLERS, INITIAL_PRIZES, MOCK_SURVEYS, PAST_DRAWS, ZONES } from './constants';
import { Button } from './components/Button';

// Constantes de configuración
const DB_KEY = 'reto33_master_db';
const SURVEYS_KEY = 'reto33_surveys';

const getMasterDB = (): User[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToMasterDB = (user: User) => {
  const db = getMasterDB();
  const existingIndex = db.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    db[existingIndex] = user;
  } else {
    db.push(user);
  }
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- LAYOUTS ---

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-reto-light flex flex-col items-center justify-center p-4">
    <div className="mb-10">
      <Link to="/" className="block hover:opacity-90 transition-opacity">
        <img src="./logo.png" alt="RETO 33" className="w-80 h-auto object-contain mx-auto" />
      </Link>
    </div>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 border-t-8 border-reto-pink">
      {children}
    </div>
  </div>
);

const MainLayout: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const NavItem = ({ to, icon: Icon, label, highlight = false }: { to: string; icon: any; label: string, highlight?: boolean }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
          isActive ? 'bg-reto-navy text-white shadow-lg' : highlight ? 'bg-pink-50 text-reto-pink hover:bg-pink-100' : 'text-gray-600 hover:bg-gray-100 hover:text-reto-navy'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-reto-gold' : ''} />
        <span className="font-bold uppercase text-xs tracking-wide">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-reto-light flex">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 border-b border-gray-100 flex justify-center">
            <img src="./logo.png" alt="RETO 33" className="w-40 h-auto object-contain" />
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-reto-navy text-white flex items-center justify-center font-black shadow-inner">
                {user?.name[0]}{user?.surname[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-reto-navy truncate leading-none mb-1 uppercase">{user?.name} {user?.surname}</p>
                <p className="text-[10px] text-gray-500 truncate font-bold uppercase tracking-wider">{user?.sector}</p>
              </div>
            </div>
            <nav className="space-y-1">
              <NavItem to="/dashboard" icon={UserIcon} label="Mi Panel" />
              {isAdmin && <NavItem to="/admin" icon={Shield} label="ADMINISTRACIÓN" highlight />}
              <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Comunidad</div>
              <NavItem to="/surveys" icon={Vote} label="Encuestas" />
              <NavItem to="/participants" icon={Users} label="Participantes" />
              <NavItem to="/winners" icon={Trophy} label="Premios y Ganadores" />
              <NavItem to="/downloads" icon={Download} label="Mis Descargas" />
              <NavItem to="/profile" icon={Settings} label="Mi Perfil" />
            </nav>
          </div>
          <div className="p-4 border-t border-gray-100">
            <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-4 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors font-black uppercase text-xs">
              <LogOut size={20} /><span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="bg-white shadow-sm lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 px-6">
          <img src="./logo.png" alt="RETO 33" className="w-24 h-auto object-contain" />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-reto-navy hover:bg-gray-100 rounded-xl transition-colors">
            {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </header>
        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- SCREENS ---

const DashboardScreen = ({ user, onDownload }: { user: User, onDownload: (inst: Installer) => void }) => {
  const activeSurveysCount = MOCK_SURVEYS.filter(s => s.isActive).length;
  const prizesCount = INITIAL_PRIZES.length;
  
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-br from-reto-navy to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">¡Hola, {user.name}!</h1>
          <p className="text-blue-100 font-bold text-lg opacity-80 max-w-xl">Bienvenido a tu plataforma. Aquí tienes acceso directo a todas las herramientas y sorteos de Renovación Total.</p>
        </div>
        <Sparkles className="absolute right-10 top-10 text-reto-gold opacity-10" size={150} />
      </div>

      {/* Secciones Principales (Accesos Directos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Encuestas */}
        <Link to="/surveys" className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Vote size={100} className="text-reto-pink" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-pink-50 text-reto-pink rounded-2xl">
              <Vote size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-reto-navy text-white px-2 py-1 rounded-full">
              {activeSurveysCount} Activas
            </span>
          </div>
          <h3 className="text-2xl font-black text-reto-navy uppercase leading-none mb-2">Encuestas Semanales</h3>
          <p className="text-gray-500 text-sm font-medium mb-4">Participa con tu opinión y gana tickets para el sorteo.</p>
          <div className="flex items-center text-reto-pink font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
            Votar Ahora <ArrowRight size={16} className="ml-2" />
          </div>
        </Link>

        {/* Card Participantes */}
        <Link to="/participants" className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={100} className="text-blue-600" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Transparencia
            </span>
          </div>
          <h3 className="text-2xl font-black text-reto-navy uppercase leading-none mb-2">Participantes Sorteo</h3>
          <p className="text-gray-500 text-sm font-medium mb-4">Revisa la lista oficial de vecinos participantes y sus números.</p>
          <div className="flex items-center text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
            Ver Lista <ArrowRight size={16} className="ml-2" />
          </div>
        </Link>

        {/* Card Premios */}
        <Link to="/winners" className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy size={100} className="text-reto-gold" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-yellow-50 text-reto-gold rounded-2xl">
              <Trophy size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {prizesCount} Premios
            </span>
          </div>
          <h3 className="text-2xl font-black text-reto-navy uppercase leading-none mb-2">Premios y Ganadores</h3>
          <p className="text-gray-500 text-sm font-medium mb-4">Conoce los premios de la semana y los ganadores anteriores.</p>
          <div className="flex items-center text-reto-gold font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
            Ver Galería <ArrowRight size={16} className="ml-2" />
          </div>
        </Link>

      </div>

      {/* Catálogo de Instaladores */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-2xl font-black text-reto-navy mb-6 flex items-center gap-3 uppercase tracking-tight">
          <Download size={28} className="text-reto-pink" /> Catálogo de Instaladores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_INSTALLERS.map(inst => (
            <div key={inst.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 rounded-2xl text-reto-navy group-hover:scale-110 transition-transform">
                  {inst.icon === 'film' ? <Film size={32} /> : inst.icon === 'music' ? <Music size={32} /> : inst.icon === 'gamepad' ? <Gamepad2 size={32} /> : <BookOpen size={32} />}
                </div>
                <span className="px-4 py-2 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                  {inst.size}
                </span>
              </div>
              <h4 className="text-xl font-black text-reto-navy mb-2 group-hover:text-reto-pink transition-colors uppercase">{inst.title}</h4>
              <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">{inst.description}</p>
              <Button fullWidth variant="outline" className="font-black border-2" onClick={() => onDownload(inst)}>
                DESCARGAR {inst.version}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SurveysScreen = ({ user, surveys, onVote }: { user: User, surveys: Survey[], onVote: (sId: string, oId: string) => void }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-black text-reto-navy tracking-tight uppercase">Encuestas Semanales</h1>
      <p className="text-gray-500 font-medium">Participa y obtén un número (1-15000) para el gran sorteo.</p>
    </div>

    <div className="grid gap-8">
      {surveys.filter(s => s.isActive).map(survey => {
        const voteRecord = user.surveyHistory.find(h => h.surveyId === survey.id);
        return (
          <div key={survey.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-reto-navy text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  {survey.category}
                </span>
                <h3 className="text-xl font-black text-reto-navy mt-3 leading-tight uppercase">{survey.question}</h3>
              </div>
              {voteRecord && (
                <div className="flex items-center gap-3 bg-pink-50 px-6 py-3 rounded-2xl border border-pink-100">
                  <Ticket className="text-reto-pink" size={24} />
                  <div className="leading-none">
                    <p className="text-[10px] font-black text-reto-pink uppercase mb-1">Tu número:</p>
                    <p className="text-2xl font-black text-reto-navy">{voteRecord.entryNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {voteRecord ? (
              <div className="space-y-4">
                {survey.options.map(opt => {
                  const totalVotes = survey.options.reduce((a, b) => a + b.votes, 0);
                  const percentage = Math.round((opt.votes / (totalVotes || 1)) * 100);
                  return (
                    <div key={opt.id} className="space-y-2">
                      <div className="flex justify-between text-sm font-black text-reto-navy uppercase">
                        <span>{opt.text}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div style={{ width: `${percentage}%` }} className="h-full bg-reto-navy shadow-inner transition-all duration-1000" />
                      </div>
                    </div>
                  );
                })}
                <p className="text-center pt-6 text-green-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> Voto registrado
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {survey.options.map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => onVote(survey.id, opt.id)}
                    className="group flex items-center p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-reto-navy hover:bg-white transition-all text-left"
                  >
                    {opt.image && <img src={opt.image} alt="" className="w-12 h-12 rounded-2xl object-cover mr-4 shadow-sm" />}
                    <span className="font-black text-reto-navy uppercase group-hover:scale-105 transition-transform">{opt.text}</span>
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

const ParticipantsScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const allUsers = useMemo(() => getMasterDB(), []);
  
  const entries = useMemo(() => {
    const list: any[] = [];
    allUsers.forEach(u => {
      u.surveyHistory.forEach(s => {
        list.push({
          userName: `${u.name} ${u.surname}`,
          sector: u.sector,
          number: s.entryNumber,
          date: s.date
        });
      });
    });
    return list.sort((a, b) => a.number - b.number);
  }, [allUsers]);

  const filtered = entries.filter(e => 
    e.userName.toLowerCase().includes(searchTerm.toLowerCase()) || e.number.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-black text-reto-navy tracking-tight uppercase">Participantes Sorteo</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar participante o número..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-reto-navy outline-none font-bold text-reto-navy shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-reto-navy uppercase text-[10px] font-black tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">N° Suerte</th>
                <th className="px-8 py-5">Nombre</th>
                <th className="px-8 py-5">Sector</th>
                <th className="px-8 py-5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((e, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50">
                  <td className="px-8 py-4"><span className="w-12 h-12 flex items-center justify-center bg-pink-50 text-reto-pink rounded-xl font-black text-lg border border-pink-100">{e.number}</span></td>
                  <td className="px-8 py-4 font-black text-reto-navy uppercase">{e.userName}</td>
                  <td className="px-8 py-4 font-bold text-gray-500 text-sm">{e.sector}</td>
                  <td className="px-8 py-4 text-xs font-bold text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const WinnersScreen = () => {
  const [tab, setTab] = useState<'prizes' | 'history'>('prizes');
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-black text-reto-navy tracking-tight uppercase">Premios y Ganadores</h1>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button onClick={() => setTab('prizes')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${tab === 'prizes' ? 'bg-white text-reto-navy shadow-sm' : 'text-gray-500 hover:text-reto-navy'}`}>PREMIOS</button>
          <button onClick={() => setTab('history')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${tab === 'history' ? 'bg-white text-reto-navy shadow-sm' : 'text-gray-500 hover:text-reto-navy'}`}>GANADORES</button>
        </div>
      </div>
      {tab === 'prizes' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_PRIZES.map(prize => (
            <div key={prize.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 group hover:shadow-xl transition-all">
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase text-reto-navy border border-gray-100">{prize.type}</span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-black text-reto-navy leading-tight uppercase text-sm">{prize.name}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {PAST_DRAWS.map(draw => (
            <div key={draw.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="font-black text-xl text-reto-navy mb-6 flex items-center gap-2 uppercase"><Trophy size={20} className="text-reto-gold"/> Sorteo {draw.date}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {draw.winners.map((w, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black text-reto-navy text-sm uppercase flex items-center justify-between">
                    <span>{w.userName}</span>
                    <span className="text-reto-pink text-xs">{w.prizeName}</span>
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

const DownloadsScreen = ({ user }: { user: User }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h1 className="text-3xl font-black text-reto-navy tracking-tight uppercase">Mis Descargas</h1>
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-reto-navy font-black text-[10px] uppercase border-b">
          <tr><th className="px-8 py-5">Instalador</th><th className="px-8 py-5">Fecha</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {user.downloadHistory.length === 0 ? (
            <tr><td colSpan={2} className="px-8 py-20 text-center font-bold text-gray-400">Aún no has descargado herramientas.</td></tr>
          ) : (
            user.downloadHistory.map((dl, i) => (
              <tr key={i}><td className="px-8 py-4 font-black text-reto-navy uppercase">{dl.installerTitle}</td><td className="px-8 py-4 font-bold text-gray-400 text-sm">{new Date(dl.date).toLocaleString()}</td></tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ProfileScreen = ({ user, onUpdate }: { user: User, onUpdate: (u: User) => void }) => {
  const [formData, setFormData] = useState({ name: user.name, surname: user.surname, phone: user.phone });
  const handleSave = () => {
    const updated = { ...user, ...formData };
    saveToMasterDB(updated);
    onUpdate(updated);
    alert('Perfil actualizado con éxito');
  };
  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
      <h1 className="text-3xl font-black text-reto-navy mb-8 uppercase tracking-tight">Mi Perfil</h1>
      <div className="space-y-6">
        <div><label className="text-xs font-black text-gray-400 uppercase mb-2 block">Email (No editable)</label>
        <input disabled value={user.email} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 font-bold" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-black text-gray-500 uppercase mb-2 block">Nombre</label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" /></div>
          <div><label className="text-xs font-black text-gray-500 uppercase mb-2 block">Apellido</label>
          <input value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" /></div>
        </div>
        <div><label className="text-xs font-black text-gray-500 uppercase mb-2 block">Celular</label>
        <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" /></div>
        <Button onClick={handleSave} className="font-black px-12 py-4">GUARDAR CAMBIOS</Button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const users = useMemo(() => getMasterDB(), []);
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(u => ({ Nombre: u.name, Apellido: u.surname, Email: u.email, Sector: u.sector, Telefono: u.phone })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "RETO33_Usuarios.xlsx");
  };
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center"><h1 className="text-3xl font-black text-reto-navy uppercase">Administración</h1><Button onClick={handleExport} className="font-black text-xs py-2"><FileSpreadsheet size={16} className="mr-2"/>EXPORTAR EXCEL</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center"><p className="text-xs font-black text-gray-400 uppercase mb-1">Total Usuarios</p><p className="text-4xl font-black text-reto-navy">{users.length}</p></div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center"><p className="text-xs font-black text-gray-400 uppercase mb-1">Entradas Sorteo</p><p className="text-4xl font-black text-reto-pink">{users.reduce((acc, u) => acc + u.surveyHistory.length, 0)}</p></div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left"><thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest border-b"><tr><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Sector</th><th className="px-6 py-4">Email</th></tr></thead><tbody className="divide-y divide-gray-50">{users.map(u => (<tr key={u.id} className="text-sm"><td className="px-6 py-4 font-black text-reto-navy uppercase">{u.name} {u.surname}</td><td className="px-6 py-4 font-bold text-gray-500">{u.sector}</td><td className="px-6 py-4 font-medium text-gray-400">{u.email}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
};

// --- AUTH ---

const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getMasterDB().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && (user.password === password || (!user.password && password === 'RETO2026'))) {
      onLogin({...user, lastLogin: new Date().toISOString()});
    } else setError('Credenciales incorrectas');
  };
  return (
    <AuthLayout>
      <h2 className="text-2xl font-black text-reto-navy text-center mb-6 uppercase">Iniciar Sesión</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" required className="w-full p-4 border border-gray-200 rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" required className="w-full p-4 border border-gray-200 rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={password} onChange={e => setPassword(e.target.value)} />
        <Button fullWidth type="submit" className="font-black py-4">ENTRAR</Button>
      </form>
      <div className="mt-8 text-center text-sm font-bold text-gray-500 uppercase">¿No tienes cuenta? <Link to="/register" className="text-reto-pink underline">Regístrate</Link></div>
    </AuthLayout>
  );
};

const RegisterScreen = ({ onRegister }: { onRegister: (u: User) => void }) => {
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', surname: '', age: '', phone: '', email: '', password: '', 
    canton: Object.keys(ZONES)[0], sector: ZONES[Object.keys(ZONES)[0]][0] 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim();
    const db = getMasterDB();
    
    // Check if email already exists
    if (db.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      setError('Este correo ya está registrado.');
      return;
    }
    
    // Direct Registration
    const newUser: User = { 
      id: Date.now().toString(), 
      name: formData.name, 
      surname: formData.surname, 
      age: parseInt(formData.age), 
      phone: formData.phone, 
      email: cleanEmail, 
      password: formData.password, 
      sector: `${formData.canton} - ${formData.sector}`, 
      role: 'user', 
      registeredAt: new Date().toISOString(), 
      lastLogin: new Date().toISOString(), 
      isVerified: true, // No email verification needed
      hasVotedCurrentWeek: false, 
      downloadHistory: [], 
      surveyHistory: [] 
    };
    
    saveToMasterDB(newUser); 
    onRegister(newUser);
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-black text-reto-navy text-center mb-6 uppercase">Registro Gratuito</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Nombre" required className="p-3 border rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input placeholder="Apellido" required className="p-3 border rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Edad" required className="p-3 border rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          <input type="tel" placeholder="Celular" required className="p-3 border rounded-xl font-bold text-reto-navy focus:ring-2 focus:ring-reto-navy outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select className="p-3 border rounded-xl font-bold text-reto-navy outline-none" value={formData.canton} onChange={e => setFormData({...formData, canton: e.target.value, sector: ZONES[e.target.value][0]})}>{Object.keys(ZONES).map(z => <option key={z} value={z}>{z}</option>)}</select>
          <select className="p-3 border rounded-xl font-bold text-reto-navy outline-none" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>{ZONES[formData.canton].map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl font-bold text-reto-navy outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Contraseña" required className="w-full p-3 border rounded-xl font-bold text-reto-navy outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <Button fullWidth type="submit" variant="secondary" className="font-black py-4">
          REGISTRARSE AHORA
        </Button>
      </form>
      <div className="mt-6 text-center text-sm font-bold text-gray-500 uppercase">¿Ya tienes cuenta? <Link to="/" className="text-reto-pink underline">Ingresar</Link></div>
    </AuthLayout>
  );
};

// --- APP ---

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
    if (user) localStorage.setItem('reto33_session', JSON.stringify(user));
    else localStorage.removeItem('reto33_session');
  }, [user]);

  const handleVote = (surveyId: string, optionId: string) => {
    if (!user) return;
    const taken = new Set();
    getMasterDB().forEach(u => u.surveyHistory.forEach(s => taken.add(s.entryNumber)));
    let num = 1; while(taken.has(num)) num++; // Asignación de número secuencial disponible
    
    const updatedSurveys = surveys.map(s => s.id === surveyId ? {...s, options: s.options.map(o => o.id === optionId ? {...o, votes: o.votes + 1} : o)} : s);
    setSurveys(updatedSurveys);
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(updatedSurveys));
    
    const updatedUser = { ...user, surveyHistory: [...user.surveyHistory, { surveyId, question: updatedSurveys.find(s => s.id === surveyId)?.question || '', date: new Date().toISOString(), entryNumber: num }] };
    setUser(updatedUser); saveToMasterDB(updatedUser);
  };

  const handleDownload = (inst: Installer) => {
    if (!user) return;
    const updatedUser = { ...user, downloadHistory: [...user.downloadHistory, { installerId: inst.id, installerTitle: inst.title, date: new Date().toISOString() }] };
    setUser(updatedUser); saveToMasterDB(updatedUser);
    if (inst.downloadUrl !== '#') window.open(inst.downloadUrl, '_blank');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!user ? <LoginScreen onLogin={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterScreen onRegister={setUser} /> : <Navigate to="/dashboard" />} />
        
        {user && (
          <Route element={<MainLayout user={user} onLogout={() => setUser(null)} />}>
            <Route path="/dashboard" element={<DashboardScreen user={user} onDownload={handleDownload} />} />
            <Route path="/surveys" element={<SurveysScreen user={user} surveys={surveys} onVote={handleVote} />} />
            <Route path="/participants" element={<ParticipantsScreen />} />
            <Route path="/winners" element={<WinnersScreen />} />
            <Route path="/downloads" element={<DownloadsScreen user={user} />} />
            <Route path="/profile" element={<ProfileScreen user={user} onUpdate={setUser} />} />
            <Route path="/admin" element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
          </Route>
        )}

        <Route path="/privacy" element={<div className="p-10 max-w-4xl mx-auto bg-white rounded-3xl mt-10 font-bold text-reto-navy uppercase">Políticas de Privacidad Reto 33 <Link to="/" className="ml-4 text-reto-pink underline">Volver</Link></div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

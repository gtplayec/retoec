import { Installer, Prize, Survey, PastDraw } from './types';

export const APP_NAME = "RETO 33";
export const APP_TAGLINE = "RENOVACIÓN TOTAL";

export const ZONES: Record<string, string[]> = {
  "Santo Domingo": [
    "Rio Verde", "Abraham Calazacón", "Santo Domingo", "Rio Toachi", 
    "Zaracay", "Bombolí", "Chiguilpe", "Nuevo Israel", "Las Delicias", 
    "San Gabriel del Baba", "Julio Moreno", "Las Mercedes", 
    "El Placer del Toachi", "San Jacinto del Búa", "Valle Hermoso", 
    "Puerto Limón", "El Esfuerzo", "Luz de América", 
    "Sta Maria del Toachi", "Alluriquín"
  ],
  "La Concordia": [
    "La Concordia", "Plan Piloto", "Moterrey", "Villegas"
  ]
};

export const MOCK_INSTALLERS: Installer[] = [
  {
    id: '1',
    title: 'Películas y TV Gratis',
    version: 'XUPER V5.1',
    description: 'Acceso exclusivo a plataforma de streaming con contenido desbloqueado.',
    season: 'Febrero',
    size: '145 MB',
    downloadUrl: 'https://app.lat-servicio.app/app/XPRmob_DOWNTV.apk',
    icon: 'film'
  },
  {
    id: '2',
    title: 'App de Música Gratis',
    version: 'Spotify Gratis',
    description: 'Reproductor de música sin anuncios y con descarga offline habilitada.',
    season: 'Febrero',
    size: '85 MB',
    downloadUrl: 'https://transfer.it/t/wz9bbQ9VwRbD',
    icon: 'music'
  },
  {
    id: '3',
    title: 'Juegos Gratis',
    version: 'Pack Feb 2025',
    description: 'Colección de 5 juegos populares con monedas ilimitadas.',
    season: 'Febrero',
    size: '1.8 GB',
    downloadUrl: '#',
    icon: 'gamepad'
  },
  {
    id: '4',
    title: 'Tutorial de Instalación',
    version: 'PDF + Video',
    description: 'Guía paso a paso para instalar y configurar correctamente las apps de este mes.',
    season: 'Febrero',
    size: '15 MB',
    downloadUrl: '#',
    icon: 'book'
  }
];

export const INITIAL_PRIZES: Prize[] = [
  { id: '1', name: 'MacBook Air M2', image: 'https://picsum.photos/200/200?random=1', type: 'Tecnología' },
  { id: '2', name: 'Orden de Compra $200', image: 'https://picsum.photos/200/200?random=2', type: 'Orden de Compra' },
  { id: '3', name: 'iPhone 15 Pro', image: 'https://picsum.photos/200/200?random=3', type: 'Tecnología' },
  { id: '4', name: 'Descuento 50% Cursos', image: 'https://picsum.photos/200/200?random=4', type: 'Descuento' },
  { id: '5', name: 'iPad Mini', image: 'https://picsum.photos/200/200?random=5', type: 'Tecnología' },
  { id: '6', name: 'Smartwatch Series 9', image: 'https://picsum.photos/200/200?random=6', type: 'Tecnología' },
  { id: '7', name: 'Audífonos Noise Cancelling', image: 'https://picsum.photos/200/200?random=7', type: 'Tecnología' },
  { id: '8', name: 'Gift Card Amazon $100', image: 'https://picsum.photos/200/200?random=8', type: 'Orden de Compra' },
  { id: '9', name: 'Teclado Mecánico RGB', image: 'https://picsum.photos/200/200?random=9', type: 'Tecnología' },
  { id: '10', name: 'Monitor 4K 27"', image: 'https://picsum.photos/200/200?random=10', type: 'Tecnología' },
];

export const PAST_DRAWS: PastDraw[] = [
  {
    id: 'w3',
    week: 3,
    date: '20 Octubre 2023',
    winners: [
      { userName: 'Carlos Méndez', prizeName: 'PlayStation 5' },
      { userName: 'Ana Torres', prizeName: 'iPhone 14' },
      { userName: 'Roberto Díaz', prizeName: 'Orden de Compra $100' },
      { userName: 'Elena Ruiz', prizeName: 'Audífonos Sony' },
      { userName: 'Miguel Ángel', prizeName: 'Curso React Avanzado' }
    ]
  },
  {
    id: 'w2',
    week: 2,
    date: '13 Octubre 2023',
    winners: [
      { userName: 'Lucía Gómez', prizeName: 'Orden de Compra $100' },
      { userName: 'Fernando P.', prizeName: 'iPad Air' },
      { userName: 'Sofia L.', prizeName: 'Teclado Keychron' }
    ]
  },
  {
    id: 'w1',
    week: 1,
    date: '06 Octubre 2023',
    winners: [
      { userName: 'Javier H.', prizeName: 'MacBook Pro 14"' },
      { userName: 'Marina V.', prizeName: 'Monitor LG Ultrawide' }
    ]
  }
];

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 'surv-mayor',
    category: 'Alcalde/sa',
    week: 5,
    isActive: true,
    question: '¿Quién es tu candidato preferido para la Alcaldía?',
    options: [
      { id: 'cand1', text: 'Candidato A', votes: 150, image: 'https://ui-avatars.com/api/?name=Candidato+A&background=0D8ABC&color=fff&size=200' },
      { id: 'cand2', text: 'Candidato B', votes: 120, image: 'https://ui-avatars.com/api/?name=Candidato+B&background=E91E63&color=fff&size=200' },
      { id: 'cand3', text: 'Candidato C', votes: 90, image: 'https://ui-avatars.com/api/?name=Candidato+C&background=FFC107&color=fff&size=200' },
    ]
  },
  {
    id: 'surv-prefect',
    category: 'Prefecto/a',
    week: 5,
    isActive: true,
    question: '¿Quién es tu candidato preferido para la Prefectura?',
    options: [
      { id: 'pref1', text: 'Candidato X', votes: 200, image: 'https://ui-avatars.com/api/?name=Candidato+X&background=009688&color=fff&size=200' },
      { id: 'pref2', text: 'Candidato Y', votes: 80, image: 'https://ui-avatars.com/api/?name=Candidato+Y&background=795548&color=fff&size=200' },
    ]
  },
  {
    id: 'surv-works',
    category: 'Obras Prioritarias',
    week: 5,
    isActive: true,
    question: '¿Qué obra consideras prioritaria para tu sector?',
    options: [
      { id: 'work1', text: 'Seguridad', votes: 300 },
      { id: 'work2', text: 'Servicios Básicos', votes: 150 },
      { id: 'work3', text: 'Calles Pavimentadas', votes: 220 },
      { id: 'work4', text: 'Ordenamiento del Centro de la Ciudad', votes: 180 }
    ]
  },
  {
    id: 'surv-national',
    category: 'Nacionales',
    week: 5,
    isActive: true,
    question: '¿Cómo calificas la gestión del Gobierno Nacional?',
    options: [
      { id: 'nat1', text: 'Buena', votes: 40 },
      { id: 'nat2', text: 'Regular', votes: 90 },
      { id: 'nat3', text: 'Mala', votes: 350 },
      { id: 'nat4', text: 'Pésima', votes: 120 }
    ]
  }
];

// Fallback for types not breaking existing imports, though we use MOCK_SURVEYS now
export const DEFAULT_SURVEY = MOCK_SURVEYS[0];
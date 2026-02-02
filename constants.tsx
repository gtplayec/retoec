import React from 'react';
import { AppInstaller, Prize, Survey, Zone } from './types';

export const LOCATIONS: Record<Zone, string[]> = {
  'Santo Domingo': [
    'Rio Verde', 'Abraham Calazacón', 'Santo Domingo', 'Rio Toachi', 'Zaracay',
    'Bombolí', 'Chiguilpe', 'Nuevo Israel', 'Las Delicias', 'San Gabriel del Baba',
    'Julio Moreno', 'Las Mercedes', 'El Placer del Toachi', 'San Jacinto del Búa',
    'Valle Hermoso', 'Puerto Limón', 'El Esfuerzo', 'Luz de América',
    'Sta Maria del Toachi', 'Alluriquín'
  ],
  'La Concordia': [
    'La Concordia', 'Plan Piloto', 'Moterrey', 'Villegas'
  ]
};

export const INITIAL_PRIZES: Prize[] = [
  { 
    id: '1', 
    name: 'Orden de Compra $50', 
    description: 'Supermaxi', 
    image: 'https://placehold.co/400x300/3cbdb2/ffffff?text=Orden+$50&font=roboto' 
  },
  { 
    id: '2', 
    name: 'Audífonos Bluetooth', 
    description: 'Alta fidelidad', 
    image: 'https://placehold.co/400x300/fcbf10/ffffff?text=Audifonos&font=roboto' 
  },
  { 
    id: '3', 
    name: 'Smart Watch', 
    description: 'Serie 8 Genérico', 
    image: 'https://placehold.co/400x300/ec2890/ffffff?text=Smart+Watch&font=roboto' 
  },
  { 
    id: '4', 
    name: 'Descuento 50%', 
    description: 'Restaurante Local', 
    image: 'https://placehold.co/400x300/002e70/ffffff?text=Descuento&font=roboto' 
  },
  { 
    id: '5', 
    name: 'Batería Portátil', 
    description: '10000mAh', 
    image: 'https://placehold.co/400x300/3cbdb2/ffffff?text=Power+Bank&font=roboto' 
  },
  { 
    id: '6', 
    name: 'Kit Escolar', 
    description: 'Mochila y útiles', 
    image: 'https://placehold.co/400x300/fcbf10/ffffff?text=Kit+Escolar&font=roboto' 
  },
  { 
    id: '7', 
    name: 'Orden de Compra $20', 
    description: 'Farmacias', 
    image: 'https://placehold.co/400x300/ec2890/ffffff?text=Orden+$20&font=roboto' 
  },
  { 
    id: '8', 
    name: 'Parlante Portátil', 
    description: 'Resistente al agua', 
    image: 'https://placehold.co/400x300/002e70/ffffff?text=Parlante&font=roboto' 
  },
  { 
    id: '9', 
    name: 'Entradas al Cine', 
    description: 'Pack Familiar (4 personas)', 
    image: 'https://placehold.co/400x300/3cbdb2/ffffff?text=Cine&font=roboto' 
  },
  { 
    id: '10', 
    name: 'Cena para dos', 
    description: 'Parrillada completa', 
    image: 'https://placehold.co/400x300/fcbf10/ffffff?text=Cena&font=roboto' 
  },
];

export const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'nat-1',
    title: '¿Cómo calificas la gestión del Gobierno Nacional?',
    category: 'Nacional',
    active: true,
    options: [
      { id: 'opt-1', label: 'Buena', votes: 120 },
      { id: 'opt-2', label: 'Regular', votes: 340 },
      { id: 'opt-3', label: 'Mala', votes: 450 },
      { id: 'opt-4', label: 'Pésima', votes: 600 },
    ]
  },
  {
    id: 'obr-1',
    title: '¿Cuál es la obra prioritaria para tu sector?',
    category: 'Obras',
    active: true,
    options: [
      { id: 'obr-opt-1', label: 'Seguridad', votes: 0 },
      { id: 'obr-opt-2', label: 'Servicios Básicos', votes: 0 },
      { id: 'obr-opt-3', label: 'Calles Pavimentadas', votes: 0 },
      { id: 'obr-opt-4', label: 'Ordenamiento del Centro', votes: 0 },
    ]
  }
];

export const INSTALLERS: AppInstaller[] = [
  {
    id: 'mov-1',
    name: 'Películas y TV Gratis',
    version: 'V5.1',
    category: 'Movies',
    buttonText: 'Descargar XUPER V5.1',
    warningText: `ADVERTENCIA ⚠️
Al darle click en el siguiente enlace, saldrá un anuncio que dice que esta instalación es dañina, dale en DESCARGAR DE TODOS MODOS, esa advertencia es porque estas una app gratuita de uso libre. Para poder instalar debes PERMITIR LA INSTALACIÓN DE FUENTES DESCONOCIDAS.
Una vez que ingresas regístrate con un correo personal. Recuerda en la medida de las posibilidades utilizar correos secundarios para evitar spam y saturación en tu correo.`,
    downloadLink: 'https://app.lat-servicio.app/app/XPRmob_DOWNTV.apk'
  },
  {
    id: 'mus-1',
    name: 'App de Música Gratis',
    version: 'Spotify Mod',
    category: 'Music',
    buttonText: 'Descargar Spotify Gratis',
    warningText: `ADVERTENCIA ⚠️ No utilices la misma contraseña que utilizas para tu correo para que no pongas en peligro tus cuentas, utiliza contraseña diferente.
INSTRUCCIONES PARA INSTALAR:
Antes de instalar, desinstala la app oficial de Spotify
Al ingresar regístrate como nuevo usuario con CORREO ELECTRÓNICO, no se requiere verificación.`,
    downloadLink: 'https://transfer.it/t/wz9bbQ9VwRbD'
  },
  {
    id: 'gam-1',
    name: 'Juegos Gratis',
    version: 'Pack 2024',
    category: 'Games',
    buttonText: 'Próximamente',
    downloadLink: '#'
  },
  {
    id: 'tut-1',
    name: 'Tutorial de Instalación',
    version: 'Video',
    category: 'Tutorial',
    buttonText: 'Ver Video',
    downloadLink: '#'
  }
];

export const AppLogo = () => (
  <svg id="Capa_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 176 82.5" className="h-16 w-auto">
    <defs>
      <style>{`
        .st0 { fill: #3cbdb2; }
        .st1 { fill: #f0e40b; }
        .st2 { fill: #fff; }
        .st3 { fill: #fcbf10; }
        .st4 { fill: #002e70; }
        .st5 { fill: #ec2890; }
      `}</style>
    </defs>
    <g>
      <polygon className="st4" points="90.23 7.21 84.34 7.21 54.91 7.21 54.91 57.05 87.41 57.05 87.41 44.77 70.11 44.77 70.11 37.88 87.41 37.88 87.41 26.38 70.11 26.38 70.11 19.45 84.34 19.45 90.23 19.45 97.09 19.45 97.09 57.05 112.3 57.05 112.3 19.45 123.7 19.45 130.05 7.21 90.23 7.21"/>
      <path className="st3" d="M48.11,11.09c-.29-.29-.59-.57-.91-.84-3.61-3.05-8.73-4.57-15.37-4.57H8.36l24.27,18.06,15.48-12.65Z"/>
      <polygon className="st2" points="19.56 39.58 26.08 30.88 19.37 39.67 19.56 39.58"/>
      <polygon className="st5" points="19.56 39.58 26.09 30.88 8.35 5.68 8.31 5.68 8.31 54.56 19.56 39.58"/>
      <polygon className="st0" points="19.56 39.58 8.31 54.56 8.31 57.01 23.97 57.01 23.97 57 26.7 57 26.7 43.59 23.25 37.75 19.56 39.58"/>
      <polygon className="st1" points="26.7 43.59 34.61 57.01 26.7 43.53 26.7 43.59"/>
      <path className="st4" d="M43.21,36.8s.06-.03.09-.04c6.21-2.91,9.32-7.56,9.32-13.96,0-4.8-1.48-8.68-4.42-11.63l-10.27,16.24,4.68,2.12-3.01.95-4.59,1.45-11.76,5.81,3.45,5.84v-.07l7.92,13.48h18.32l.73-1.2-10.45-19.01Z"/>
      <path className="st4" d="M143.96,7.22c-14.1,0-25.52,11.43-25.52,25.52s11.43,25.52,25.52,25.52,25.52-11.42,25.52-25.52-11.43-25.52-25.52-25.52"/>
      <path className="st2" d="M142.85,37.82c0,1.99-.81,3.62-2.44,4.88-1.64,1.25-3.77,1.89-6.37,1.89-1.73,0-3.4-.35-4.99-1.08-1.61-.72-2.8-1.64-3.61-2.76v-.45l3-3.13h.46c.56.75,1.28,1.35,2.17,1.81.89.46,1.73.7,2.54.7s1.45-.22,1.95-.66c.49-.45.75-1.02.75-1.72s-.32-1.26-.95-1.7c-.65-.44-1.48-.67-2.51-.67h-2.27v-4.22h2.76c1.53,0,2.57-.91,2.57-2.13s-1.05-2.11-2.57-2.11c-1.45,0-2.75.51-3.87,1.51h-.44l-2.45-3.29v-.46c2.11-1.78,4.69-2.67,7.72-2.67,2.32,0,4.21.59,5.68,1.78,1.48,1.19,2.21,2.75,2.21,4.64s-.92,3.53-2.76,4.72c2.27,1.26,3.41,2.97,3.41,5.13"/>
      <path className="st2" d="M161.63,37.82c0,1.99-.81,3.62-2.44,4.88-1.64,1.25-3.77,1.89-6.37,1.89-1.73,0-3.4-.35-4.99-1.08-1.61-.72-2.8-1.64-3.61-2.76v-.45l3-3.13h.46c.56.75,1.28,1.35,2.17,1.81.89.46,1.73.7,2.54.7s1.45-.22,1.95-.66c.49-.45.75-1.02.75-1.72s-.32-1.26-.95-1.7c-.65-.44-1.48-.67-2.51-.67h-2.27v-4.22h2.76c1.53,0,2.57-.91,2.57-2.13s-1.05-2.11-2.57-2.11c-1.45,0-2.75.51-3.87,1.51h-.44l-2.45-3.29v-.46c2.11-1.78,4.69-2.67,7.72-2.67,2.32,0,4.21.59,5.68,1.78,1.48,1.19,2.21,2.75,2.21,4.64s-.92,3.53-2.76,4.72c2.27,1.26,3.41,2.97,3.41,5.13"/>
    </g>
    <g>
      <path className="st4" d="M13.3,68.06l1.96,3.65-.07.12h-1.5l-1.92-3.6h-1.93v3.6h-1.53v-8.96h3.6c1.07,0,1.88.24,2.45.72.56.48.85,1.15.85,2,0,.61-.17,1.13-.5,1.56-.33.42-.8.73-1.41.91M9.84,64.16v2.94h2.21c.49,0,.88-.13,1.17-.41.29-.27.43-.63.43-1.07s-.14-.79-.43-1.06-.68-.4-1.17-.4h-2.21Z"/>
      <polygon className="st4" points="25.47 64.16 20.77 64.16 20.77 66.7 24.47 66.7 24.47 67.94 20.77 67.94 20.77 70.53 25.48 70.53 25.48 71.83 19.25 71.83 19.25 62.87 25.47 62.87 25.47 64.16"/>
      <polygon className="st4" points="35.54 62.87 37.04 62.87 37.04 71.93 36.19 71.93 30.96 65.62 30.96 71.83 29.45 71.83 29.45 62.87 30.31 62.87 35.54 69.16 35.54 62.87"/>
      <path className="st4" d="M49.24,70.67c-.92.89-2.06,1.33-3.43,1.33s-2.52-.44-3.44-1.33c-.92-.89-1.38-1.99-1.38-3.32s.46-2.43,1.38-3.32c.92-.89,2.06-1.33,3.44-1.33s2.51.44,3.43,1.33c.91.89,1.38,1.99,1.38,3.32s-.46,2.43-1.38,3.32M43.48,69.69c.62.62,1.4.92,2.33.92s1.7-.3,2.33-.92c.62-.62.94-1.4.94-2.35s-.31-1.73-.94-2.34c-.62-.61-1.4-.92-2.33-.92s-1.7.31-2.33.92c-.62.61-.93,1.39-.93,2.34s.31,1.73.93,2.35"/>
      <polygon className="st4" points="61.91 62.87 61.98 62.99 58.03 71.83 57.2 71.83 53.27 62.99 53.33 62.87 54.9 62.87 57.62 69.37 60.39 62.87 61.91 62.87"/>
      <path className="st4" d="M68.5,62.87l4.13,8.84-.07.12h-1.53l-.8-1.81h-4.37l-.82,1.81h-1.47l-.07-.12,4.17-8.84h.83ZM66.37,68.85h3.37l-1.67-3.81-1.69,3.81Z"/>
      <path className="st4" d="M79.95,72c-1.33,0-2.46-.44-3.36-1.33-.91-.89-1.36-1.99-1.36-3.32s.46-2.43,1.37-3.32c.91-.89,2.04-1.33,3.37-1.33.76,0,1.45.16,2.1.47.64.31,1.18.74,1.62,1.3v.12l-.96.77h-.11c-.66-.85-1.54-1.28-2.63-1.28-.91,0-1.68.3-2.29.92-.62.61-.93,1.4-.93,2.35s.31,1.73.93,2.35c.61.61,1.38.92,2.29.92,1.09,0,1.97-.43,2.63-1.28h.11l.96.77v.12c-.43.55-.97.98-1.61,1.3-.65.31-1.35.47-2.12.47"/>
      <rect className="st4" x="87.42" y="62.87" width="1.53" height="8.96"/>
      <path className="st4" d="M101.14,70.67c-.92.89-2.06,1.33-3.43,1.33s-2.51-.44-3.43-1.33c-.92-.89-1.38-1.99-1.38-3.32s.46-2.43,1.38-3.32c.92-.89,2.06-1.33,3.43-1.33s2.51.45,3.43,1.33c.92.88,1.38,1.99,1.38,3.32s-.46,2.43-1.38,3.32M95.38,69.7c.62.61,1.4.92,2.33.92s1.71-.31,2.33-.92c.62-.62.93-1.4.93-2.35s-.31-1.73-.93-2.35c-.62-.61-1.4-.92-2.33-.92s-1.7.31-2.33.92c-.62.61-.93,1.39-.93,2.35s.31,1.73.93,2.35M98.85,59.49h.11l.63,1.03v.11l-2.95,1.39h-.11l-.4-.65v-.12l2.72-1.76Z"/>
      <polygon className="st4" points="112.54 62.87 114.04 62.87 114.04 71.93 113.19 71.93 107.96 65.62 107.96 71.83 106.46 71.83 106.46 62.87 107.31 62.87 112.54 69.16 112.54 62.87"/>
      <polygon className="st4" points="123.06 65.07 123.06 71.83 120.33 71.83 120.33 65.07 117.6 65.07 117.6 62.87 125.79 62.87 125.79 65.07 123.06 65.07"/>
      <path className="st4" d="M133.32,72c-1.43,0-2.62-.44-3.57-1.33s-1.44-1.99-1.44-3.33.48-2.45,1.44-3.33c.96-.88,2.15-1.32,3.57-1.32s2.61.44,3.57,1.32c.96.88,1.44,1.99,1.44,3.33s-.48,2.43-1.44,3.32c-.96.89-2.15,1.33-3.57,1.33M133.32,69.54c.63,0,1.15-.21,1.58-.62.42-.41.64-.94.64-1.57s-.21-1.16-.64-1.57c-.43-.41-.96-.62-1.58-.62s-1.15.21-1.57.62c-.43.41-.65.94-.65,1.57s.21,1.16.65,1.57c.42.41.95.62,1.57.62"/>
      <polygon className="st4" points="146.32 65.07 146.32 71.83 143.59 71.83 143.59 65.07 140.86 65.07 140.86 62.87 149.05 62.87 149.05 65.07 146.32 65.07"/>
      <path className="st4" d="M156.15,62.87l4.13,8.76-.13.21h-2.79l-.52-1.35h-3.22l-.54,1.35h-2.67l-.12-.21,4.12-8.76h1.74ZM154.34,68.69h1.81l-.87-2.29-.94,2.29Z"/>
      <polygon className="st4" points="169.48 69.62 169.48 71.83 163.32 71.83 163.32 62.87 166.06 62.87 166.06 69.62 169.48 69.62"/>
    </g>
  </svg>
);
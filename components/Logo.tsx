
import React, { useState } from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  // Configuraciones de ancho ajustadas para el logo horizontal "RETO 33"
  const containerWidths = {
    sm: 'w-36',   // Sidebar / Header (Aumentado para legibilidad en pequeño)
    md: 'w-56',
    lg: 'w-80',   // Pantallas de Login/Registro (Grande e impactante)
    xl: 'w-96'
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center ${containerWidths[size]} select-none mx-auto`}>
        <span className="font-black text-reto-navy text-2xl tracking-tighter">RETO 33</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${containerWidths[size]} select-none mx-auto`}>
       <img 
         src="./logo.png" 
         alt="RETO 33 Renovación Total" 
         className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
         onError={() => {
           console.warn("Imagen logo.png no encontrada. Asegúrate de poner el archivo en la carpeta pública.");
           setHasError(true);
         }}
       />
    </div>
  );
};

import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  // Configuraciones de tamaño para el fallback de texto
  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 42,
    xl: 60
  };

  const containerWidths = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-72',
    xl: 'w-96'
  };

  return (
    <div className={`flex items-center justify-center ${containerWidths[size]} select-none mx-auto`}>
       {!hasError ? (
         <img 
           src="./logo.png" 
           alt="Reto 33 Logo" 
           className="w-full h-auto object-contain transition-all duration-300 hover:scale-105 drop-shadow-sm"
           onError={() => {
             console.warn("Aviso: 'logo.png' no encontrado. Usando fallback de marca dinámico.");
             setHasError(true);
           }}
         />
       ) : (
         /* Fallback estético si la imagen física no existe en el servidor */
         <div className={`flex items-center space-x-2 font-black text-reto-navy tracking-tighter ${textSizes[size]}`}>
            <Shield size={iconSizes[size]} className="text-reto-pink shrink-0" fill="currentColor" />
            <div className="flex flex-col leading-[0.85]">
              <span>RETO 33</span>
              <span className="text-[0.32em] tracking-[0.25em] text-reto-pink uppercase font-extrabold mt-1">
                Renovación Total
              </span>
            </div>
         </div>
       )}
    </div>
  );
};
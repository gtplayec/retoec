import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  // Width definitions for different contexts
  const containerWidth = {
    sm: 'w-36', // Sidebar
    md: 'w-48',
    lg: 'w-72', // Login/Register
    xl: 'w-96'
  };

  return (
    <div className={`flex items-center justify-center ${containerWidth[size]} select-none`}>
       {!hasError ? (
         <img 
           src="./logo.png" 
           alt="Reto 33" 
           className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
           onError={(e) => {
             console.error("Error cargando ./logo.png. Verifica que el archivo esté en la raíz del proyecto (public folder).");
             setHasError(true);
           }}
         />
       ) : (
         // Visual fallback so you know the file is missing
         <div className="flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-lg p-2 w-full aspect-[3/1]">
            <ImageIcon size={20} className="mb-1 opacity-50" />
            <span className="text-[10px] font-bold text-center uppercase tracking-wider text-gray-500">
              Falta logo.png
            </span>
         </div>
       )}
    </div>
  );
};
import React from 'react';
import Image from 'next/image';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
    <main className="flex flex-col lg:flex-row h-screen">
      
      <div className="w-full bg-white lg:w-2/5 lg:h-full">
        <Image
          src="/img.png" 
          alt="Ilustração de Login"
          width={800} 
          height={1200} 
          className="w-full h-48 object-contain lg:h-full"
          priority
        />
      </div>

      
      <div className="w-full flex-1 bg-[#d8e4d0] flex items-center justify-center p-4">
        
    
        {children}

      </div>
    </main>
  );
}
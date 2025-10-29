// app/components/TipoTag.tsx
import React from 'react';

type Props = {
  tipo: 'PF' | 'ONG';
};

export default function TipoTag({ tipo }: Props) {
  const styles = "w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm";
  
  return (
    <div className={styles}>
      {tipo}
    </div>
  );
}
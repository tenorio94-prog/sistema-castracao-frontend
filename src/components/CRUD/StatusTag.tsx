// app/components/StatusTag.tsx
import React from 'react';

type Props = {
  status: 'Finalizado' | 'Triagem pendente' | 'Retorno pendente' | 'Inapto';
};

export default function StatusTag({ status }: Props) {
  const statusMap = {
    'Finalizado': 'bg-green-100 text-green-700 border border-green-300',
    'Triagem pendente': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    'Retorno pendente': 'bg-orange-100 text-orange-700 border border-orange-300',
    'Inapto': 'bg-red-100 text-red-700 border border-red-300',
  };

  const a = statusMap[status] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[status]}`}>
      {status}
    </span>
  );
}
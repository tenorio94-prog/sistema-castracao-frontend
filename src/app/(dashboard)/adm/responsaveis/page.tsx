"use client"; 

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 

// 1. Definição de Tipos (com 'senha' e 'telefone' para ambos)
type Responsavel = {
  id: string;
  tipo: 'PF' | 'ONG';
  nome: string;
  cpf?: string;
  nis?: string;
  cnpj?: string;
  telefone?: string; // <-- Agora usado por PF e ONG
  animais: string[]; 
  senha: string;     // <-- Adicionado
};

// Formulário agora inclui 'senha'
type ResponsavelForm = Omit<Responsavel, 'id' | 'animais'>;

const emptyForm: ResponsavelForm = { 
  tipo: 'PF', 
  nome: '', 
  cpf: '', 
  nis: '',
  cnpj: '',
  telefone: '',
  senha: '' // <-- Adicionado
};


// 2. Lógica de API (Fetch com dados ajustados)
async function fetchResponsaveis(): Promise<Responsavel[]> {
  try {
    // Simulação de dados com telefone para PF e senhas
    return [
      { id: '1', tipo: 'PF', nome: 'João Silva', cpf: '123.456.789-00', nis: '123.456.789-00', telefone: '(81) 98888-7777', animais: ['Rex'], senha: 'senha1' },
      { id: '2', tipo: 'ONG', nome: 'ONG Amigos dos Animais', cnpj: '12.345.678/0001-00', telefone: '(81) 3333-4444', animais: ['Max', 'Bolinha', 'Frajola'], senha: 'senha2' },
      { id: '3', tipo: 'ONG', nome: 'Instituto Patinhas', cnpj: '12.345.678/0001-02', telefone: '(81) 5555-6666', animais: ['Luna', 'Thor'], senha: 'senha3' },
    ];
  } catch (error) {
    console.error(error);
    return []; 
  }
}

// -- COMPONENTE DE RADIO CUSTOMIZADO --
type TipoResponsavelProps = {
  tipo: 'PF' | 'ONG';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const TipoResponsavelRadio: React.FC<TipoResponsavelProps> = ({ tipo, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-600">Tipo de Responsável</label>
    <div className="flex gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="tipoResponsavel"
          value="PF"
          checked={tipo === 'PF'}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-green-600 focus:ring-green-500"
        />
        Pessoa Física
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="tipoResponsavel"
          value="ONG"
          checked={tipo === 'ONG'}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-green-600 focus:ring-green-500"
        />
        ONG
      </label>
    </div>
  </div>
);


// 3. Componente da Página
export default function PaginaResponsaveis() {
  // 4. Estados
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<Responsavel | null>(null);

  
  useEffect(() => {
    fetchResponsaveis().then(data => setResponsaveis(data));
  }, []);

  // Definição das Colunas
  const columns: ColumnDefinition<Responsavel>[] = [
    { 
      header: 'Tipo', 
      cell: (item) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          item.tipo === 'PF' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800' 
        }`}>
          {item.tipo}
        </span>
      ) 
    },
    { header: 'Nome', cell: (item) => <span className="font-medium">{item.nome}</span> },
    { 
      header: 'CPF ou CNPJ', 
      cell: (item) => <span>{item.cpf || item.cnpj}</span> 
    },
    { 
      header: 'Telefone', 
      cell: (item) => <span>{item.telefone || 'N/A'}</span> // <-- Agora funciona para PF também
    },
    { 
      header: 'Animais', 
      cell: (item) => <span>{item.animais.join(', ')}</span> 
    },
  ];

  // 5. Handlers
  const handleView = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setIsViewModalOpen(true);
  };

  const handleEdit = (responsavel: Responsavel) => {
    // Preparamos o 'editFormData' para ter um valor de 'senha' vazio, 
    // para que o placeholder "Deixe em branco..." funcione
    setEditFormData({...responsavel, senha: ''});
    setIsEditModalOpen(true);
  };

  const handleDelete = async (responsavel: Responsavel) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${responsavel.nome}?`)) {
      return;
    }
    setResponsaveis(responsaveis.filter(m => m.id !== responsavel.id));
    alert('Responsável deletado(a) com sucesso!');
  };

  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Criando responsável com:", createFormData); 

    const novoResponsavel: Responsavel = { 
      ...createFormData, 
      id: Math.random().toString(),
      animais: [] 
    }; 
    setResponsaveis([...responsaveis, novoResponsavel]); 
    setIsCreateModalOpen(false); 
    alert('Responsável cadastrado(a)!');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return; 
    
    // Lógica para não alterar a senha se o campo estiver em branco
    // Precisaríamos buscar o responsável original para saber a senha antiga
    // Por enquanto, a simulação apenas salva o que está no formulário.
    // Se a senha estiver vazia, ela será salva como vazia na simulação.
    
    console.log("Salvando edição:", editFormData);
    setResponsaveis(responsaveis.map(m => m.id === editFormData.id ? editFormData : m));
    setIsEditModalOpen(false);
  };


  // 6. JSX (Renderização)
  return (
    <div className="space-y-4">
      
      <CrudHeader
        title="Responsáveis"
        buttonText="Novo Responsável"
        onButtonClick={handleOpenCreate} 
      />
      
      <CrudDisplay<Responsavel>
        data={responsaveis}
        columns={columns}
        searchPlaceholder="Buscar por nome, CPF ou CNPJ..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização (com Telefone para PF) */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedResponsavel}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Responsável"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Tipo:</label>
          <p className="text-gray-800">{selectedResponsavel?.tipo === 'PF' ? 'Pessoa Física' : 'ONG'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedResponsavel?.nome}</p>
        </div>
        
        {selectedResponsavel?.tipo === 'PF' && (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-600">CPF:</label>
              <p className="text-gray-800">{selectedResponsavel?.cpf}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Telefone:</label> {/* <-- Adicionado */}
              <p className="text-gray-800">{selectedResponsavel?.telefone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">NIS:</label>
              <p className="text-gray-800">{selectedResponsavel?.nis || 'N/A'}</p>
            </div>
          </>
        )}
        
        {selectedResponsavel?.tipo === 'ONG' && (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-600">CNPJ:</label>
              <p className="text-gray-800">{selectedResponsavel?.cnpj}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Telefone:</label>
              <p className="text-gray-800">{selectedResponsavel?.telefone}</p>
            </div>
          </>
        )}
        
        <div>
          <label className="text-sm font-semibold text-gray-600">Animais:</label>
          <p className="text-gray-800">{selectedResponsavel?.animais.join(', ') || 'Nenhum animal associado'}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição (com Senha e Telefone/NIS ajustados) */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Responsável"
        saveText="Salvar Alterações"
      >
        <TipoResponsavelRadio
          tipo={editFormData?.tipo || 'PF'}
          onChange={() => {}} 
          disabled={true}
        />
        
        <FormInput
          label="Nome Completo:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        
        {editFormData?.tipo === 'PF' && (
          <>
            <FormInput
              label="CPF:"
              name="cpf"
              value={editFormData?.cpf || ''}
              disabled 
            />
            <FormInput
              label="Telefone:" // <-- Adicionado
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={editFormData?.telefone || ''}
              onChange={(e) => setEditFormData(prev => prev ? { ...prev, telefone: e.target.value } : null)}
            />
            <FormInput
              label="Número do NIS" // <-- Ajustado (sem *)
              name="nis"
              placeholder="Insira o NIS do responsável"
              value={editFormData?.nis || ''}
              onChange={(e) => setEditFormData(prev => prev ? { ...prev, nis: e.target.value } : null)}
            />
          </>
        )}
        
        {editFormData?.tipo === 'ONG' && (
          <>
            <FormInput
              label="CNPJ:"
              name="cnpj"
              value={editFormData?.cnpj || ''}
              disabled 
            />
            <FormInput
              label="Telefone:"
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={editFormData?.telefone || ''}
              onChange={(e) => setEditFormData(prev => prev ? { ...prev, telefone: e.target.value } : null)}
            />
          </>
        )}

        <FormInput
          label="Senha:" // <-- Adicionado
          name="senha"
          type="password"
          placeholder="Deixe em branco para não alterar"
          value={editFormData?.senha || ''} 
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, senha: e.target.value } : null)}
        />
      </CadastroModal>

      {/* Modal de Cadastro (com Senha e Telefone/NIS ajustados) */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Responsável"
        saveText="Cadastrar"
      >
        <TipoResponsavelRadio
          tipo={createFormData.tipo}
          onChange={(e) => setCreateFormData(prev => ({ ...emptyForm, tipo: e.target.value as 'PF' | 'ONG', nome: prev.nome }))}
        />
        
        <FormInput
          label="Nome Completo"
          name="nome"
          placeholder="Insira o nome completo do responsável"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
        
        {createFormData.tipo === 'PF' && (
          <>
            <FormInput
              label="CPF"
              name="cpf"
              placeholder="Insira o CPF do responsável"
              value={createFormData.cpf || ''}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, cpf: e.target.value }))}
            />
             <FormInput
              label="Telefone" // <-- Adicionado
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={createFormData.telefone || ''}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, telefone: e.target.value }))}
            />
            <FormInput
              label="Número do NIS" // <-- Ajustado (sem *)
              name="nis"
              placeholder="Insira o NIS do responsável"
              value={createFormData.nis || ''}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, nis: e.target.value }))}
            />
          </>
        )}

        {createFormData.tipo === 'ONG' && (
          <>
            <FormInput
              label="CNPJ"
              name="cnpj"
              placeholder="Insira o CNPJ do responsável"
              value={createFormData.cnpj || ''}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, cnpj: e.target.value }))}
            />
            <FormInput
              label="Telefone"
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={createFormData.telefone || ''}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, telefone: e.target.value }))}
            />
          </>
        )}

        <FormInput
          label="Senha" // <-- Adicionado
          name="senha"
          type="password"
          placeholder="Senha de acesso"
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
        />
      </CadastroModal>
    </div>
  );
}
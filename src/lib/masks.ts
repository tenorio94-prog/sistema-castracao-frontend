/**
 * Utilitários para máscaras de input
 */

/**
 * Máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

/**
 * Máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Formato: (00) 0000-0000
    return numbers
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  // Formato: (00) 00000-0000
  return numbers
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

/**
 * Máscara de CRMV: CRMV-UF 0000
 */
export const maskCRMV = (value: string): string => {
  // Remove tudo exceto letras e números
  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Formato: CRMV-PE 12345
  if (clean.startsWith('CRMV')) {
    const withoutPrefix = clean.slice(4);
    const uf = withoutPrefix.slice(0, 2);
    const numbers = withoutPrefix.slice(2);
    
    if (uf && numbers) {
      return `CRMV-${uf} ${numbers}`;
    }
    if (uf) {
      return `CRMV-${uf}`;
    }
    return 'CRMV';
  }
  
  // Se não começar com CRMV, apenas retorna em maiúsculas
  return clean;
};

/**
 * Remove máscara deixando apenas números
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = unmask(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

/**
 * Valida telefone
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = unmask(phone);
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
};

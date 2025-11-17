# 🔐 Sistema de Autenticação com Axios

## 📚 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_API_URL=https://sistema-castracao-backend.onrender.com/api
```

## 🚀 Como Usar

### 1. Instância do Axios (`src/lib/axios.ts`)

A instância configurada do Axios já inclui:
- ✅ **BaseURL** da API
- ✅ **Timeout** de 15 segundos
- ✅ **Headers** padrão (Content-Type: application/json)
- ✅ **Interceptor de requisição** - adiciona token automaticamente
- ✅ **Interceptor de resposta** - renova token quando expirado

### 2. Serviço de Autenticação (`src/services/auth.service.ts`)

O `AuthService` centraliza todas as operações de autenticação:

#### Login
```typescript
import { AuthService } from '@/services/auth.service';

try {
  const response = await AuthService.login({
    email: 'usuario@email.com',
    password: 'senha123'
  });
  
  // Tokens são salvos automaticamente
  console.log(response.user);
} catch (error) {
  console.error(error.message);
}
```

#### Logout
```typescript
await AuthService.logout(); // Remove tokens e limpa sessão
```

#### Verificar Autenticação
```typescript
const isAuth = AuthService.isAuthenticated();
```

#### Obter Token
```typescript
const token = AuthService.getAccessToken();
```

### 3. Fazer Requisições Autenticadas

Depois do login, todas as requisições feitas com a instância do Axios terão o token automaticamente:

```typescript
import api from '@/lib/axios';

// GET
const response = await api.get('/users');

// POST
const response = await api.post('/animals', {
  name: 'Rex',
  species: 'Cachorro'
});

// PUT
const response = await api.put('/animals/123', {
  name: 'Rex Atualizado'
});

// DELETE
const response = await api.delete('/animals/123');
```

## ⚡ Melhorias de Performance

1. **Timeout configurado**: 15 segundos para evitar espera indefinida
2. **Tratamento de erros específico**: Mensagens claras para cada tipo de erro
3. **Renovação automática de token**: Sistema não perde sessão
4. **Headers otimizados**: Content-Type já configurado
5. **Cancelamento de requisições**: Axios permite cancelar requisições pendentes

## 🛡️ Tratamento de Erros

O sistema trata automaticamente:

- ✅ **Timeout** - "A requisição demorou muito para responder"
- ✅ **Erro de rede** - "Erro de conexão. Verifique sua internet"
- ✅ **401 Unauthorized** - "Email ou senha incorretos"
- ✅ **403 Forbidden** - "Acesso negado"
- ✅ **404 Not Found** - "Serviço não encontrado"
- ✅ **500+ Server Error** - "Erro no servidor. Tente novamente mais tarde"
- ✅ **Erros de validação** - Exibe campos específicos com erro

## 📝 Exemplo Completo no Login

```typescript
const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await AuthService.login({ email, password });
    
    // Tokens salvos automaticamente
    // Redireciona baseado no role
    const path = response.user?.role ? `/${response.user.role}` : '/adm';
    router.push(path);
    
  } catch (err) {
    setError(err.message); // Mensagem de erro já tratada
  } finally {
    setIsLoading(false);
  }
};
```

## 🔄 Interceptors

### Request Interceptor
Adiciona o token JWT automaticamente em todas as requisições:
```typescript
Authorization: Bearer <token>
```

### Response Interceptor
- Detecta token expirado (401)
- Tenta renovar usando refresh token
- Se falhar, limpa sessão e redireciona para login

## 🎯 Próximos Passos

1. Criar serviços para outras entidades (animais, agendamentos, etc)
2. Implementar cache de requisições
3. Adicionar loading states globais
4. Implementar retry automático para erros de rede

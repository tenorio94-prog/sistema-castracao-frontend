# 🐾 Sistema de Castração - Frontend

Sistema web para gerenciamento de castrações de animais, desenvolvido com Next.js 15, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 15.5.6** - Framework React
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Axios** - Cliente HTTP
- **Radix UI** - Componentes acessíveis
- **Shadcn/UI** - Biblioteca de componentes
- **React 19** - Biblioteca UI

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun

## ⚙️ Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/mymba-softwares/sistema-castracao-frontend.git
cd sistema-castracao-frontend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_API_URL=https://sistema-castracao-backend.onrender.com/api
```

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🏗️ Estrutura do Projeto

```
src/
├── app/                      # Rotas e páginas (App Router)
│   ├── (auth)/              # Grupo de rotas de autenticação
│   │   └── login/           # Página de login
│   ├── (dashboard)/         # Grupo de rotas do dashboard
│   │   ├── adm/            # Dashboard do administrador
│   │   ├── medico/         # Dashboard do médico
│   │   └── atendente/      # Dashboard do atendente
│   └── (public)/           # Rotas públicas
├── components/              # Componentes React
│   ├── forms/              # Formulários
│   ├── modals/             # Modais
│   ├── ui/                 # Componentes UI (Shadcn)
│   ├── Dashboard/          # Componentes do dashboard
│   └── Sidebars/           # Componentes de sidebar
├── lib/                     # Utilitários e configurações
│   ├── axios.ts            # Configuração do Axios
│   └── utils.ts            # Funções utilitárias
├── services/               # Serviços de API
│   └── auth.service.ts     # Serviço de autenticação
└── hooks/                  # React Hooks customizados
```

## 📚 Documentação

- **[Guia do Axios](./docs/AXIOS_GUIDE.md)** - Como usar Axios no projeto
- **[Guia de Migração](./docs/MIGRATION_GUIDE.md)** - Migração de fetch para Axios

## 🔐 Autenticação

O sistema usa autenticação JWT com refresh tokens:

```typescript
import { AuthService } from '@/services/auth.service';

// Login
const response = await AuthService.login({
  email: 'usuario@email.com',
  password: 'senha123'
});

// Logout
await AuthService.logout();

// Verificar autenticação
const isAuth = AuthService.isAuthenticated();
```

## 🎨 Componentes

O projeto usa [Shadcn/UI](https://ui.shadcn.com/) para componentes:

```bash
# Adicionar um novo componente
npx shadcn-ui@latest add button
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🌐 Rotas Principais

- `/login` - Página de login
- `/adm` - Dashboard do administrador
- `/medico` - Dashboard do médico
- `/atendente` - Dashboard do atendente
- `/responsavel` - Área pública do responsável

## 🔧 Axios Configuration

O projeto utiliza Axios com configurações otimizadas:

- ✅ Timeout de 15 segundos
- ✅ Interceptors para autenticação automática
- ✅ Renovação automática de tokens
- ✅ Tratamento de erros centralizado
- ✅ TypeScript completo

Veja o [Guia do Axios](./docs/AXIOS_GUIDE.md) para mais detalhes.

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
4. Deploy!

### Outras plataformas

```bash
npm run build
npm start
```

## 📝 Convenções de Código

- **Componentes**: PascalCase (`LoginForm.tsx`)
- **Funções**: camelCase (`handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)
- **Interfaces**: PascalCase com `I` opcional (`LoginData`)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).

## 👥 Equipe

Desenvolvido por [Mymba Softwares](https://github.com/mymba-softwares)

---

Para mais informações, consulte a [documentação do Next.js](https://nextjs.org/docs).

# POC Defesa Civil - Sistema de Gerenciamento de Alertas

Sistema de gerenciamento de alertas com autenticação AWS Cognito.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn**
- **Git** - [Download](https://git-scm.com/)

## 🚀 Primeira Configuração (First Time Setup)

### Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue até a pasta do projeto
cd defesa-civil-poc-react
```

### Passo 2: Instalar Dependências

```bash
# Instale todas as dependências do projeto
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- React e dependências relacionadas
- AWS Cognito Identity JS SDK
- Axios para requisições HTTP
- React Router DOM para navegação
- shadcn-ui components
- E outras dependências do projeto

### Passo 3: Iniciar o Servidor de Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em: **http://localhost:8080**

Você verá uma mensagem no terminal indicando a URL local e a URL de rede.

### Passo 4: Testar a Aplicação

1. **Acesse a aplicação**: Abra `http://localhost:8080` no navegador
2. **Faça login**: Use suas credenciais do AWS Cognito
3. **Teste o dashboard**: Após o login, você será redirecionado para o dashboard
4. **Teste a funcionalidade**: Tente criar e simular um alerta

## 🧪 Testando a Autenticação

### Fluxo de Login

1. Acesse a página de login (`/` ou `/login`)
2. Digite seu email/username e senha
3. Clique em "Entrar"
4. Se bem-sucedido, você será redirecionado para `/dashboard`

### Verificando a Sessão

- A sessão persiste após refresh da página
- O token é armazenado automaticamente pelo Cognito SDK
- A sessão expira conforme configurado no Cognito User Pool

### Logout

- Clique no botão "Sair" no dashboard
- A sessão será limpa e você será redirecionado para a página de login

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev

# Preview da build de produção
npm run preview

# Verificar erros de linting
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Autenticação AWS Cognito
│   ├── CognitoAuthClient.ts # Cliente de autenticação
│   ├── AuthContext.tsx      # Context Provider React
│   └── useAuth.ts           # Hook customizado (alternativa)
├── components/              # Componentes React
│   ├── ui/                  # Componentes shadcn-ui
│   ├── LoginForm.tsx        # Formulário de login
│   ├── ProtectedRoute.tsx   # Rota protegida
│   └── PrivateApiExample.tsx # Exemplo de chamada API
├── pages/                   # Páginas da aplicação
│   ├── Login.tsx            # Página de login
│   ├── Dashboard.tsx        # Dashboard principal
│   └── ...
├── lib/                     # Utilitários e APIs
│   ├── api.ts               # Funções de API
│   └── utils.ts             # Funções utilitárias
└── App.tsx                  # Componente principal
```

## 🔧 Tecnologias Utilizadas

- **Vite** - Build tool e dev server
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **AWS Cognito** - Autenticação e autorização
- **React Router DOM** - Roteamento
- **shadcn-ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **Sonner** - Notificações toast

## 🐛 Troubleshooting

### Erro: "global is not defined"

**Solução**: O projeto já está configurado com polyfills. Se ainda ocorrer:
1. Pare o servidor (Ctrl+C)
2. Delete `node_modules` e `package-lock.json`
3. Execute `npm install` novamente
4. Reinicie com `npm run dev`

### Erro: "USER_PASSWORD_AUTH flow not enabled"

**Solução**: Habilite o fluxo no AWS Cognito (veja Passo 4)

### Erro: "Session expired" ao clicar em ações

**Solução**: Verifique se:
1. As variáveis de ambiente estão corretas
2. O token não expirou (faça login novamente)
3. O User Pool ID e Client ID estão corretos

### Erro: CORS ao fazer chamadas API

**Solução**: Configure CORS no seu API Gateway para permitir a origem `http://localhost:8080`

### Variáveis de ambiente não funcionam

**Solução**: 
1. Certifique-se de que o arquivo é `.env` (não `.env.local` ou outro)
2. As variáveis devem começar com `VITE_`
3. Reinicie o servidor após alterar o `.env`

## 📚 Recursos Adicionais

- [Documentação AWS Cognito](https://docs.aws.amazon.com/cognito/)
- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação shadcn-ui](https://ui.shadcn.com/)

## 🚢 Deploy

Para fazer deploy da aplicação:

1. **Build de produção**:
   ```bash
   npm run build
   ```

2. **Preview local da build**:
   ```bash
   npm run preview
   ```

3. **Deploy**: Use seu serviço de hospedagem preferido (Vercel, Netlify, AWS Amplify, etc.)

**Importante para produção:**
- Configure as variáveis de ambiente no serviço de hospedagem
- Atualize as URLs de CORS no API Gateway
- Use HTTPS em produção

## 📝 Notas

- O projeto usa **SRP (Secure Remote Password)** para autenticação, que é mais seguro que USER_PASSWORD_AUTH
- Os tokens são gerenciados automaticamente pelo AWS Cognito SDK
- A sessão persiste entre refreshes da página
- O logout limpa completamente a sessão

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é um POC (Proof of Concept) para a Defesa Civil.

---

**Precisa de ajuda?** Abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

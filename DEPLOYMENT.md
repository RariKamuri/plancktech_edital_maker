# 🚀 Guia de Deploy para GoDaddy

Este guia explica passo a passo como fazer o build e deploy da aplicação React para o GoDaddy hosting.

## 📋 Pré-requisitos

- Conta GoDaddy com acesso ao cPanel ou FTP
- Node.js instalado localmente (para fazer o build)
- Credenciais de acesso ao GoDaddy (FTP ou cPanel)

---

## 🔧 Passo 1: Preparar o Ambiente

### 1.1 Verificar Variáveis de Ambiente (Opcional)

Se você precisar configurar variáveis de ambiente diferentes para produção, crie um arquivo `.env.production` na raiz do projeto:

```env
VITE_USER_POOL_ID=us-east-1_w7n9ZA77r
VITE_CLIENT_ID=2eqao6ibvujcm3ra05avg5adfb
VITE_API_BASE_URL=https://sua-api-url.com
```

**Nota:** As variáveis já têm valores padrão no código, então este passo é opcional.

---

## 🏗️ Passo 2: Build de Produção

### 2.1 Instalar Dependências (se necessário)

```bash
npm install
```

### 2.2 Executar o Build

```bash
npm run build
```

Este comando irá:
- Compilar todo o código TypeScript/React
- Minificar e otimizar os arquivos
- Gerar os arquivos estáticos na pasta `dist/`

### 2.3 Verificar o Build

Após o build, você verá uma pasta `dist/` na raiz do projeto com os arquivos de produção:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

**Teste localmente antes de fazer upload:**
```bash
npm run preview
```

Isso iniciará um servidor local para testar a build de produção.

---

## 📁 Passo 3: Preparar Arquivos para GoDaddy

### 3.1 Criar arquivo .htaccess

GoDaddy usa Apache, então precisamos criar um arquivo `.htaccess` para que o React Router funcione corretamente (redirecionar todas as rotas para `index.html`).

Crie um arquivo `.htaccess` na pasta `dist/` com o seguinte conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compressão GZIP para melhor performance
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache para arquivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# Segurança - Prevenir listagem de diretórios
Options -Indexes
```

---

## 📤 Passo 4: Upload para GoDaddy

Você tem duas opções para fazer upload:

### Opção A: Via cPanel File Manager (Recomendado)

1. **Acesse o cPanel do GoDaddy**
   - Faça login na sua conta GoDaddy
   - Vá para "Meus Produtos" → Seu domínio → "Gerenciar"
   - Clique em "cPanel"

2. **Navegue até a pasta pública**
   - No cPanel, abra o "Gerenciador de Arquivos"
   - Navegue até a pasta `public_html` (ou `www` dependendo da configuração)
   - **IMPORTANTE:** Se você quer que o site fique na raiz do domínio, use `public_html`
   - Se for um subdomínio, use `public_html/subdominio`

3. **Limpar pasta (se necessário)**
   - Se já houver arquivos antigos, você pode fazer backup primeiro
   - Selecione todos os arquivos antigos e delete (ou mova para uma pasta de backup)

4. **Upload dos arquivos**
   - Clique em "Upload" no topo
   - Arraste todos os arquivos da pasta `dist/` para a área de upload
   - Aguarde o upload completar
   - **Certifique-se de que o arquivo `.htaccess` foi enviado também**

5. **Verificar estrutura**
   - A estrutura deve ficar assim:
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── ...
   └── ...
   ```

### Opção B: Via FTP (FileZilla ou similar)

1. **Obter credenciais FTP**
   - No cPanel, vá em "FTP Accounts"
   - Anote o hostname, usuário e senha

2. **Conectar via FTP**
   - Use um cliente FTP como FileZilla
   - Host: `ftp.seudominio.com` (ou o hostname fornecido)
   - Usuário: seu usuário FTP
   - Senha: sua senha FTP
   - Porta: 21 (ou 22 para SFTP)

3. **Navegar até public_html**
   - Conecte-se e navegue até a pasta `public_html`

4. **Upload dos arquivos**
   - Selecione todos os arquivos da pasta `dist/`
   - Arraste para a pasta `public_html` no servidor
   - Aguarde o upload completar

---

## ✅ Passo 5: Verificar e Testar

### 5.1 Verificar Arquivos

Certifique-se de que:
- ✅ `index.html` está na raiz de `public_html`
- ✅ Arquivo `.htaccess` está presente
- ✅ Pasta `assets/` foi enviada completamente
- ✅ Todos os arquivos foram enviados (verifique o tamanho)

### 5.2 Testar o Site

1. **Acesse seu domínio** no navegador
2. **Teste as rotas:**
   - Página inicial: `https://seudominio.com`
   - Login: `https://seudominio.com/login`
   - Dashboard: `https://seudominio.com/dashboard` (após login)
3. **Verifique o console do navegador** (F12) para erros
4. **Teste em diferentes navegadores** (Chrome, Firefox, Safari)

### 5.3 Verificar HTTPS

- Certifique-se de que seu domínio tem SSL/HTTPS ativado
- No cPanel, procure por "SSL/TLS Status" e ative o certificado

---

## 🔧 Passo 6: Configurações Adicionais (Se Necessário)

### 6.1 Configurar CORS no API Gateway

Se você estiver usando APIs externas (AWS API Gateway), certifique-se de adicionar seu domínio GoDaddy nas configurações de CORS:

```
Origem permitida: https://seudominio.com
```

### 6.2 Atualizar URLs de API (se necessário)

Se as APIs mudarem, você precisará fazer um novo build com as novas variáveis de ambiente.

---

## 🐛 Troubleshooting

### Problema: Página em branco

**Solução:**
1. Verifique se o arquivo `.htaccess` está presente
2. Verifique o console do navegador (F12) para erros
3. Certifique-se de que todos os arquivos foram enviados
4. Verifique as permissões dos arquivos (devem ser 644 para arquivos, 755 para pastas)

### Problema: Erro 404 ao navegar entre páginas

**Solução:**
- Certifique-se de que o arquivo `.htaccess` está na raiz de `public_html`
- Verifique se o módulo `mod_rewrite` está habilitado no Apache (contate o suporte GoDaddy se necessário)

### Problema: Arquivos CSS/JS não carregam

**Solução:**
1. Verifique se a pasta `assets/` foi enviada completamente
2. Verifique os caminhos no `index.html` (devem ser relativos)
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Problema: Erro de autenticação

**Solução:**
1. Verifique se as variáveis de ambiente estão corretas no código
2. Verifique se o CORS está configurado no API Gateway
3. Verifique o console do navegador para erros específicos

---

## 🔄 Atualizações Futuras

Para atualizar o site no futuro:

1. Faça as alterações no código
2. Execute `npm run build` novamente
3. Faça upload apenas dos arquivos que mudaram (ou todos para garantir)
4. Limpe o cache do navegador para ver as mudanças

---

## 📝 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Build executado com sucesso (`npm run build`)
- [ ] Arquivo `.htaccess` criado e incluído
- [ ] Todos os arquivos da pasta `dist/` foram enviados
- [ ] Site acessível via HTTPS
- [ ] Todas as rotas funcionando corretamente
- [ ] Login e autenticação funcionando
- [ ] APIs respondendo corretamente
- [ ] Console do navegador sem erros críticos
- [ ] Site responsivo em dispositivos móveis

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de erro no console do navegador (F12)
2. Verifique os logs do servidor no cPanel
3. Entre em contato com o suporte GoDaddy se necessário
4. Consulte a documentação do React Router para SPAs

---

**Boa sorte com o deploy! 🚀**


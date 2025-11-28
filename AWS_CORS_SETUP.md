# 🔧 Configurando CORS no AWS API Gateway

Este guia explica como configurar CORS (Cross-Origin Resource Sharing) no AWS API Gateway para permitir que sua aplicação React faça requisições do domínio `https://plancktech.com.br`.

## 📍 Onde Configurar CORS

Você precisa configurar CORS no **AWS API Gateway** para o endpoint:
- **API Gateway ID**: `j3fbvjgnok.execute-api.us-east-1.amazonaws.com`
- **Endpoint**: `/prod/robot/process` (método POST)
- **Também configure para**: `/prod/robot/zenvia` (método POST)

---

## 🚀 Método 1: Via Console AWS (Recomendado)

### Passo 1: Acessar o API Gateway

1. Faça login no [AWS Console](https://console.aws.amazon.com/)
2. Navegue até **API Gateway**
3. Selecione sua API (a que contém o endpoint `j3fbvjgnok.execute-api.us-east-1.amazonaws.com`)

### Passo 2: Configurar CORS no Resource

1. No painel esquerdo, expanda **Resources**
2. Navegue até o resource `/robot/process` (ou `/robot`)
3. Selecione o método **POST** (ou o método que você está usando)
4. Clique em **Actions** → **Enable CORS**

### Passo 3: Configurar Headers CORS

Na tela de configuração CORS, configure:

**Access-Control-Allow-Origin:**
```
https://plancktech.com.br
```

**Access-Control-Allow-Headers:**
```
Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
```

**Access-Control-Allow-Methods:**
```
POST,OPTIONS
```

**Access-Control-Allow-Credentials:** (opcional, marque se estiver usando cookies)
```
true
```

**Access-Control-Max-Age:** (opcional)
```
3600
```

### Passo 4: Salvar e Deploy

1. Clique em **Enable CORS and replace existing CORS headers**
2. **IMPORTANTE**: Você precisa fazer **Deploy** da API para que as mudanças tenham efeito
3. Vá em **Actions** → **Deploy API**
4. Selecione o stage (provavelmente `prod`)
5. Clique em **Deploy**

### Passo 5: Repetir para o Endpoint Zenvia

Repita os passos 2-4 para o endpoint `/robot/zenvia` (método POST)

---

## 🔧 Método 2: Via AWS CLI (Avançado)

Se você preferir usar a linha de comando:

```bash
# Obter o ID da API
aws apigateway get-rest-apis --query "items[?name=='SuaAPINome'].id" --output text

# Configurar CORS para o resource
aws apigateway put-method-response \
  --rest-api-id j3fbvjgnok \
  --resource-id <RESOURCE_ID> \
  --http-method POST \
  --status-code 200 \
  --response-parameters method.response.header.Access-Control-Allow-Origin=true

# Adicionar header CORS na integração
aws apigateway put-integration-response \
  --rest-api-id j3fbvjgnok \
  --resource-id <RESOURCE_ID> \
  --http-method POST \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'https://plancktech.com.br'"'"'"}'
```

---

## 🎯 Método 3: Configuração Manual de Headers (Alternativa)

Se o método automático não funcionar, você pode configurar manualmente:

### 1. Configurar OPTIONS Method (Preflight)

1. No resource `/robot/process`, crie um método **OPTIONS** se não existir
2. Configure a integração para retornar uma resposta mock:
   - **Integration type**: Mock
   - **Integration Response**: Status 200
   - **Method Response**: Adicione os headers:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Headers`
     - `Access-Control-Allow-Methods`

### 2. Adicionar Headers na Resposta do POST

1. No método **POST** do `/robot/process`
2. Vá em **Method Response**
3. Adicione os headers de resposta:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Allow-Methods`

4. Vá em **Integration Response**
5. Para cada status code (200, 400, 500, etc.), configure:
   - **Header Mappings**:
     ```
     Access-Control-Allow-Origin: 'https://plancktech.com.br'
     Access-Control-Allow-Headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
     Access-Control-Allow-Methods: 'POST,OPTIONS'
     ```

### 3. Deploy

Não esqueça de fazer **Deploy** da API após as mudanças!

---

## ✅ Verificação

Após configurar CORS, teste fazendo uma requisição:

```bash
curl -X OPTIONS https://j3fbvjgnok.execute-api.us-east-1.amazonaws.com/prod/robot/process \
  -H "Origin: https://plancktech.com.br" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Você deve ver os headers CORS na resposta:
```
Access-Control-Allow-Origin: https://plancktech.com.br
Access-Control-Allow-Methods: POST,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,...
```

---

## 🐛 Troubleshooting

### Erro: "No 'Access-Control-Allow-Origin' header"

**Solução:**
- Verifique se você fez **Deploy** da API após configurar CORS
- Verifique se o header está configurado corretamente no Integration Response
- Certifique-se de que o método OPTIONS está configurado para o preflight

### Erro: "Preflight request doesn't pass access control check"

**Solução:**
- Certifique-se de que o método OPTIONS está configurado
- Verifique se os headers permitidos incluem `Authorization` e `Content-Type`
- Verifique se o método POST está na lista de métodos permitidos

### CORS funciona em desenvolvimento mas não em produção

**Solução:**
- Em desenvolvimento, o Vite proxy contorna CORS
- Em produção, você DEVE configurar CORS no API Gateway
- Verifique se o domínio de produção está correto: `https://plancktech.com.br`

---

## 📝 Notas Importantes

1. **Sempre faça Deploy**: Mudanças no API Gateway só têm efeito após fazer Deploy
2. **Método OPTIONS**: O navegador faz uma requisição OPTIONS (preflight) antes do POST
3. **Múltiplos Domínios**: Se precisar permitir múltiplos domínios, você precisará configurar via código Lambda ou usar `*` (menos seguro)
4. **Credenciais**: Se estiver usando cookies ou headers de autenticação, configure `Access-Control-Allow-Credentials: true`

---

## 🔒 Segurança

- **NÃO use `*`** para `Access-Control-Allow-Origin` em produção se estiver enviando credenciais
- Especifique o domínio exato: `https://plancktech.com.br`
- Se precisar de múltiplos domínios, considere usar uma função Lambda para retornar o header dinamicamente

---

**Boa sorte! 🚀**


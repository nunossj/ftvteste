# 🚀 Guia Rápido de Instalação

## Instalação Local

### 1. Instalar Node.js
Se você ainda não tem o Node.js instalado:
- Acesse: https://nodejs.org
- Baixe e instale a versão LTS (recomendada)
- Verifique a instalação:
```bash
node --version
npm --version
```

### 2. Baixar o Projeto
Extraia a pasta `federacao-futebol-virtual` para o seu computador.

### 3. Abrir Terminal
**Windows:**
- Clique com botão direito na pasta do projeto
- Selecione "Abrir no Terminal" ou "Git Bash aqui"

**Mac/Linux:**
- Abra o Terminal
- Navegue até a pasta: `cd caminho/para/federacao-futebol-virtual`

### 4. Instalar Dependências
```bash
npm install
```

**Aguarde** enquanto todas as bibliotecas são baixadas (pode levar alguns minutos).

### 5. Iniciar o Servidor
```bash
npm start
```

Você verá a mensagem:
```
✅ Servidor rodando em http://localhost:3000
📊 Banco de dados inicializado
```

### 6. Acessar o Sistema
Abra seu navegador e acesse:
```
http://localhost:3000
```

### 7. Primeiro Acesso
1. Clique em **"Cadastre-se"**
2. Preencha:
   - Nome completo
   - Selecione uma opção (recomendado: "Outros")
   - Se escolheu "Outros", descreva (ex: "Administrador")
   - Crie uma senha
   - Confirme a senha
3. Clique em **"Cadastrar"**
4. **IMPORTANTE:** Anote o código de 6 dígitos que aparecer
5. Faça login com seu nome e senha

**O primeiro usuário cadastrado é automaticamente ADMINISTRADOR!**

## Parando o Servidor

No terminal onde o servidor está rodando:
- Pressione `Ctrl + C`

## Reiniciando o Servidor

```bash
npm start
```

## Resetando o Banco de Dados

Se quiser recomeçar do zero:
1. Pare o servidor (`Ctrl + C`)
2. Delete o arquivo `server/federacao.db`
3. Reinicie o servidor (`npm start`)

---

## 🌐 Publicar Online (Gratuito)

### Opção 1: Render.com

1. **Criar conta:**
   - Acesse https://render.com
   - Cadastre-se gratuitamente

2. **Criar repositório GitHub:**
   - Crie uma conta no https://github.com
   - Crie um novo repositório
   - Faça upload da pasta do projeto

3. **Deploy no Render:**
   - No Render, clique em "New +"
   - Selecione "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name:** nome-da-sua-federacao
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Clique em "Create Web Service"

4. **Aguarde o deploy** (3-5 minutos)
5. Você receberá um link público: `https://nome-da-sua-federacao.onrender.com`

### Opção 2: Railway.app

1. Acesse https://railway.app
2. Cadastre-se gratuitamente
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Conecte seu repositório
6. Railway detectará automaticamente e fará o deploy

### Opção 3: Glitch.com

1. Acesse https://glitch.com
2. Clique em "New Project" → "Import from GitHub"
3. Cole a URL do seu repositório
4. Aguarde o deploy

---

## ❓ Problemas Comuns

### "npm não é reconhecido"
➡️ Node.js não está instalado. Volte ao passo 1.

### "Porta 3000 já está em uso"
➡️ Abra `server/server.js` e mude a linha 16:
```javascript
const PORT = process.env.PORT || 3001;
```

### "Cannot find module"
➡️ Execute novamente:
```bash
npm install
```

### "Permission denied"
➡️ No Mac/Linux, tente:
```bash
sudo npm install
```

### Página não carrega
➡️ Verifique se:
- O servidor está rodando
- Você está acessando `http://localhost:3000`
- Não há firewall bloqueando

---

## 📞 Precisa de Ajuda?

Instagram: [@cbffvirtuall](https://www.instagram.com/cbffvirtuall)

**Boa sorte com sua Federação de Futebol Virtual! ⚽🎮**

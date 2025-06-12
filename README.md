# 🤖 Automação de Respostas no Twitter via Playwright

Bot em Node.js que acessa uma lista de links para responder tweets no formato:

https://twitter.com/intent/tweet?in_reply_to={tweet_id}&text={mensagem}



## 🚀 Instalação

1. **Clone o projeto:**

```bash
git clone https://github.com/oigorholanda/automacao-playwright-twitter.git
cd automacao-playwright-twitter
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure o .env:**

Crie um arquivo .env com:

```bash
TWITTER_USER=seu_email
TWITTER_PASS=sua_senha
GOOGLE_SHEET_ID=ID_da_sua_planilha
```

4. **Adicione o credentials.json do Google (OAuth):**

Siga este guia e baixe seu credentials.json.

▶️ Execução
```bash
node bot.js
```

O script:

Lê os links da planilha do Google Sheets.

Acessa os links de resposta do Twitter com Playwright.

Responde ao tweet de forma humanizada.

Marca cada link como “Respondido via Playwright” na planilha.

🛠️ Decisões Técnicas
Playwright: para controlar o navegador e simular ações humanas.

Google Sheets API: como fonte de dados e persistência de status.

Delays aleatórios: evitam comportamento robótico.

Execução serial + tolerância a falhas: cada tweet é tratado individualmente com try/catch.

Feito com ☕ por @oigorholanda
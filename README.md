# 🤖 Automação de Respostas no Twitter via Playwright

Bot em Node.js que acessa uma lista de links para responder tweets no formato:

```
https://twitter.com/intent/tweet?in_reply_to={tweet_id}&text={mensagem}
```



## Instalação

1. **Clone o projeto:**

    ```bash
    git clone https://github.com/oigorholanda/automacao-playwright-twitter.git
    cd automacao-playwright-twitter
    ```

2. **Instale as dependências:**

    ```js
    npm install
    ```

3. **Configure o .env:**

    Crie um arquivo .env com:

    ```bash
    TWITTER_USER=seu_email
    TWITTER_PASS=sua_senha
    GOOGLE_SHEET_ID=ID_da_sua_planilha
    ```

4. **Baixe e salve o `credentials.json` do Google na raiz do projeto**

    [Guia oficial para gerar](https://developers.google.com/sheets/api/quickstart/nodejs)

## ▶️ Execução
```bash
node tweet-reply.js
```

O script:

- Lê os links da planilha do Google Sheets que não estão marcados como respondidos.

- Acessa os links de resposta do Twitter com Playwright.

- Responde ao tweet de forma humanizada.

- Marca cada link como “Respondido via Playwright” na planilha.


## 🛠️ Decisões Técnicas
✅ **Playwright**: browser control realista para simular um humano  
✅ **Google Sheets API**: persistência de status e lista dinâmica de links  
✅ **Delays aleatórios**: simula pausas humanas entre ações  
✅ **Execução sequencial**: evita problemas de login/sessão  
✅ **Fail-safe**: links com erro são ignorados, sem parar o fluxo

---
<br>

Feito por [@oigorholanda](https://github.com/oigorholanda)
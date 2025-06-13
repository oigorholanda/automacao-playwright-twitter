const { TwitterApi } = require('twitter-api-v2');
// Importa a biblioteca TwitterApi para interagir com a API do Twitter
// Certifique-se de instalar a biblioteca com: npm install twitter-api-v2


// Credenciais obtidas no portal de desenvolvedores ao criar um app no developer.twitter.com
const client = new TwitterApi({
  appKey: 'SUA_API_KEY',
  appSecret: 'SUA_API_SECRET',
  accessToken: 'SEU_ACCESS_TOKEN',
  accessSecret: 'SEU_ACCESS_TOKEN_SECRET',
});

// Função para postar uma resposta
async function postReply(tweetId, replyText) {
  try {
    const response = await client.v2.tweet(replyText, {
      reply: {
        in_reply_to_tweet_id: tweetId,
      },
    });
    console.log('Resposta postada com sucesso!', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao postar a resposta:', error);
    throw error;
  }
}

// Exemplo de uso com um ID e mensagem de resposta
const tweetIdToReply = '1234567890123456789'; 
const replyMessage = 'Olá, esta é minha resposta!';

postReply(tweetIdToReply, replyMessage);

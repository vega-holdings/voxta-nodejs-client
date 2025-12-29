import readline from 'node:readline/promises';

import { VoxtaClient, createBearerHeaders } from '../dist/index.js';

const baseUrl = process.env.VOXTA_URL ?? 'http://127.0.0.1:5384';
const apiKey = process.env.VOXTA_API_KEY;
const chatId = process.env.VOXTA_CHAT_ID;

if (!chatId) throw new Error('Missing VOXTA_CHAT_ID (GUID)');

const client = new VoxtaClient({
  baseUrl,
  headers: apiKey ? createBearerHeaders(apiKey) : undefined,
  authenticate: { client: 'voxta-nodejs-client', clientVersion: '0.1.0' },
});

let activeReplyMessageId = null;

client.on('message', (m) => {
  switch (m.$type) {
    case 'replyStart':
      activeReplyMessageId = m.messageId;
      process.stdout.write('\nassistant> ');
      break;
    case 'replyChunk':
      if (activeReplyMessageId && m.messageId !== activeReplyMessageId) {
        activeReplyMessageId = m.messageId;
        process.stdout.write('\nassistant> ');
      }
      process.stdout.write(m.text);
      break;
    case 'replyEnd':
      if (activeReplyMessageId === m.messageId) activeReplyMessageId = null;
      process.stdout.write('\n');
      break;
  }
});

await client.connectAndAuthenticate();
const started = await client.resumeChatAndWait({ chatId });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
while (true) {
  const text = await rl.question('you> ');
  if (!text.trim() || text.trim() === '/exit') break;
  await client.sendText(started.sessionId, text, { doReply: true, doCharacterActionInference: true });
}

rl.close();
await client.disconnect();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import dns from 'node:dns/promises';

import { recordShortUrlClick } from './src/dao/shortUrl.js';

async function run() {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const req = {
    cookies: {},
    headers: {},
    ip: '127.0.0.1',
    get: (key) => ''
  };
  const res = {
    cookie: (k, v, o) => { console.log(`Set cookie ${k}=${v}`); }
  };
  
  try {
    const url = await recordShortUrlClick('DQb3fG-', req, res);
    console.log(`Redirect URL: ${url}`);
  } catch (err) {
    console.error('Error in recordShortUrlClick:', err);
  }
  
  process.exit(0);
}
run();

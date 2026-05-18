import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import urlSchema from './src/models/shorturl.model.js';
import dns from 'node:dns/promises';

async function run() {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const links = await urlSchema.find().sort({ createdAt: -1 }).limit(10);
  for (const link of links) {
    console.log(`Short: ${link.shortUrl}, Clicks: ${link.clicks}`);
  }
  
  process.exit(0);
}
run();

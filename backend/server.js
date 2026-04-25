import 'dotenv/config'; // Modern way to load env vars
import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import userRoute from '../routes/user.route.js';
import generatorRoute from '../routes/generator.route.js';
import partRoute from '../routes/part.route.js';

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  console.log("Using Auth Emulator: 127.0.0.1:9099");
}

const PORT = process.env.PORT || 3000
const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(readFileSync(`${__dirname}/serviceAccountKey.json`, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("Firebase Admin Initialized successfully.");
app.use(cors()); // Enable CORS for all routes
app.use(express.json());                 // Enable JSON body parsing
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', require('./routes/user.route'));
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory at:", uploadDir);
}

app.use('/', express.static(path.join(__dirname, '/public')))   //allow app use use resources from public folder

app.use('/api/generators', require('./routes/generator.route'));
app.use('/api/parts', require('./routes/part.route'));

app.get("/", (req, res) => {                                     //when someone visits, respond with testing quote
  res.send("Server is ready");
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  //start server and listen on port
app.use((req, res) => res.status(404).json({ error: '404 Not Found' }));    //catch 404 issues

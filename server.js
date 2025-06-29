require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false
}));

// --- Discord OAuth2 ---
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.OAUTH_CALLBACK_URL;

app.get('/login', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const data = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    scope: 'identify'
  });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const tokenJson = await tokenRes.json();
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const user = await userRes.json();
  req.session.user = user;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// --- API ---
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  const { username, discriminator, avatar, id } = req.session.user;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
  res.json({ username: `${username}#${discriminator}`, avatar: avatarUrl });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Online ✅' });
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: ['Bot started.', 'Listening on commands.', 'No errors so far.'] });
});

app.get('/api/ping', (req, res) => {
  res.json({ pong: 'Pong!' });
});

app.post('/api/say', (req, res) => {
  const msg = req.body.message;
  console.log(`Bot would say: ${msg}`);
  res.json({ ok: true });
});

app.post('/api/settings', (req, res) => {
  const prefix = req.body.prefix;
  console.log(`Prefix updated to: ${prefix}`);
  res.json({ ok: true });
});

app.get('/api/restart', (req, res) => {
  console.log('Bot restart command received.');
  res.json({ ok: true });
});

// --- Start ---
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
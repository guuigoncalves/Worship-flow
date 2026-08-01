/**
 * Proxy de Camada Privada — server/proxy.js
 *
 * Servidor Node.js (Express) que valida tokens Firebase Auth e encaminha
 * chamadas para o Navidrome (Subsonic API) e Frigate (API REST).
 *
 * Dependências (instalar separadamente em package.json do servidor):
 *   npm install express firebase-admin
 *
 * Variáveis de ambiente:
 *   GOOGLE_APPLICATION_CREDENTIALS      — path para service-account JSON
 *   PRIVADO_ALLOWLIST                   — UIDs separados por vírgula
 *   NAVIDROME_URL                       — ex: http://localhost:4533
 *   FRIGATE_URL                         — ex: http://localhost:5000
 *   PORT                                — porta do proxy (default: 3001)
 *
 * Rodar:  node server/proxy.js
 *
 * Rotas:
 *   GET /navidrome/*   →  encaminha para NAVIDROME_URL (áudio + API Subsonic)
 *   GET /frigate/*     →  encaminha para FRIGATE_URL   (vídeo + API)
 *   GET /health        →  healthcheck
 *
 * Todas as rotas (/navidrome/* e /frigate/*) exigem Authorization: Bearer <idToken>
 * e o UID deve constar na ALLOWLIST. O status de aprovação NUNCA é definido
 * como "aprovada" automaticamente — a coleção /comunidade exige moderação humana.
 */
const express = require('express');
const admin = require('firebase-admin');
const http = require('http');
const { URL } = require('url');

const serviceAccount = require(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  require('path').resolve(__dirname, '../firebase-adminsdk.json')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWLIST = (process.env.PRIVADO_ALLOWLIST || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const NAVIDROME_URL = process.env.NAVIDROME_URL || 'http://localhost:4533';
const FRIGATE_URL = process.env.FRIGATE_URL || 'http://localhost:5000';

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function checkAllowlist(req, res, next) {
  if (!ALLOWLIST.includes(req.uid)) {
    return res.status(403).json({ error: 'Acesso restrito' });
  }
  next();
}

function proxyRequest(targetBase, req, res) {
  const cleanPath = req.url.replace(/^\/navidrome\//, '').replace(/^\/frigate\//, '');
  const targetUrl = new URL(targetBase + '/' + cleanPath);
  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });
  req.pipe(proxyReq);
  proxyReq.on('error', (err) => {
    res.status(502).json({ error: 'Erro no proxy', detail: err.message });
  });
}

app.all('/navidrome/*', verifyToken, checkAllowlist, (req, res) => {
  proxyRequest(NAVIDROME_URL, req, res);
});

app.all('/frigate/*', verifyToken, checkAllowlist, (req, res) => {
  proxyRequest(FRIGATE_URL, req, res);
});

app.get('/health', (req, res) => res.json({ status: 'ok', allowlist: ALLOWLIST.length }));

app.listen(PORT, () => {
  console.log(`[proxy] Camada Privada rodando na porta ${PORT}`);
  console.log(`[proxy] Allowlist: ${ALLOWLIST.join(', ') || '(vazia)'}`);
  console.log(`[proxy] Navidrome → ${NAVIDROME_URL}`);
  console.log(`[proxy] Frigate   → ${FRIGATE_URL}`);
});

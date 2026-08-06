import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

const ALLOWED_ORIGINS = [
  'https://worship-flow-jade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.options('*', cors());

const navidromeUrl = process.env.NAVIDROME_URL || 'http://localhost:4533';

app.use('/proxy', createProxyMiddleware({
  target: navidromeUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '',
  },
  onProxyRes: (proxyRes, req) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers?.origin || '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server rodando na porta ${PORT}`);
});
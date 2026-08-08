import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo-worshipflow.png';

export default function Login() {
  const navigate = useNavigate();
  const { signInGoogle, signInEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modoEmail, setModoEmail] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await signInEmail(email, senha);
      navigate('/');
    } catch {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await signInGoogle();
      navigate('/');
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 grid grid-cols-1 lg:grid-cols-2 overflow-y-auto" style={{ backgroundColor: '#0B0C10' }}>
      {/* Coluna Esquerda: Formulário */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 space-y-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Header Marca */}
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={logo} alt="WorshipFlow" style={{ height: '48px', width: 'auto', display: 'block' }} className="mb-1" />
            <h1 className="text-xl font-bold text-white">Bem-vindo de volta!</h1>
            <p className="text-xs text-white/40">Faça login para continuar</p>
          </div>

          {/* Botão Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entrar com Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-white/30">
              <span className="bg-[#0B0C10] px-3">ou</span>
            </div>
          </div>

          {!modoEmail ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setModoEmail(true)}
                className="w-full py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                <span>Entrar com e-mail</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-2xl bg-[#141522]/80 hover:bg-[#141522] text-white/70 font-semibold text-xs border border-white/10 transition-all"
              >
                Criar conta
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-medium text-white/60 block mb-1.5" htmlFor="email">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#141522]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/60 block mb-1.5" htmlFor="senha">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141522]/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button type="button" onClick={() => setModoEmail(false)} className="text-white/40 hover:underline">
                  Voltar às opções
                </button>
                <button type="button" onClick={() => navigate('/')} className="text-purple-400 hover:underline">
                  Criar conta
                </button>
              </div>
            </form>
          )}

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-white/30">
              <span className="bg-[#0B0C10] px-3">ou</span>
            </div>
          </div>

          {/* Continuar como visitante */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <User size={16} />
            <span>Continuar como visitante</span>
          </button>

          <p className="text-[10px] text-center text-white/30 leading-relaxed pt-2">
            Ao continuar, você concorda com nossos <br />
            <a href="#" className="underline hover:text-white/50">Termos de Uso</a> e <a href="#" className="underline hover:text-white/50">Política de Privacidade</a>
          </p>
        </div>
      </div>

      {/* Coluna Direita: Display Visual Hero (Desktop) */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-900/30 via-indigo-950/40 to-[#0B0C10] border-l border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md">
          <div className="p-4 rounded-3xl bg-purple-600/20 text-purple-400 border border-purple-500/30 animate-pulse">
            <Activity size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">WorshipFlow</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Sua música. <br />
            Seu ministério. <br />
            Em qualquer lugar.
          </p>
        </div>
      </div>
    </main>
  );
}
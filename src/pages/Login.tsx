import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signInGoogle, signInEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: '#0B0C10' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] shadow-[0_0_30px_rgba(108,92,231,0.3)]">
            <span className="text-2xl font-bold text-fundo">W</span>
          </div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-gradient text-center">WorshipFlow</h1>
          <p className="text-center text-xs text-white/40">Sua música. Seu ministério. Em qualquer lugar.</p>
        </div>

        <form className="card p-6 space-y-4 border border-white/10" onSubmit={handleSubmit}>
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
                className="w-full bg-[#141522]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 transition-all"
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
                className="w-full bg-[#141522]/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 transition-all"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-sm font-bold"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="flex items-center justify-between text-xs">
            <Link to="/" className="text-white/40 hover:text-white/60 transition-colors">Esqueceu a senha?</Link>
            <Link to="/" className="text-[var(--primaria)] hover:text-[var(--acento)] transition-colors">Criar conta</Link>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center">
            <span className="bg-[#0B0C10] px-3 text-[10px] text-white/30 uppercase tracking-wider">ou</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-ghost w-full py-3 text-sm font-medium flex items-center justify-center gap-2 border border-white/10"
          onClick={() => void signInGoogle()}
        >
          <Globe size={18} />
          Continuar com Google
        </button>
      </div>
    </main>
  );
}
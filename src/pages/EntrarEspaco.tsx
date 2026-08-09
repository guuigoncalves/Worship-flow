import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react';
import { useEspacos } from '../hooks/useEspacos';

export default function EntrarEspaco() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { entrarComCodigo } = useEspacos();
  const [status, setStatus] = useState<'entrando' | 'erro' | 'ok'>('entrando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!codigo) return;
    entrarComCodigo(codigo)
      .then((espaco) => {
        setStatus('ok');
        setTimeout(() => navigate(`/espaco/${espaco.id}`), 900);
      })
      .catch((err: unknown) => {
        setStatus('erro');
        setMensagem(err instanceof Error ? err.message : 'Não foi possível entrar.');
      });
  }, [codigo, entrarComCodigo, navigate]);

  return (
    <main className="app-page min-h-[80vh] flex items-center justify-center p-4 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <section className="card w-full max-w-md p-6 text-center space-y-5 border border-white/10 bg-[#141522]/90 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
          <Users size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Entrar no Espaço</h1>
          <p className="mt-1 text-xs text-white/50">
            Código: <span className="font-mono font-bold text-purple-300 tracking-wider uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{codigo}</span>
          </p>
        </div>

        {status === 'entrando' && (
          <div className="py-4 flex items-center justify-center gap-3 text-xs text-white/60">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span>Validando código e entrando no espaço…</span>
          </div>
        )}

        {status === 'ok' && (
          <div className="py-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle size={18} />
            <span>Sucesso! Redirecionando para o espaço…</span>
          </div>
        )}

        {status === 'erro' && (
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <XCircle size={18} className="shrink-0" />
              <span>{mensagem}</span>
            </div>
            <button
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all"
              type="button"
              onClick={() => navigate('/espacos')}
            >
              <ArrowLeft size={16} />
              <span>Voltar para meus espaços</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}


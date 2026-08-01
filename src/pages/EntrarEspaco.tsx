import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useEspacos } from '../hooks/useEspacos';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

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
    <main className="app-page grid place-items-center fade-in">
      <section className="card max-w-md p-6 text-center">
        <h1 className="font-display text-3xl font-bold text-gradient">Entrar no espaço</h1>
        <p className="mt-2 text-textoSecundario">
          Código: <span className="font-mono text-primaria">{codigo}</span>
        </p>

        {status === 'entrando' ? (
          <div className="mt-6 flex items-center justify-center gap-3 text-textoSecundario">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primaria border-t-transparent" />
            <span>Entrando…</span>
          </div>
        ) : null}

        {status === 'ok' ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sucesso">
            <CheckCircle className="h-5 w-5" />
            <span>Pronto! Redirecionando…</span>
          </div>
        ) : null}

        {status === 'erro' ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-perigo">
            <XCircle className="h-5 w-5" />
            <span>{mensagem}</span>
          </div>
        ) : null}

        {status === 'erro' && (
          <button className="mt-4 btn-ghost text-xs" type="button" onClick={() => navigate('/espacos')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para meus espaços
          </button>
        )}
      </section>
    </main>
  );
}

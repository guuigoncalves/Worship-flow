import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, LogIn, Plus, Users, ChevronRight } from 'lucide-react';
import { Header } from '../components/aurora';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

import { useEspacos } from '../hooks/useEspacos';
import { useToast } from '../hooks/useToast';
import type { Espaco } from '../types';

const nomesPapel: Record<string, string> = { dono: 'Dono', admin: 'Admin', editor: 'Editor', leitor: 'Leitor' };

const corPapel: Record<string, string> = {
  dono: 'rgba(228,180,41,0.2)',
  admin: 'rgba(162,89,255,0.2)',
  editor: 'rgba(91,141,239,0.2)',
  leitor: 'rgba(255,255,255,0.08)',
};
const textoPapel: Record<string, string> = {
  dono: '#E4B429',
  admin: '#A259FF',
  editor: '#5B8DEF',
  leitor: 'rgba(255,255,255,0.5)',
};

export default function Espacos() {
  const { espacos, loading, criarEspaco, entrarComCodigo } = useEspacos();
  const { showToast } = useToast();
  const [criarAberto, setCriarAberto] = useState(false);
  const [entrarAberto, setEntrarAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Espaco['tipo']>('ministerio');
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onCriar() {
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      await criarEspaco(nome.trim(), tipo);
      setCriarAberto(false);
      setNome('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não deu pra criar o espaço', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function onEntrar() {
    if (!codigo.trim()) return;
    setEnviando(true);
    try {
      await entrarComCodigo(codigo);
      setEntrarAberto(false);
      setCodigo('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não deu pra entrar no espaço', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="app-page fade-in space-y-5 pb-32" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header Aurora */}
      <Header subtitulo="Colaboração e Ministério" />

      <div className="flex items-center justify-between gap-3 pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">Meus Espaços</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
            type="button"
            onClick={() => setEntrarAberto(true)}
          >
            <LogIn className="h-3.5 w-3.5" />
            Entrar com código
          </button>
          <button
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-xs font-bold text-fundo shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all flex items-center gap-1.5"
            type="button"
            onClick={() => setCriarAberto(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Criar Espaço
          </button>
        </div>
      </div>

      {/* Lista de espaços */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: '#A259FF', borderTopColor: 'transparent' }} />
        </div>
      ) : espacos.length > 0 ? (
        <div className="space-y-3">
          {espacos.map((espaco) => (
            <Link
              key={espaco.id}
              className="card group flex items-center gap-4 p-4 no-underline"
              to={`/espaco/${espaco.id}`}
            >
              {/* Ícone */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(162,89,255,0.15)', border: '1px solid rgba(162,89,255,0.25)' }}
              >
                <Users className="h-6 w-6" style={{ color: '#A259FF' }} aria-hidden="true" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold truncate">{espaco.nome}</h2>
                <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{espaco.tipo}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: corPapel[espaco.papel] || 'rgba(255,255,255,0.08)', color: textoPapel[espaco.papel] || 'rgba(255,255,255,0.5)' }}
                  >
                    {nomesPapel[espaco.papel] || espaco.papel}
                  </span>
                </div>
              </div>

              {/* Código + seta */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono uppercase tracking-widest transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void navigator.clipboard?.writeText(espaco.codigo);
                    showToast('Código copiado', 'sucesso');
                  }}
                  aria-label={`Copiar código ${espaco.codigo}`}
                >
                  <Copy className="h-3 w-3" />
                  {espaco.codigo}
                </button>
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.25)' }} className="group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum espaço ainda"
          texto="Crie um espaço pra colaborar com sua equipe, ou entre com um código de convite."
        />
      )}

      {/* Painel criar */}
      <PainelDeslizante aberto={criarAberto} titulo="Criar espaço" onClose={() => setCriarAberto(false)}>
        <div className="space-y-3">
          <input className="input" placeholder="Nome do espaço" value={nome} onChange={(event) => setNome(event.target.value)} autoFocus />
          <select className="input" value={tipo} onChange={(event) => setTipo(event.target.value as Espaco['tipo'])}>
            <option value="ministerio">Ministério</option>
            <option value="banda">Banda</option>
            <option value="estudo">Estudo</option>
            <option value="outro">Outro</option>
          </select>
          <button className="btn-primary w-full" type="button" disabled={enviando || !nome.trim()} onClick={() => void onCriar()}>
            {enviando ? 'Criando…' : 'Criar espaço'}
          </button>
        </div>
      </PainelDeslizante>

      {/* Painel entrar */}
      <PainelDeslizante aberto={entrarAberto} titulo="Entrar com código" onClose={() => setEntrarAberto(false)}>
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Digite o código de 6 caracteres fornecido pelo administrador do espaço.
          </p>
          <input
            className="input font-mono text-center text-lg uppercase tracking-widest"
            placeholder="XXXXXX"
            maxLength={6}
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.toUpperCase())}
            autoFocus
          />
          <button className="btn-primary w-full" type="button" disabled={enviando || codigo.length < 6} onClick={() => void onEntrar()}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </PainelDeslizante>
    </main>
  );
}

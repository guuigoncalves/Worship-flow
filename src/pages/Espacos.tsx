import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, LogIn, Plus, Users } from 'lucide-react';
import { SectionHeader } from '../components/aurora';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useEspacos } from '../hooks/useEspacos';
import { useToast } from '../hooks/useToast';
import type { Espaco } from '../types';

const nomesPapel: Record<string, string> = { dono: 'Dono', admin: 'Admin', editor: 'Editor', leitor: 'Leitor' };

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
    <main className="app-page fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-display text-3xl font-bold text-gradient">Meus Espaços</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" type="button" onClick={() => setEntrarAberto(true)}>
            <LogIn className="h-4 w-4" />
            Entrar com código
          </button>
          <button className="btn-primary" type="button" onClick={() => setCriarAberto(true)}>
            <Plus className="h-4 w-4" />
            Criar
          </button>
        </div>
      </div>

      <SectionHeader icone={<Users size={16} />} titulo="Seus espaços" />

      {loading ? (
        <p className="mt-6 text-textoSecundario">Carregando…</p>
      ) : espacos.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {espacos.map((espaco) => (
            <Link key={espaco.id} className="card p-5" to={`/espaco/${espaco.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaria/15 text-primaria">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <button
                    className="btn-text text-xs"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void navigator.clipboard?.writeText(espaco.codigo);
                      showToast('Código copiado', 'sucesso');
                    }}
                    aria-label={`Copiar código ${espaco.codigo}`}
                    title={`Copiar código ${espaco.codigo}`}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="font-mono uppercase tracking-widest">{espaco.codigo}</span>
                  </button>
                </div>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">{espaco.nome}</h2>
              <p className="text-sm text-textoSecundario capitalize">{espaco.tipo}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="chip chip-active">{nomesPapel[espaco.papel]}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EstadoVazio titulo="Nenhum espaço ainda" texto="Crie um espaço pra colaborar com sua equipe, ou entre com um código de convite." />
        </div>
      )}

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

      <PainelDeslizante aberto={entrarAberto} titulo="Entrar com código" onClose={() => setEntrarAberto(false)}>
        <div className="space-y-3">
          <input
            className="input font-mono uppercase tracking-widest"
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

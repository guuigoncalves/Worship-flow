import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Globe, Loader2, Music, Plus, Search } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useComunidade } from '../hooks/useComunidade';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';

type AbaAtiva = 'para-voce' | 'recentes';

export const Comunidade: React.FC = () => {
  const navigate = useNavigate();
  const { musicas, loading: loadingComunidade } = useComunidade();
  const { salvarMusica } = useMusicas();
  const { showToast } = useToast();
  const [consulta, setConsulta] = useState('');
  const [salvandoIds, setSalvandoIds] = useState<Set<string>>(new Set());
  const [aba, setAba] = useState<AbaAtiva>('para-voce');

  const resultados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    let lista = q
      ? musicas.filter(
          (musica) =>
            musica.titulo.toLowerCase().includes(q) ||
            musica.artista.toLowerCase().includes(q) ||
            musica.tags.some((tag) => tag.includes(q as never))
        )
      : musicas;

    if (aba === 'recentes') {
      lista = [...lista].sort((a, b) => (b as any).enviadaEm?.localeCompare?.((a as any).enviadaEm ?? '') ?? 0);
    }

    return lista;
  }, [musicas, consulta, aba]);

  async function adicionarBiblioteca(musicaId: string) {
    const musica = musicas.find((m) => m.id === musicaId);
    if (!musica) return;
    setSalvandoIds((prev) => new Set([...prev, musicaId]));
    try {
      await salvarMusica({
        titulo: musica.titulo,
        artista: musica.artista,
        tom: musica.tom,
        letra: musica.letra,
        tags: musica.tags,
        dificuldade: musica.dificuldade,
      });
      showToast('Adicionada à sua biblioteca!', 'sucesso');
    } catch {
      showToast('Não foi possível adicionar. Tente novamente.', 'erro');
    } finally {
      setSalvandoIds((prev) => {
        const copy = new Set(prev);
        copy.delete(musicaId);
        return copy;
      });
    }
  }

  function baixarCifra(musica: { titulo: string; letra: string }) {
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(musica.letra)}`;
    link.download = `${musica.titulo}.txt`;
    link.click();
  }

  const loading = loadingComunidade;

  return (
    <div className="app-page space-y-5 pb-24 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Globe size={20} style={{ color: '#A259FF' }} />
          <h1 className="text-2xl font-bold text-gradient">Comunidade</h1>
        </div>
      </div>

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Cifras aprovadas pela comunidade — adicione à sua biblioteca e leve ao vivo.
      </p>

      {/* Abas */}
      <div className="flex gap-2">
        {(['para-voce', 'recentes'] as AbaAtiva[]).map((a) => (
          <button
            key={a}
            type="button"
            className={`chip text-sm ${aba === a ? 'chip-active' : ''}`}
            onClick={() => setAba(a)}
          >
            {a === 'para-voce' ? 'Para você' : 'Recentes'}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={16}
          style={{ color: 'rgba(162,89,255,0.7)' }}
        />
        <input
          className="input pl-11 text-sm"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar por título, artista ou tag…"
          style={{ background: 'rgba(162,89,255,0.05)', borderColor: 'rgba(162,89,255,0.2)' }}
        />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="card p-8 flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: '#A259FF' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Carregando cifras da comunidade…</p>
        </div>
      ) : resultados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma cifra na comunidade"
          texto="Compartilhe suas cifras aprovadas na comunidade. Quando houver músicas aprovadas, aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {/* Cifras públicas em destaque */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music size={14} style={{ color: '#A259FF' }} />
              <span className="text-sm font-semibold">Cifras públicas em destaque</span>
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {resultados.length} disponível{resultados.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {resultados.map((musica) => (
              <article key={musica.id} className="card flex items-center gap-3 p-3">
                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-sm">{musica.titulo}</h2>
                  <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {musica.artista}
                  </p>
                  {musica.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {musica.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-0.5 text-[10px]"
                          style={{ background: 'rgba(162,89,255,0.12)', color: 'rgba(162,89,255,0.9)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badge tom */}
                <span
                  className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(162,89,255,0.15)', color: '#A259FF', border: '1px solid rgba(162,89,255,0.3)' }}
                >
                  {musica.tom}
                </span>

                {/* Ações */}
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onClick={() => baixarCifra(musica)}
                    aria-label="Baixar cifra"
                    title="Baixar cifra"
                  >
                    <Download className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{
                      background: salvandoIds.has(musica.id) ? 'rgba(162,89,255,0.08)' : 'rgba(162,89,255,0.18)',
                      border: '1px solid rgba(162,89,255,0.3)',
                      color: '#A259FF',
                    }}
                    disabled={salvandoIds.has(musica.id)}
                    onClick={() => void adicionarBiblioteca(musica.id)}
                    aria-label="Adicionar à biblioteca"
                    title="Adicionar à biblioteca"
                  >
                    {salvandoIds.has(musica.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Banner de convite */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(162,89,255,0.06)', border: '1px solid rgba(162,89,255,0.15)' }}
          >
            <p className="text-sm font-semibold">Compartilhe sua música!</p>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Envie suas cifras e playlists para alcançar outros músicos e ministérios.
            </p>
            <button
              className="btn-ghost mt-3 py-2 px-4 text-xs"
              onClick={() => navigate('/editor')}
            >
              Enviar agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comunidade;

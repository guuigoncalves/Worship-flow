import { useParams, useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Disc, Play, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';

export default function Album() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { musicas, loading } = useMusicas();
  const { tocar } = usePlayer();

  const nomeArtista = id ? decodeURIComponent(id) : '';

  const musicasDoAlbum = useMemo(() => {
    return musicas.filter((m) => (m.artista || 'Sem Artista') === nomeArtista);
  }, [musicas, nomeArtista]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (musicasDoAlbum.length === 0) {
    return (
      <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
        <header className="flex items-center gap-3 pt-1">
          <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate('/albuns')} aria-label="Voltar">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gradient">Álbum</h1>
        </header>
        <EstadoVazio
          titulo="Álbum não encontrado"
          texto="Não foram encontradas músicas registradas para este álbum."
        />
      </main>
    );
  }

  const primeira = musicasDoAlbum[0];
  const totalDuracao = musicasDoAlbum.length;
  const duracaoFormatada = `${totalDuracao} faixas`;

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center gap-3 pt-1">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate('/albuns')} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gradient truncate">{`Coletânea ${nomeArtista}`}</h1>
      </header>

      <div className="card p-6 bg-[var(--primaria-dim)] border border-[var(--borda)] flex flex-col items-center gap-4 text-center">
        <CapaMusica
          tom={primeira.tom}
          titulo={`Coletânea ${nomeArtista}`}
          tamanho="lg"
          className="w-28 h-28 text-2xl shadow-lg shadow-purple-900/30"
        />
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-[var(--primaria)] tracking-wider">Álbum Virtual</p>
          <h2 className="text-lg font-bold text-white">{`Coletânea ${nomeArtista}`}</h2>
          <p className="text-xs text-white/60">{nomeArtista} · {musicasDoAlbum.length} {musicasDoAlbum.length === 1 ? 'música' : 'músicas'} · {duracaoFormatada} min</p>
        </div>
        <button
          onClick={() => tocar(primeira)}
          className="btn-primary py-3 px-6 text-xs flex items-center gap-2 shrink-0"
        >
          <Play size={16} />
          <span>Tocar Tudo</span>
        </button>
      </div>

      <div>
        <SectionHeader icone={<Disc size={16} />} titulo={`Faixas (${musicasDoAlbum.length})`} />
        <div className="card divide-y divide-white/5">
          {musicasDoAlbum.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => tocar(m)}
              className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-white/40 w-5 text-center shrink-0">{idx + 1}</span>
                <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{m.titulo}</p>
                  <p className="text-[10px] text-white/50 truncate">{m.artista || 'Artista'}</p>
                </div>
              </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tocar(m);
                    }}
                    className="p-2 rounded-lg bg-[var(--primaria-dim)] hover:bg-[var(--primaria)]/30 text-[var(--primaria)] hover:text-white transition-colors"
                    title="Tocar"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors" title="Opções">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
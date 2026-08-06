import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Disc, Search, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

export default function Albuns() {
  const navigate = useNavigate();
  const { musicas, loading } = useMusicas();

  const albuns = useMemo(() => {
    const mapa = new Map<string, typeof musicas>();
    musicas.forEach((m) => {
      const chave = m.artista || 'Sem Artista';
      const lista = mapa.get(chave) || [];
      lista.push(m);
      mapa.set(chave, lista);
    });
    return Array.from(mapa.entries()).map(([artista, lista]) => ({
      id: encodeURIComponent(artista),
      nome: `Coletânea ${artista}`,
      artista,
      totalMusicas: lista.length,
      primeiraMusica: lista[0],
    }));
  }, [musicas]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center justify-between pt-1">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gradient">Álbuns</h1>
        <button className="btn-ghost h-9 w-9 p-0" type="button" aria-label="Buscar" onClick={() => navigate('/busca-rapida')}>
          <Search size={18} />
        </button>
      </header>

      {albuns.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum álbum disponível"
          texto="Cadastre músicas com artistas definidos para gerar suas coletâneas."
        />
      ) : (
        <div className="space-y-3">
          {albuns.map((alb) => (
            <div
              key={alb.id}
              onClick={() => navigate(`/album/${alb.id}`)}
              className="card flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-all border border-white/10 rounded-2xl group"
            >
              <CapaMusica
                tom={alb.primeiraMusica?.tom}
                titulo={alb.nome}
                tamanho="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">
                  {alb.nome}
                </p>
                <p className="text-xs text-white/50 truncate">{alb.artista}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-mono text-white/40">{alb.totalMusicas}</p>
                <p className="text-[10px] text-white/30">{alb.totalMusicas === 1 ? 'faixa' : 'faixas'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Award, BookOpen, ListMusic, Heart, Settings, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useMusicas } from '../hooks/useMusicas';
import { usePlaylists } from '../hooks/usePlaylists';
import { useHistorico } from '../hooks/useHistorico';
import { useCamadaPrivada } from '../hooks/useCamadaPrivada';
import { Avatar, CapaMusica, Header } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

export default function Perfil() {
  const navigate = useNavigate();
  const { perfilUsuario, user } = useAuth();
  const { perfil } = usePerfil();
  const { musicas } = useMusicas();
  const { playlists } = usePlaylists();
  const { recentes } = useHistorico();
  const { autorizado: autorizadoCamadaPrivada } = useCamadaPrivada();

  const primeiroNome = perfilUsuario?.nome || user?.displayName || 'Músico';
  const handle = perfilUsuario?.nome ? `@${perfilUsuario.nome.toLowerCase().replace(/\s+/g, '')}` : '@musico';
  const funcao = perfil.instrumento ? `${perfil.instrumento.charAt(0).toUpperCase() + perfil.instrumento.slice(1)} • Vocal` : 'Músico • Louvor';

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      {/* Header */}
      <Header titulo="Meu Perfil" voltar />

      {/* Profile Card Main */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="relative">
          <Avatar nome={primeiroNome} fotoUrl={perfilUsuario?.foto} tamanho="lg" />
        </div>
        <div className="flex items-center gap-2">
          <div>
          <h2 className="text-xl font-bold text-white">{primeiroNome}</h2>
          <p className="text-xs text-white/40 mt-0.5">{handle}</p>
          <p className="text-xs text-purple-300 font-medium mt-1">{funcao}</p>
          </div>
          <button
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          type="button"
          onClick={() => navigate('/configuracoes')}
          aria-label="Editar configurações"
          >
          <Edit3 size={14} />
          </button>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Award size={14} />
          <span>Nível: Avançado</span>
        </div>
      </div>

      {/* Resumo */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Resumo</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center border border-white/10 bg-[#12142B]/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-purple-400">
              <BookOpen size={16} />
              <span className="text-lg font-bold text-white">{musicas.length}</span>
            </div>
            <p className="text-[10px] text-white/40">Cifras criadas</p>
          </div>

          <div className="card p-3 text-center border border-white/10 bg-[#12142B]/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-purple-400">
              <ListMusic size={16} />
              <span className="text-lg font-bold text-white">{playlists.length}</span>
            </div>
            <p className="text-[10px] text-white/40">Playlists</p>
          </div>

          <div className="card p-3 text-center border border-white/10 bg-[#12142B]/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-purple-400">
              <Heart size={16} />
              <span className="text-lg font-bold text-white">0</span>
            </div>
            <p className="text-[10px] text-white/40">Curtidas recebidas</p>
          </div>
        </div>
      </section>

      {/* Acordes preferidos */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Acordes preferidos</h3>
          <button type="button" onClick={() => navigate('/configuracoes')} className="text-xs text-purple-400 hover:underline">
            Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {perfil.tonsPreferidos.length > 0 ? (
            perfil.tonsPreferidos.map((tom) => (
              <span key={tom} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white">
                {tom}
              </span>
            ))
          ) : (
            ['G', 'D', 'Em', 'C', 'Am', 'Bm'].map((tom) => (
              <span key={tom} className="px-3.5 py-1.5 rounded-xl bg-[var(--superficie)] border border-white/10 text-xs font-semibold text-white/80">
                {tom}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Acordes evitados */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Acordes evitados</h3>
          <button type="button" onClick={() => navigate('/configuracoes')} className="text-xs text-purple-400 hover:underline">
            Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['F#', 'B', 'Cm', 'Fm'].map((tom) => (
            <span key={tom} className="px-3.5 py-1.5 rounded-xl bg-[var(--superficie)] border border-white/10 text-xs font-semibold text-white/60">
              {tom}
            </span>
          ))}
        </div>
      </section>

      {/* Histórico recente */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Histórico recente</h3>
          <button type="button" onClick={() => navigate('/biblioteca')} className="text-xs text-purple-400 hover:underline">
            Ver tudo
          </button>
        </div>

        {recentes.length === 0 ? (
          <EstadoVazio titulo="Sem histórico recente" texto="Músicas acessadas recentemente aparecerão aqui." />
        ) : (
          <div className="space-y-2">
            {recentes.slice(0, 4).map((musica) => (
              <div
                key={musica.id}
                onClick={() => navigate(`/musica/${musica.id}`)}
                className="card p-3 flex items-center gap-3 border border-white/10 bg-[#12142B]/80 hover:bg-[#181B36]/50 transition-all rounded-2xl cursor-pointer"
              >
                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{musica.titulo}</p>
                  <p className="text-xs text-white/40 truncate">{musica.artista}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {musica.tom}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Camada Privada — visível apenas para contas autorizadas (nunca anônima) */}
      {autorizadoCamadaPrivada && (
        <section>
          <button
            type="button"
            onClick={() => navigate('/privado')}
            className="w-full card p-3.5 flex items-center gap-3 border border-white/10 bg-[#12142B] hover:bg-[#181B36] transition-all rounded-2xl"
          >
            <div className="p-2 rounded-xl bg-[var(--primaria-dim)] text-[var(--primaria)] shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold text-white">Camada Privada</p>
              <p className="text-xs text-white/40">Câmeras e acervo pessoal</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 shrink-0" />
          </button>
        </section>
      )}
    </main>
  );
}
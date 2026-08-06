import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Music, Palette, BookOpen, Clock, Play, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useMusicas } from '../hooks/useMusicas';
import { useHistorico } from '../hooks/useHistorico';
import { Avatar, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

export default function Perfil() {
  const navigate = useNavigate();
  const { perfilUsuario } = useAuth();
  const { perfil } = usePerfil();
  const { musicas } = useMusicas();
  const { totalReproducoes, maisTocadas, recentes } = useHistorico();
  const [aba, setAba] = useState<'instrumentos' | 'cifras' | 'historico'>('instrumentos');

  const instrumentos = perfil.instrumento ? [perfil.instrumento] : [];

  const estatisticas = [
    { label: 'Músicas Tocadas', valor: totalReproducoes, icone: <Play size={16} /> },
    { label: 'Escalas', valor: perfil.tonsPreferidos.length, icone: <Palette size={16} /> },
    { label: 'Cifras Criadas', valor: musicas.length, icone: <BookOpen size={16} /> },
  ];

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center gap-3 pt-1">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar nome={perfilUsuario?.nome ?? perfil.instrumento} fotoUrl={perfilUsuario?.foto} tamanho="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white truncate">{perfilUsuario?.nome ?? perfil.instrumento}</h1>
            <p className="text-xs text-white/50 capitalize">{perfil.instrumento}</p>
          </div>
          <button className="btn-ghost h-9 w-9 p-0 shrink-0" type="button" onClick={() => navigate('/configuracoes')} aria-label="Configurações">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {estatisticas.map((stat) => (
          <div key={stat.label} className="card p-4 text-center border border-white/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {stat.icone}
              <span className="text-xl font-bold" style={{ color: 'var(--primaria)' }}>{stat.valor}</span>
            </div>
            <p className="text-[10px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'instrumentos', label: 'Meus Instrumentos' },
          { id: 'cifras', label: 'Minhas Cifras' },
          { id: 'historico', label: 'Histórico de Cultos' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip shrink-0 text-xs px-4 py-2 transition-all font-medium ${
              aba === s.id
                ? 'bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-fundo border-transparent font-bold'
                : 'bg-[#141522]/80 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
            }`}
            onClick={() => setAba(s.id as typeof aba)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {aba === 'instrumentos' && (
        <section className="space-y-3">
          {instrumentos.length === 0 ? (
            <EstadoVazio titulo="Nenhum instrumento" texto="Adicione seus instrumentos nas configurações." />
          ) : (
            instrumentos.map((instr) => (
              <div key={instr} className="card p-4 flex items-center gap-3 border border-white/10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Music size={18} style={{ color: 'var(--primaria)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white capitalize">{instr}</p>
                  <p className="text-xs text-white/40">Instrumento principal</p>
                </div>
                <ChevronRight size={16} className="text-white/20 shrink-0" />
              </div>
            ))
          )}
        </section>
      )}

      {aba === 'cifras' && (
        <section className="space-y-3">
          {musicas.length === 0 ? (
            <EstadoVazio titulo="Nenhuma cifra" texto="Crie ou importe cifras para vê-las aqui." />
          ) : (
            musicas.map((musica) => (
              <div key={musica.id} className="card p-3 flex items-center gap-3 border border-white/10">
                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{musica.titulo}</p>
                  <p className="text-xs text-white/50">{musica.artista} · {musica.tom}</p>
                </div>
                <ChevronRight size={16} className="text-white/20 shrink-0" />
              </div>
            ))
          )}
        </section>
      )}

      {aba === 'historico' && (
        <section className="space-y-3">
          {maisTocadas.length === 0 && recentes.length === 0 ? (
            <EstadoVazio titulo="Nenhum histórico" texto="Suas cifras mais tocadas e recentes aparecerão aqui." />
          ) : (
            <>
              {maisTocadas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Mais Tocadas</p>
                  <div className="space-y-2">
                    {maisTocadas.slice(0, 5).map((musica) => (
                      <div key={musica.id} className="card p-3 flex items-center gap-3 border border-white/10">
                        <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{musica.titulo}</p>
                          <p className="text-xs text-white/50">{musica.artista}</p>
                        </div>
                        <span className="text-xs text-white/30 shrink-0">{musica.vezesTocada}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recentes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Recentes</p>
                  <div className="space-y-2">
                    {recentes.slice(0, 5).map((musica) => (
                      <div key={musica.id} className="card p-3 flex items-center gap-3 border border-white/10">
                        <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{musica.titulo}</p>
                          <p className="text-xs text-white/50">{musica.artista}</p>
                        </div>
                        <span className="text-xs text-white/30 shrink-0">{musica.ultimaTocada ? new Date(musica.ultimaTocada).toLocaleDateString('pt-BR') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
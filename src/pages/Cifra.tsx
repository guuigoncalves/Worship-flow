import { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { useAuth } from '../hooks/useAuth';
import { CapaMusica, Avatar, Header } from '../components/aurora';

import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Star,
  ChevronRight,
  ArrowLeft,
  FileText,
  FolderOpen,
  Sparkles,
  Users
} from 'lucide-react';

function diaRelativo(iso: string): string {
  if (!iso) return 'Recentemente';
  const dt = new Date(iso);
  const hoje = new Date();
  const dias = Math.floor((new Date(hoje.toDateString()).getTime() - new Date(dt.toDateString()).getTime()) / 86400000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `${dias} dias`;
}

function SectionHeaderInner({ icon, titulo, verTodas }: { icon: React.ReactNode; titulo: string; verTodas?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
        {icon}{titulo}
      </h2>
      {verTodas && (
        <Link to={verTodas} className="flex items-center gap-0.5 text-xs font-medium text-[var(--primaria)] hover:text-purple-300 transition-colors">
          Ver todas <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function Cifra() {
  const navigate = useNavigate();
  const { musicas, loading, alternarFavorita } = useMusicas();
  const { user, perfilUsuario } = useAuth();

  const [termoBusca, setTermoBusca] = useState('');

  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  const cifrasRecentes = useMemo(() => {
    let lista = [...musicas].filter((m) => m.ultimaTocada).sort((a, b) => (b.ultimaTocada ?? '').localeCompare(a.ultimaTocada ?? ''));
    if (termoBusca.trim()) {
      const query = termoBusca.toLowerCase();
      lista = lista.filter(m =>
        m.titulo.toLowerCase().includes(query) ||
        (m.artista && m.artista.toLowerCase().includes(query))
      );
    }
    return lista;
  }, [musicas, termoBusca]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <Header />


      <p className="text-xs text-white/50 -mt-3">Hub Cifra: tudo o que você precisa para criar, organizar e compartilhar cifras.</p>

      <div className="grid grid-cols-2 gap-3 min-w-0">
        <button
          onClick={() => navigate('/biblioteca')}
          className="min-w-0 p-4 flex items-center gap-3 border border-purple-500/20 bg-[#141522]/80 hover:bg-white/5 transition-all cursor-pointer group rounded-2xl overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <span className="text-sm font-semibold text-white">Biblioteca</span>
        </button>
        <button
          onClick={() => navigate('/editor')}
          className="min-w-0 p-4 flex items-center gap-3 border border-purple-500/20 bg-[#141522]/80 hover:bg-white/5 transition-all cursor-pointer group rounded-2xl overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="text-sm font-semibold text-white">Nova Cifra</span>
        </button>
        <button
          onClick={() => navigate('/importar')}
          className="min-w-0 p-4 flex items-center gap-3 border border-purple-500/20 bg-[#141522]/80 hover:bg-white/5 transition-all cursor-pointer group rounded-2xl overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Download size={20} />
          </div>
          <span className="text-sm font-semibold text-white">Importar</span>
        </button>
        <button
          onClick={() => navigate('/comunidade')}
          className="min-w-0 p-4 flex items-center gap-3 border border-purple-500/20 bg-[#141522]/80 hover:bg-white/5 transition-all cursor-pointer group rounded-2xl overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <span className="text-sm font-semibold text-white">Comunidade</span>
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Filtrar cifras por nome ou artista..."
          className="w-full bg-[#141522]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 backdrop-blur-xl transition-all"
        />
      </div>

      <section>
        <SectionHeaderInner icon={<Star size={16} />} titulo="Cifras Recentes" verTodas="/biblioteca" />
        {cifrasRecentes.length === 0 ? (
          <EstadoVazio titulo="Nenhuma cifra recente" texto="Crie ou importe suas primeiras cifras para visualizar aqui." />
        ) : (
          <div className="space-y-2">
            {cifrasRecentes.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/musica/${m.id}`)}
                className="card flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all border border-white/10 rounded-2xl group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{m.titulo}</p>
                    <p className="text-xs text-white/50 truncate">{m.artista || 'Artista não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--primaria-dim)] text-[var(--primaria)] border border-[var(--primaria)]/20">{m.tom || 'C'}</span>
                  <span className="text-[10px] text-white/40 font-mono">{diaRelativo(m.ultimaTocada as string)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarFavorita(m.id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-purple-400 transition-colors"
                  >
                    <Star size={14} fill={m.eFavorita ? 'currentColor' : 'none'} className={m.eFavorita ? 'text-purple-400' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeaderInner icon={<FolderOpen size={16} />} titulo="Biblioteca" verTodas="/biblioteca" />
        <div className="card divide-y divide-white/5">
          {musicas.length === 0 ? (
            <EstadoVazio titulo="Nenhuma música na biblioteca" texto="Adicione ou importe suas primeiras cifras." />
          ) : (
            musicas.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/musica/${m.id}`)}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{m.titulo}</p>
                    <p className="text-[10px] text-white/50 truncate">{m.artista || 'Artista'} · {m.tom}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white shrink-0" />
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
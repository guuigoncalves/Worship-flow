import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Plus, Search, Bell, Globe, User } from 'lucide-react';
import { useComunidade } from '../hooks/useComunidade';
import { useAuth } from '../hooks/useAuth';
import { SectionHeader, Avatar, Header } from '../components/aurora';

import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useToast } from '../hooks/useToast';

type AbaAtiva = 'feed' | 'equipe' | 'avisos';

function tempoRelativo(iso: string): string {
  if (!iso) return 'Recentemente';
  const dt = new Date(iso);
  const agora = new Date();
  const diffMs = agora.getTime() - dt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return dt.toLocaleDateString('pt-BR');
}

export default function Comunidade() {
  const navigate = useNavigate();
  const { musicas } = useComunidade();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [aba, setAba] = useState<AbaAtiva>('feed');
  const [consulta, setConsulta] = useState('');
  const [curtindoIds, setCurtindoIds] = useState<Set<string>>(new Set());

  const feedMusicas = useMemo(() => {
    let lista = [...musicas];
    if (consulta.trim()) {
      const q = consulta.trim().toLowerCase();
      lista = lista.filter(m =>
        m.titulo.toLowerCase().includes(q) ||
        (m.artista && m.artista.toLowerCase().includes(q))
      );
    }
    return lista;
  }, [musicas, consulta]);

  function toggleCurtir(id: string) {
    setCurtindoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!user) {
    return (
      <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--fundo)' }}>
        <EstadoVazio titulo="Faça login" texto="Você precisa estar logado para acessar a comunidade." />
      </main>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      <Header subtitulo="Compartilhamento e Feed" />

      <div className="flex items-center justify-between gap-3 pt-1">
        <button className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Feed da Comunidade</h2>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors" type="button" aria-label="Notificações">
            <Bell size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'feed', label: 'Feed / Pedidos' },
          { id: 'equipe', label: 'Equipe / Músicos' },
          { id: 'avisos', label: 'Avisos' },
        ].map((a) => (
          <button
            key={a.id}
            type="button"
            className={`chip shrink-0 text-xs px-4 py-2 transition-all font-medium ${
              aba === a.id
                ? 'bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-fundo border-transparent font-bold'
                : 'bg-[#12142B]/80 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
            }`}
            onClick={() => setAba(a.id as AbaAtiva)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar no feed..."
          className="w-full bg-[#12142B]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 backdrop-blur-xl transition-all"
        />
      </div>

      {aba === 'feed' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader icone={<Globe size={16} />} titulo="Feed da Comunidade" />
            <button
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
              type="button"
              onClick={() => navigate('/editor')}
            >
              <Plus size={14} />
              Novo Pedido
            </button>
          </div>

          {feedMusicas.length === 0 ? (
            <EstadoVazio titulo="Nenhuma mensagem no feed" texto="Nenhuma cifra ou pedido foi compartilhado ainda." />
          ) : (
            <div className="space-y-3">
              {feedMusicas.map((musica) => (
                <article key={musica.id} className="card p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Avatar nome={musica.artista || 'Usuário'} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{musica.titulo}</p>
                        <span className="text-[10px] text-white/40">{tempoRelativo(musica.enviadaEm)}</span>
                      </div>
                      <p className="text-xs text-white/50">{musica.artista} · {musica.tom}</p>
                      {musica.letra && (
                        <p className="mt-2 text-xs text-white/60 font-mono" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {musica.letra.slice(0, 200)}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-white/40 hover:text-red-400 transition-colors"
                          onClick={() => toggleCurtir(musica.id)}
                        >
                          <Heart size={14} fill={curtindoIds.has(musica.id) ? 'currentColor' : 'none'} className={curtindoIds.has(musica.id) ? 'text-red-400' : ''} />
                          {curtindoIds.has(musica.id) ? 'Curtido' : 'Curtir'}
                        </button>
                        <button type="button" className="flex items-center gap-1 text-xs text-white/40 hover:text-[var(--primaria)] transition-colors">
                          <MessageCircle size={14} />
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {aba === 'equipe' && (
        <section className="space-y-4">
          <SectionHeader icone={<User size={16} />} titulo="Equipe / Músicos" />
          <div className="space-y-3">
            {[
              { nome: 'Guilherme', cargo: 'Administrador', instrumento: 'Violão' },
              { nome: 'Maria', cargo: 'Música', instrumento: 'Teclado' },
              { nome: 'João', cargo: 'Músico', instrumento: 'Guitarra' },
            ].map((membro) => (
              <div key={membro.nome} className="card p-4 flex items-center gap-3 border border-white/10">
                <Avatar nome={membro.nome} tamanho="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{membro.nome}</p>
                  <p className="text-xs text-white/50">{membro.cargo} · {membro.instrumento}</p>
                </div>
                <span className="chip text-[10px] shrink-0">{membro.cargo}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {aba === 'avisos' && (
        <section className="space-y-4">
          <SectionHeader icone={<Bell size={16} />} titulo="Avisos" />
          <div className="space-y-3">
            {[
              { titulo: 'Culto de Domingo', texto: 'Culto de Domingo - Noite às 19h30. Traga sua cifra e instrumento.', tempo: '2h atrás' },
              { titulo: 'Nova Playlist', texto: 'Playlist "Louvor e Adoração" atualizada com 5 novas cifras.', tempo: '1d atrás' },
              { titulo: 'Manutenção', texto: 'Sistema em manutenção programada para sábado às 3h.', tempo: '3d atrás' },
            ].map((aviso, idx) => (
              <div key={idx} className="card p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <Bell size={16} className="text-[var(--primaria)] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{aviso.titulo}</p>
                    <p className="text-xs text-white/60 mt-1">{aviso.texto}</p>
                    <p className="text-[10px] text-white/40 mt-2">{aviso.tempo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
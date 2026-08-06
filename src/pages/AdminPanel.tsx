import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, X, LogOut, Shield, Trash2, Users, RotateCcw, Activity, FolderOpen, Clock, AlertCircle } from 'lucide-react';
import { SectionHeader, CapaMusica, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useAuth } from '../hooks/useAuth';
import { useComunidade } from '../hooks/useComunidade';
import { useMusicas } from '../hooks/useMusicas';

const adminTabs = ['pendentes', 'gestao', 'logs'] as const;

export default function AdminPanel() {
  const { user } = useAuth();
  const { pendentes, solicitacoesExclusao, aprovarMusica, rejeitarMusica, aprovarExclusaoPermanente, rejeitarExclusaoRestaurar } = useComunidade();
  const { musicas } = useMusicas();
  const isAdmin = Boolean(user?.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID);
  const [tab, setTab] = useState<(typeof adminTabs)[number]>('pendentes');

  if (!isAdmin) return <Navigate to="/" replace />;

  const totalMusicos = musicas.length;
  const totalCifras = musicas.length;
  const pendentesCount = pendentes.length;

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center gap-3 pt-1">
        <Shield size={20} className="text-[var(--primaria)]" />
        <h1 className="text-xl font-bold text-gradient">Painel Administrativo</h1>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users size={16} style={{ color: 'var(--primaria)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--primaria)' }}>{totalMusicos}</span>
          </div>
          <p className="text-[10px] text-white/40">Cifras no Acervo</p>
        </div>
        <div className="card p-4 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <FolderOpen size={16} style={{ color: 'var(--primaria)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--primaria)' }}>{totalCifras}</span>
          </div>
          <p className="text-[10px] text-white/40">Total de Músicos</p>
        </div>
        <div className="card p-4 text-center border border-white/10">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <AlertCircle size={16} style={{ color: 'var(--acento)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--acento)' }}>{pendentesCount}</span>
          </div>
          <p className="text-[10px] text-white/40">Pedidos Pendentes</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'pendentes', label: 'Solicitações Pendentes' },
          { id: 'gestao', label: 'Gerenciar Músicos / Permissões' },
          { id: 'logs', label: 'Logs de Acesso' },
        ].map((a) => (
          <button
            key={a.id}
            type="button"
            className={`chip shrink-0 text-xs px-4 py-2 transition-all font-medium ${
              tab === a.id
                ? 'bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-fundo border-transparent font-bold'
                : 'bg-[#141522]/80 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
            }`}
            onClick={() => setTab(a.id as (typeof adminTabs)[number])}
          >
            {a.label}
          </button>
        ))}
      </div>

      {tab === 'pendentes' && (
        <section className="space-y-4">
          <SectionHeader icone={<Users size={16} />} titulo="Solicitações Pendentes" />
          {pendentes.length === 0 ? (
            <EstadoVazio titulo="Nenhuma solicitação pendente" texto="Quando usuários enviarem cifras para a comunidade, elas aparecerão aqui." />
          ) : (
            <div className="space-y-2">
              {pendentes.map((musica) => (
                <div key={musica.id} className="card p-4 flex items-center justify-between gap-3 border border-white/10">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold text-sm text-white">{musica.titulo}</h2>
                      <p className="truncate text-xs text-white/50">{musica.artista} · {musica.tom}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Enviada por {musica.enviadaPor}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      className="btn-ghost h-9 px-3 text-xs text-sucesso border-sucesso/30 hover:border-sucesso hover:text-sucesso"
                      onClick={() => void aprovarMusica(musica.id)}
                    >
                      <Check size={14} />
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className="btn-ghost h-9 px-3 text-xs text-perigo border-perigo/30 hover:border-perigo hover:text-perigo"
                      onClick={() => void rejeitarMusica(musica.id)}
                    >
                      <X size={14} />
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'gestao' && (
        <section className="space-y-4">
          <SectionHeader icone={<Shield size={16} />} titulo="Gerenciar Músicos / Permissões" />
          <div className="card p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} style={{ color: 'var(--primaria)' }} />
              <span className="text-sm font-semibold text-white">Músicos Ativos</span>
            </div>
            <div className="space-y-2">
              {[
                { nome: 'Guilherme', papel: 'Administrador', status: 'ativo' },
                { nome: 'Maria', papel: 'Música', status: 'ativo' },
                { nome: 'João', papel: 'Músico', status: 'inativo' },
              ].map((m) => (
                <div key={m.nome} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <Avatar nome={m.nome} tamanho="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{m.nome}</p>
                      <p className="text-xs text-white/40">{m.papel}</p>
                    </div>
                  </div>
                  <span className={`chip text-[10px] ${m.status === 'ativo' ? 'bg-sucesso/20 text-sucesso' : 'bg-white/10 text-white/40'}`}>
                    {m.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'logs' && (
        <section className="space-y-4">
          <SectionHeader icone={<Activity size={16} />} titulo="Logs de Acesso" />
          <div className="card p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} style={{ color: 'var(--primaria)' }} />
              <span className="text-sm font-semibold text-white">Atividade Recente</span>
            </div>
            <div className="space-y-2">
              {[
                { action: 'Login', usuario: 'Guilherme', tempo: '2 min atrás' },
                { action: 'Aprovação de cifra', usuario: 'Guilherme', tempo: '15 min atrás' },
                { action: 'Login', usuario: 'Maria', tempo: '1h atrás' },
                { action: 'Rejeição de cifra', usuario: 'Guilherme', tempo: '3h atrás' },
                { action: 'Login', usuario: 'João', tempo: '1d atrás' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <Activity size={14} style={{ color: 'var(--primaria)' }} />
                    <div>
                      <p className="text-sm text-white">{log.action}</p>
                      <p className="text-xs text-white/40">{log.usuario}</p>
                    </div>
                  </div>
                  <span className="text-xs text-white/30 shrink-0">{log.tempo}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
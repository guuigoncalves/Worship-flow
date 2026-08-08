import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, X, Shield, Eye, Bell, User } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useAuth } from '../hooks/useAuth';
import { useComunidade } from '../hooks/useComunidade';

export default function AdminPanel() {
  const { user } = useAuth();
  const { pendentes, solicitacoesExclusao, aprovarMusica, rejeitarMusica, aprovarExclusaoPermanente, rejeitarExclusaoRestaurar } = useComunidade();
  const isAdmin = Boolean(user?.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID);
  const [abaAtiva, setAbaAtiva] = useState<'moderacao' | 'exclusao'>('moderacao');

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header Admin */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Painel Admin</h1>
            <p className="text-[10px] text-white/40">Gestão de conteúdo e solicitações</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-purple-600 grid place-items-center text-white font-bold text-xs">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#141522]/80 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setAbaAtiva('moderacao')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            abaAtiva === 'moderacao' ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow' : 'text-white/40 hover:text-white'
          }`}
        >
          Moderação
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('exclusao')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            abaAtiva === 'exclusao' ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow' : 'text-white/40 hover:text-white'
          }`}
        >
          Solicitações de exclusão
        </button>
      </div>

      {/* Tab: Moderação */}
      {abaAtiva === 'moderacao' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Cifras pendentes de aprovação</h2>
            <span className="text-xs font-semibold text-purple-400">{pendentes.length} pendentes</span>
          </div>

          {pendentes.length === 0 ? (
            <EstadoVazio titulo="Nenhuma cifra pendente" texto="Não há solicitações de aprovação no momento." />
          ) : (
            <div className="space-y-3">
              {pendentes.map((musica) => (
                <div
                  key={musica.id}
                  className="card p-3.5 flex items-center justify-between gap-3 border border-white/10 bg-[#141522]/80 rounded-2xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{musica.titulo}</p>
                      <p className="text-xs text-white/40 truncate">{musica.artista}</p>
                      <p className="text-[10px] text-white/30 truncate mt-0.5">Enviada por {musica.enviadaPor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20 mr-1">
                      {musica.tom}
                    </span>
                    <button
                      type="button"
                      onClick={() => void aprovarMusica(musica.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-colors"
                    >
                      <Check size={14} />
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejeitarMusica(musica.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
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

      {/* Tab: Solicitações de exclusão */}
      {abaAtiva === 'exclusao' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Solicitações de exclusão de conteúdo</h2>
            <span className="text-xs font-semibold text-purple-400">{solicitacoesExclusao.length} solicitações</span>
          </div>

          {solicitacoesExclusao.length === 0 ? (
            <EstadoVazio titulo="Nenhuma solicitação de exclusão" texto="Nenhum pedido de exclusão registrado no momento." />
          ) : (
            <div className="space-y-3">
              {solicitacoesExclusao.map((item) => (
                <div
                  key={item.id}
                  className="card p-3.5 flex items-center justify-between gap-3 border border-white/10 bg-[#141522]/80 rounded-2xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CapaMusica tom="C" titulo={item.titulo} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{item.titulo}</p>
                        <span className="flex items-center gap-1 text-[10px] text-white/30">
                          <Eye size={12} /> 2.4k
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate">{item.artista}</p>
                      <p className="text-[10px] text-white/30 truncate mt-0.5">Solicitada por: {item.enviadaPor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void aprovarExclusaoPermanente(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
                    >
                      Aprovar exclusão
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejeitarExclusaoRestaurar(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold border border-white/10 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
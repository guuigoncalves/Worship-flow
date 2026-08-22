import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, PlayCircle, BookOpen, Download, Bell, User, Info, Check, Trash2, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTema } from '../utils/temas';
import { Header } from '../components/aurora';

export default function Configuracoes() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { tema, setTema } = useTema();
  const [secaoAtiva, setSecaoAtiva] = useState<'geral' | 'reproducao' | 'cifras' | 'importacao' | 'notificacoes' | 'conta' | 'sobre'>('geral');
  const [exibirAnuncio, setExibirAnuncio] = useState(false);
  const [exibirLetra, setExibirLetra] = useState(true);
  const [idioma, setIdioma] = useState('pt-BR');
  const [fusoHorario, setFusoHorario] = useState('GMT-03:00');

  const secoes = [
    { id: 'geral', label: 'Geral', icon: Sliders },
    { id: 'reproducao', label: 'Reprodução', icon: PlayCircle },
    { id: 'cifras', label: 'Cifras', icon: BookOpen },
    { id: 'importacao', label: 'Importação', icon: Download },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'conta', label: 'Conta', icon: User },
    { id: 'sobre', label: 'Sobre', icon: Info },
  ];

  const temasCards = [
    { id: 'eclipse', nome: 'Espacial', tag: 'Atual', bg: 'from-purple-900/40 via-indigo-900/20 to-slate-950' },
    { id: 'midnight', nome: 'Aurora', tag: 'Em breve', bg: 'from-emerald-900/40 via-teal-900/20 to-slate-950' },
    { id: 'sunset', nome: 'Clássico', tag: 'Em breve', bg: 'from-amber-900/40 via-orange-900/20 to-slate-950' },
    { id: 'claro', nome: 'Claro', tag: 'Em breve', bg: 'from-slate-200 to-slate-400' },
  ];

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      {/* Header */}
      <Header titulo="Configurações" voltar />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {secoes.map((s) => {
            const Icon = s.icon;
            const ativo = secaoAtiva === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSecaoAtiva(s.id as typeof secaoAtiva)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all shrink-0 md:shrink ${
                  ativo
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 font-semibold'
                    : 'bg-[#12142B]/60 text-white/60 hover:text-white hover:bg-[var(--superficie)]'
                }`}
              >
                <Icon size={16} className={ativo ? 'text-purple-400' : 'text-white/40'} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="md:col-span-3 space-y-6">
          {secaoAtiva === 'geral' && (
            <>
              {/* Tema visual cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tema e Aparência</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {temasCards.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => t.tag === 'Atual' && setTema(t.id as any)}
                      className={`relative h-24 rounded-2xl p-3 flex flex-col justify-between border cursor-pointer transition-all overflow-hidden bg-gradient-to-br ${t.bg} ${
                        tema === t.id ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t.nome}</span>
                        {tema === t.id ? (
                          <div className="w-5 h-5 rounded-full bg-purple-500 grid place-items-center">
                            <Check size={12} className="text-white" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/40">{t.tag}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="card p-4 space-y-4 border border-white/10 bg-[#12142B]/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Exibir anúncio em tela cheia</p>
                    <p className="text-xs text-white/40">Apoia o desenvolvimento do aplicativo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExibirAnuncio(!exibirAnuncio)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${exibirAnuncio ? 'bg-purple-600' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${exibirAnuncio ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Exibir letra durante reprodução no Player</p>
                    <p className="text-xs text-white/40">Mostra a letra sincronizada quando disponível</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExibirLetra(!exibirLetra)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${exibirLetra ? 'bg-purple-600' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${exibirLetra ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Idioma e Fuso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4 space-y-2 border border-white/10 bg-[#12142B]/80 rounded-2xl">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Idioma do aplicativo</label>
                  <select
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="card p-4 space-y-2 border border-white/10 bg-[#12142B]/80 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Fuso horário</label>
                    <HelpCircle size={12} className="text-white/30" />
                  </div>
                  <select
                    value={fusoHorario}
                    onChange={(e) => setFusoHorario(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="GMT-03:00">(GMT-03:00) Brasília</option>
                    <option value="GMT-04:00">(GMT-04:00) Manaus</option>
                    <option value="GMT-05:00">(GMT-05:00) Acre</option>
                  </select>
                </div>
              </div>

              {/* Limpar cache */}
              <div className="card p-4 flex items-center justify-between border border-white/10 bg-[#12142B]/80 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-white">Limpar cache</p>
                  <p className="text-xs text-white/40">Libera espaço armazenado • 256 MB</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </>
          )}

          {secaoAtiva !== 'geral' && (
            <div className="card p-6 border border-white/10 bg-[#12142B]/80 rounded-2xl text-center space-y-3">
              <p className="text-sm font-semibold text-white">Configurações de {secoes.find((s) => s.id === secaoAtiva)?.label}</p>
              <p className="text-xs text-white/40">Opções desta seção estão configuradas com os padrões recomendados.</p>
            </div>
          )}

          {/* Sair */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => void logout().then(() => navigate('/login'))}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
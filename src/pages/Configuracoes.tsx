import { useState } from 'react';
import { LogOut, Palette, Layout, Settings, MicOff, Bell, Music, Info, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useTema } from '../hooks/useTema';
import { useLayout } from '../utils/layouts';

const nomesTema = { eclipse: 'Eclipse', midnight: 'Midnight Blue', sunset: 'Sunset', forest: 'Forest', claro: 'Claro' };

type SecaoConfig = 'geral' | 'reproducao' | 'cifras' | 'notificacoes' | 'conta' | 'sobre';

const secoes: { id: SecaoConfig; label: string; icone: React.ReactNode }[] = [
  { id: 'geral', label: 'Geral', icone: <Settings size={16} /> },
  { id: 'reproducao', label: 'Reprodução', icone: <Music size={16} /> },
  { id: 'cifras', label: 'Cifras', icone: <Layout size={16} /> },
  { id: 'notificacoes', label: 'Notificações', icone: <Bell size={16} /> },
  { id: 'conta', label: 'Conta', icone: <User size={16} /> },
  { id: 'sobre', label: 'Sobre', icone: <Info size={16} /> },
];

export default function Configuracoes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { perfil, updatePerfil } = usePerfil();
  const { tema, setTema, temas } = useTema();
  const { layout, setLayout, layouts, layoutsDisponiveis, layoutInfo } = useLayout();
  const [secao, setSecao] = useState<SecaoConfig>('geral');

  return (
    <main className="app-page fade-in">
      <h1 className="m-0 font-display text-3xl font-bold text-gradient mb-5">{t('settings.title')}</h1>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Sidebar de categorias */}
        <nav
          className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl p-2 scrollbar-none lg:w-52 lg:flex-col lg:overflow-x-visible"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {secoes.map((s) => (
            <button
              key={s.id}
              type="button"
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
              style={secao === s.id ? {
                background: 'linear-gradient(120deg, rgba(162,89,255,0.25), rgba(91,141,239,0.15))',
                color: '#A259FF',
                border: '1px solid rgba(162,89,255,0.3)',
              } : {
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid transparent',
              }}
              onClick={() => setSecao(s.id)}
            >
              {s.icone}
              {s.label}
            </button>
          ))}
        </nav>

        {/* Conteúdo da seção */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* GERAL */}
          {secao === 'geral' && (
            <>
              <section className="card space-y-4 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layout size={16} style={{ color: '#A259FF' }} />
                  <span className="font-semibold text-sm">Layout do aplicativo</span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Estrutura, navegação e densidade — diferente de cor.
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {layouts.map((item) => {
                    const disponivel = layoutsDisponiveis.includes(item);
                    return (
                      <button
                        key={item}
                        className="card p-3 text-left text-sm"
                        style={layout === item ? { borderColor: '#A259FF', background: 'rgba(162,89,255,0.08)' } : { opacity: disponivel ? 1 : 0.5 }}
                        type="button"
                        disabled={!disponivel}
                        onClick={() => setLayout(item)}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{layoutInfo[item].nome}</span>
                          {layout === item ? (
                            <span style={{ color: '#A259FF' }}>✓</span>
                          ) : !disponivel ? (
                            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Em breve</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{layoutInfo[item].descricao}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="card space-y-3 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={16} style={{ color: '#A259FF' }} />
                  <span className="font-semibold text-sm">{t('settings.title')}</span>
                </div>
                <label className="space-y-1.5">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('settings.language')}</span>
                  <select
                    className="input text-sm"
                    value={perfil.idiomaApp}
                    onChange={(event) => void updatePerfil({ idiomaApp: event.target.value as 'pt-BR' | 'en' })}
                  >
                    <option value="pt-BR">Português Brasileiro</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </section>
            </>
          )}

          {/* CIFRAS = Tema visual */}
          {secao === 'cifras' && (
            <section className="card space-y-4 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Palette size={16} style={{ color: '#A259FF' }} />
                <span className="font-semibold text-sm">Tema do aplicativo</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {temas.map((item) => (
                  <button
                    key={item}
                    className="card overflow-hidden p-0 text-left"
                    style={tema === item ? { borderColor: '#A259FF' } : {}}
                    type="button"
                    onClick={() => setTema(item)}
                  >
                    <div
                      className={`h-16 w-full tema-${item}`}
                      style={{ background: `linear-gradient(135deg, var(--fundo), var(--superficie-alta), var(--primaria))` }}
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
                      <span>{nomesTema[item]}</span>
                      {tema === item ? <span style={{ color: '#A259FF' }}>✓</span> : null}
                    </div>
                  </button>
                ))}
              </div>
              <label className="space-y-2">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Tamanho padrão da fonte</span>
                <input className="w-full" type="range" min={0} max={3} defaultValue={1} style={{ accentColor: '#A259FF' }} />
                <p className="rounded-xl p-3 text-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  Prévia ao vivo da cifra e da interface.
                </p>
              </label>
            </section>
          )}

          {/* REPRODUÇÃO */}
          {secao === 'reproducao' && (
            <section className="card space-y-4 p-4 opacity-70">
              <div className="flex items-center gap-2 mb-1">
                <MicOff size={16} style={{ color: '#A259FF' }} />
                <span className="font-semibold text-sm">Modo de Escuta</span>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Reconhecimento de áudio e sugestão de cifra</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Em breve
                  </span>
                </div>
                <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Funcionalidade em desenvolvimento. Em breve será possível usar o microfone para sugerir acordes em tempo real.
                </p>
              </div>
            </section>
          )}

          {/* NOTIFICAÇÕES */}
          {secao === 'notificacoes' && (
            <section className="card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} style={{ color: '#A259FF' }} />
                <span className="font-semibold text-sm">Notificações</span>
              </div>
              {[
                { label: 'Novidades da comunidade', sub: 'Quando novas cifras forem aprovadas' },
                { label: 'Atividade do espaço', sub: 'Quando membros compartilharem músicas' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sub}</p>
                  </div>
                  <div
                    className="relative h-6 w-11 rounded-full cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    <div
                      className="absolute top-0.5 h-5 w-5 rounded-full"
                      style={{ background: 'white', transform: 'translateX(2px)' }}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* CONTA */}
          {secao === 'conta' && (
            <section className="card space-y-4 p-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} style={{ color: '#A259FF' }} />
                <span className="font-semibold text-sm">Conta</span>
              </div>
              <button
                className="btn-ghost w-full justify-start text-sm"
                style={{ color: '#E04040', borderColor: 'rgba(224,64,64,0.3)' }}
                type="button"
                onClick={() => void logout().then(() => navigate('/login'))}
              >
                <LogOut className="h-4 w-4" />
                {t('settings.logout')}
              </button>
            </section>
          )}

          {/* SOBRE */}
          {secao === 'sobre' && (
            <section className="card p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Info size={16} style={{ color: '#A259FF' }} />
                <span className="font-semibold text-sm">Sobre o WorshipFlow</span>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(162,89,255,0.06)', border: '1px solid rgba(162,89,255,0.15)' }}
              >
                <p className="text-2xl font-bold text-gradient">WorshipFlow</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Sua música. Seu ministério. Em qualquer lugar.
                </p>
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Versão 1.0 · React 19 + Firebase
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

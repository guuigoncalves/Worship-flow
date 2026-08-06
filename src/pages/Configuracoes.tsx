import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Palette, Volume2, Bell, Server, Info, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useTema } from '../utils/temas';
import { useLayout } from '../utils/layouts';

const nomesTema = { eclipse: 'Eclipse', midnight: 'Midnight Blue', sunset: 'Sunset', forest: 'Forest', claro: 'Claro' };

export default function Configuracoes() {
  const navigate = useNavigate();
  const { logout, perfilUsuario } = useAuth();
  const { perfil, updatePerfil } = usePerfil();
  const { tema, setTema, temas } = useTema();
  const { layout, setLayout, layouts, layoutsDisponiveis, layoutInfo } = useLayout();
  const [secao, setSecao] = useState<string>('conta');

  const grupos = [
    { id: 'conta', label: 'Conta e Perfil', icone: <User size={16} /> },
    { id: 'audio', label: 'Preferências de Áudio e Transposição', icone: <Volume2 size={16} /> },
    { id: 'notificacoes', label: 'Notificações', icone: <Bell size={16} /> },
    { id: 'servidor', label: 'Servidor Navidrome / Camada Privada', icone: <Server size={16} /> },
    { id: 'tema', label: 'Tema e Visual', icone: <Palette size={16} /> },
    { id: 'sobre', label: 'Informações do App', icone: <Info size={16} /> },
  ];

  const renderSecao = () => {
    switch (secao) {
      case 'conta':
        return (
          <div className="card p-4 space-y-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Conta e Perfil</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Instrumento</label>
                <select
                  className="input text-sm"
                  value={perfil.instrumento}
                  onChange={(e) => void updatePerfil({ instrumento: e.target.value })}
                >
                  <option value="violao">Violão</option>
                  <option value="guitarra">Guitarra</option>
                  <option value="teclado">Teclado</option>
                  <option value="baixo">Baixo</option>
                  <option value="bateria">Bateria</option>
                  <option value="voz">Voz</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="card p-4 space-y-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Preferências de Áudio e Transposição</span>
            </div>
            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Tom padrão</span>
                <select
                  className="input text-sm"
                  value={perfil.tonsPreferidos[0] ?? 'C'}
                  onChange={(e) => {
                    const novosTons = perfil.tonsPreferidos.includes(e.target.value as any)
                      ? perfil.tonsPreferidos
                      : [e.target.value as any, ...perfil.tonsPreferidos];
                    void updatePerfil({ tonsPreferidos: novosTons });
                  }}
                >
                  <option value="C">C</option>
                  <option value="C#">C#</option>
                  <option value="D">D</option>
                  <option value="Eb">Eb</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="F#">F#</option>
                  <option value="G">G</option>
                  <option value="Ab">Ab</option>
                  <option value="A">A</option>
                  <option value="Bb">Bb</option>
                  <option value="B">B</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm">Capo automático</span>
                <div
                  className="relative h-6 w-11 rounded-full cursor-pointer"
                  style={{ background: perfil.preferirCapo ? 'linear-gradient(120deg, var(--primaria), var(--acento))' : 'rgba(255,255,255,0.12)' }}
                  onClick={() => void updatePerfil({ preferirCapo: !perfil.preferirCapo })}
                >
                  <div
                    className="absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-200"
                    style={{ background: 'white', transform: perfil.preferirCapo ? 'translateX(20px)' : 'translateX(2px)' }}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm">Versão simplificada</span>
                <div
                  className="relative h-6 w-11 rounded-full cursor-pointer"
                  style={{ background: perfil.usarVersaoSimplificada ? 'linear-gradient(120deg, var(--primaria), var(--acento))' : 'rgba(255,255,255,0.12)' }}
                  onClick={() => void updatePerfil({ usarVersaoSimplificada: !perfil.usarVersaoSimplificada })}
                >
                  <div
                    className="absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-200"
                    style={{ background: 'white', transform: perfil.usarVersaoSimplificada ? 'translateX(20px)' : 'translateX(2px)' }}
                  />
                </div>
              </label>
            </div>
          </div>
        );
      case 'notificacoes':
        return (
          <div className="card p-4 space-y-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Notificações</span>
            </div>
            {[
              { label: 'Novidades da comunidade', sub: 'Quando novas cifras forem aprovadas' },
              { label: 'Atividade do espaço', sub: 'Quando membros compartilharem músicas' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
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
          </div>
        );
      case 'servidor':
        return (
          <div className="card p-4 space-y-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Server size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Servidor Navidrome / Camada Privada</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>URL do Navidrome</label>
                <input
                  type="text"
                  className="w-full input text-sm"
                  placeholder="https://navidrome.exemplo.com"
                  defaultValue={import.meta.env.VITE_NAVIDROME_URL ?? ''}
                />
              </div>
              <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                  A camada privada (Navidrome, câmeras Frigate) requer configuração de proxy e credenciais.
                  Verifique as variáveis de ambiente e o arquivo de regras do Firestore.
                </p>
              </div>
            </div>
          </div>
        );
      case 'tema':
        return (
          <div className="card p-4 space-y-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Tema e Visual</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {temas.map((item) => (
                <button
                  key={item}
                  className="card overflow-hidden p-0 text-left border border-white/10"
                  style={tema === item ? { borderColor: 'var(--primaria)' } : {}}
                  type="button"
                  onClick={() => setTema(item)}
                >
                  <div
                    className={`h-16 w-full tema-${item}`}
                    style={{ background: 'linear-gradient(135deg, var(--fundo), var(--superficie-alta), var(--primaria))' }}
                  />
                  <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
                    <span>{nomesTema[item]}</span>
                    {tema === item ? <span style={{ color: 'var(--primaria)' }}>✓</span> : null}
                  </div>
                </button>
              ))}
            </div>
            <div>
              <span className="text-sm block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Layout do aplicativo</span>
              <div className="grid grid-cols-2 gap-3">
                {layouts.map((item) => {
                  const disponivel = layoutsDisponiveis.includes(item);
                  return (
                    <button
                      key={item}
                      className="card p-3 text-left text-sm border border-white/10"
                      style={layout === item ? { borderColor: 'var(--primaria)', background: 'rgba(162,89,255,0.08)' } : { opacity: disponivel ? 1 : 0.5 }}
                      type="button"
                      disabled={!disponivel}
                      onClick={() => setLayout(item)}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{layoutInfo[item].nome}</span>
                        {layout === item ? (
                          <span style={{ color: 'var(--primaria)' }}>✓</span>
                        ) : !disponivel ? (
                          <span className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Em breve</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{layoutInfo[item].descricao}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'sobre':
        return (
          <div className="card p-4 space-y-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Info size={16} style={{ color: 'var(--primaria)' }} />
              <span className="font-semibold text-sm">Informações do App</span>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(162,89,255,0.06)', border: '1px solid rgba(162,89,255,0.15)' }}>
              <p className="text-2xl font-bold text-gradient">WorshipFlow</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sua música. Seu ministério. Em qualquer lugar.
              </p>
            </div>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Versão 15.0 · React 19 + Firebase
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center gap-3 pt-1">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gradient text-center flex-1">Configurações</h1>
      </header>

      <nav className="flex flex-col gap-2">
        {grupos.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`card p-4 flex items-center gap-3 border border-white/10 transition-colors ${
              secao === g.id ? 'border-[var(--primaria)]/30' : ''
            }`}
            onClick={() => setSecao(g.id)}
          >
            <span className="shrink-0" style={{ color: secao === g.id ? 'var(--primaria)' : 'rgba(255,255,255,0.4)' }}>
              {g.icone}
            </span>
            <span className="text-sm font-medium text-left flex-1">{g.label}</span>
            <ChevronRight size={14} className="text-white/20 shrink-0" />
          </button>
        ))}
      </nav>

      <div className="space-y-4">{renderSecao()}</div>

      <button
        type="button"
        className="w-full py-3 rounded-2xl text-sm font-bold transition-colors"
        style={{ background: 'rgba(224,64,64,0.15)', color: '#E04040', border: '1px solid rgba(224,64,64,0.3)' }}
        onClick={() => void logout().then(() => navigate('/login'))}
      >
        Sair / Encerrar Sessão
      </button>
    </main>
  );
}
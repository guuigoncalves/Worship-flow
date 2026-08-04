import { Settings, Pencil, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, CapaMusica } from '../components/aurora';
import { useAuth } from '../hooks/useAuth';
import { useHistorico } from '../hooks/useHistorico';
import { usePerfil } from '../hooks/usePerfil';
import type { Nivel, Tom } from '../types';

const instrumentos = ['violao', 'guitarra', 'teclado', 'baixo', 'bateria', 'voz'];
const niveis: Nivel[] = ['iniciante', 'intermediario', 'avancado'];
const acordes = ['F', 'Bm', 'C#m', 'Bb', 'Eb', 'Ab', 'F#m', 'G#m', 'B/F#'];
const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const corNivel: Record<string, { bg: string; text: string }> = {
  iniciante: { bg: 'rgba(54,184,118,0.2)', text: '#36B876' },
  intermediario: { bg: 'rgba(162,89,255,0.2)', text: '#A259FF' },
  avancado: { bg: 'rgba(228,180,41,0.2)', text: '#E4B429' },
};

export default function Perfil() {
  const { t } = useTranslation();
  const { perfilUsuario } = useAuth();
  const { perfil, updatePerfil, toggleAcordeProibido, toggleTomPreferido } = usePerfil();
  const { maisTocadas, recentes, totalReproducoes } = useHistorico();

  const nivelInfo = corNivel[perfil.nivel] ?? corNivel.intermediario;

  return (
    <main className="app-page fade-in space-y-5">
      {/* Header com Avatar e métricas */}
      <div
        className="card relative overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg, rgba(162,89,255,0.12) 0%, rgba(91,141,239,0.06) 100%)' }}
      >
        {/* Decoração de fundo */}
        <div
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A259FF 0%, transparent 70%)' }}
        />

        <div className="relative flex items-start gap-4">
          <div className="shrink-0">
            <Avatar nome={perfilUsuario?.nome ?? perfil.instrumento} fotoUrl={perfilUsuario?.foto} tamanho="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="m-0 text-2xl font-bold text-gradient">
                  {perfilUsuario?.nome ?? t('profile.title')}
                </h1>
                <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {perfil.instrumento}
                </p>
              </div>
              <Link to="/configuracoes" className="btn-ghost h-9 w-9 p-0 shrink-0">
                <Settings className="h-4 w-4" />
              </Link>
            </div>

            {/* Badge de nível */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: nivelInfo.bg, color: nivelInfo.text }}
              >
                <Award size={12} />
                Nível {perfil.nivel === 'iniciante' ? 'Iniciante' : perfil.nivel === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </span>
            </div>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Cifras', valor: maisTocadas.length },
            { label: 'Reproduções', valor: totalReproducoes },
            { label: 'Recentes', valor: recentes.length },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#A259FF' }}>{m.valor}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações do instrumento/nível */}
      <section className="card p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Pencil size={14} style={{ color: '#A259FF' }} />
          <span className="text-sm font-semibold">Preferências</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('profile.instrument')}</span>
            <select className="input text-sm" value={perfil.instrumento} onChange={(event) => void updatePerfil({ instrumento: event.target.value })}>
              {instrumentos.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('profile.level')}</span>
            <select className="input text-sm" value={perfil.nivel} onChange={(event) => void updatePerfil({ nivel: event.target.value as Nivel })}>
              {niveis.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{t('profile.simple')}</span>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={perfil.usarVersaoSimplificada}
              onChange={(event) => void updatePerfil({ usarVersaoSimplificada: event.target.checked })}
            />
            <div
              className="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              style={{ background: perfil.usarVersaoSimplificada ? 'linear-gradient(120deg, #A259FF, #5B8DEF)' : 'rgba(255,255,255,0.12)' }}
              onClick={() => void updatePerfil({ usarVersaoSimplificada: !perfil.usarVersaoSimplificada })}
            >
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-200"
                style={{ background: 'white', transform: perfil.usarVersaoSimplificada ? 'translateX(20px)' : 'translateX(2px)' }}
              />
            </div>
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{t('profile.capo')}</span>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={perfil.preferirCapo}
              onChange={(event) => void updatePerfil({ preferirCapo: event.target.checked })}
            />
            <div
              className="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              style={{ background: perfil.preferirCapo ? 'linear-gradient(120deg, #A259FF, #5B8DEF)' : 'rgba(255,255,255,0.12)' }}
              onClick={() => void updatePerfil({ preferirCapo: !perfil.preferirCapo })}
            >
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full transition-transform duration-200"
                style={{ background: 'white', transform: perfil.preferirCapo ? 'translateX(20px)' : 'translateX(2px)' }}
              />
            </div>
          </label>
        </div>
      </section>

      {/* Acordes preferidos */}
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sucesso">✓</span>
            <span className="text-sm font-semibold">{t('profile.preferredKeys')}</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Toque para alternar</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tons.map((tom) => (
            <button
              key={tom}
              type="button"
              className={`chip text-sm ${perfil.tonsPreferidos.includes(tom) ? '' : ''}`}
              style={perfil.tonsPreferidos.includes(tom) ? {
                background: 'rgba(54,184,118,0.2)',
                borderColor: 'rgba(54,184,118,0.5)',
                color: '#36B876',
              } : {}}
              onClick={() => void toggleTomPreferido(tom)}
            >
              {tom}
            </button>
          ))}
        </div>
      </section>

      {/* Acordes evitados */}
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-perigo">⚠</span>
            <span className="text-sm font-semibold">{t('profile.forbiddenChords')}</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Toque para alternar</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {acordes.map((acorde) => (
            <button
              key={acorde}
              type="button"
              className="chip text-sm"
              style={perfil.acordesProibidos.includes(acorde) ? {
                background: 'rgba(224,64,64,0.2)',
                borderColor: 'rgba(224,64,64,0.5)',
                color: '#E04040',
              } : {}}
              onClick={() => void toggleAcordeProibido(acorde)}
            >
              {acorde}
            </button>
          ))}
        </div>
      </section>

      {/* Histórico recente */}
      {(maisTocadas.length > 0 || recentes.length > 0) && (
        <section className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <span>📊</span>
            <span className="text-sm font-semibold">{t('profile.history')}</span>
            <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {totalReproducoes} reprodução{totalReproducoes !== 1 ? 'ões' : ''}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[...maisTocadas.slice(0, 2), ...recentes.slice(0, 2)].map((musica, i) => (
              <div key={`${musica.id}-${i}`} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{musica.titulo}</span>
                  <span className="text-xs" style={{ color: '#A259FF' }}>{musica.tom}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

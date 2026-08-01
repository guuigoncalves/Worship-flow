import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, CapaMusica, SectionHeader } from '../components/aurora';
import { useAuth } from '../hooks/useAuth';
import { useHistorico } from '../hooks/useHistorico';
import { usePerfil } from '../hooks/usePerfil';
import type { Nivel, Tom } from '../types';

const instrumentos = ['violao', 'guitarra', 'teclado', 'baixo', 'bateria', 'voz'];
const niveis: Nivel[] = ['iniciante', 'intermediario', 'avancado'];
const acordes = ['F', 'Bm', 'C#m', 'Bb', 'Eb', 'Ab', 'F#m', 'G#m', 'B/F#'];
const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export default function Perfil() {
  const { t } = useTranslation();
  const { perfilUsuario } = useAuth();
  const { perfil, updatePerfil, toggleAcordeProibido, toggleTomPreferido } = usePerfil();
  const { maisTocadas, recentes, totalReproducoes } = useHistorico();
  return (
    <main className="app-page fade-in space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar nome={perfilUsuario?.nome ?? perfil.instrumento} fotoUrl={perfilUsuario?.foto} tamanho="lg" />
          <h1 className="m-0 text-2xl font-extrabold text-gradient">{t('profile.title')}</h1>
        </div>
        <Link to="/configuracoes" className="btn-ghost h-11 w-11 p-0">
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-textoSecundario">{t('profile.instrument')}</span>
          <select className="input" value={perfil.instrumento} onChange={(event) => void updatePerfil({ instrumento: event.target.value })}>
            {instrumentos.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-textoSecundario">{t('profile.level')}</span>
          <select className="input" value={perfil.nivel} onChange={(event) => void updatePerfil({ nivel: event.target.value as Nivel })}>
            {niveis.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="card p-4">
        <SectionHeader icone={<span className="text-perigo">⚠</span>} titulo={t('profile.forbiddenChords')} />
        <div className="flex flex-wrap gap-2">
          {acordes.map((acorde) => (
            <button
              key={acorde}
              type="button"
              className={`chip ${perfil.acordesProibidos.includes(acorde) ? 'border-perigo bg-perigo/20 text-perigo' : ''}`}
              onClick={() => void toggleAcordeProibido(acorde)}
            >
              {acorde}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <SectionHeader icone={<span className="text-sucesso">✓</span>} titulo={t('profile.preferredKeys')} />
        <div className="flex flex-wrap gap-2">
          {tons.map((tom) => (
            <button
              key={tom}
              type="button"
              className={`chip ${perfil.tonsPreferidos.includes(tom) ? 'border-sucesso bg-sucesso/20 text-sucesso' : ''}`}
              onClick={() => void toggleTomPreferido(tom)}
            >
              {tom}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <SectionHeader icone={<Settings size={16} />} titulo={t('settings.title')} />
        <label className="flex items-center justify-between gap-3">
          <span>{t('profile.simple')}</span>
          <input type="checkbox" checked={perfil.usarVersaoSimplificada} onChange={(event) => void updatePerfil({ usarVersaoSimplificada: event.target.checked })} />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>{t('profile.capo')}</span>
          <input type="checkbox" checked={perfil.preferirCapo} onChange={(event) => void updatePerfil({ preferirCapo: event.target.checked })} />
        </label>
      </section>

      <section className="card p-4">
        <SectionHeader icone={<span>📊</span>} titulo={t('profile.history')} />
        <p className="text-textoSecundario">
          {totalReproducoes} {t('song.plays')}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {maisTocadas.slice(0, 3).map((musica) => (
            <div key={musica.id} className="card flex items-center gap-3 p-3">
              <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
              <span className="min-w-0 truncate font-semibold">{musica.titulo}</span>
            </div>
          ))}
          {recentes.slice(0, 3).map((musica) => (
            <div key={`${musica.id}-recent`} className="card flex items-center gap-3 p-3">
              <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
              <span className="min-w-0 truncate font-semibold">{musica.titulo}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

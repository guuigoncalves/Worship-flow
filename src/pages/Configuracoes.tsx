import { LogOut, Palette, Layout, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/aurora';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useTema } from '../hooks/useTema';
import { useLayout } from '../utils/layouts';

const nomesTema = { eclipse: 'Eclipse', midnight: 'Midnight Blue', sunset: 'Sunset', forest: 'Forest', claro: 'Claro' };

export default function Configuracoes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { perfil, updatePerfil } = usePerfil();
  const { tema, setTema, temas } = useTema();
  const { layout, setLayout, layouts, layoutsDisponiveis, layoutInfo } = useLayout();
  return (
    <main className="app-page fade-in space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-3xl font-bold text-gradient">{t('settings.title')}</h1>
      </div>

      <section className="card space-y-5 p-4">
        <SectionHeader icone={<Layout size={16} />} titulo="Layout do aplicativo" />
        <p className="text-sm text-textoSecundario">Estrutura, navegação e densidade — diferente de cor.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {layouts.map((item) => {
            const disponivel = layoutsDisponiveis.includes(item);
            return (
              <button
                key={item}
                className={`card p-3 text-left ${layout === item ? 'border-primaria' : ''} ${disponivel ? '' : 'opacity-50'}`}
                type="button"
                disabled={!disponivel}
                onClick={() => setLayout(item)}
              >
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{layoutInfo[item].nome}</span>
                  {layout === item ? <span className="text-primaria">✓</span> : !disponivel ? <span className="text-[10px] uppercase tracking-wide text-textoSecundario">Em breve</span> : null}
                </div>
                <p className="mt-1 text-xs text-textoSecundario">{layoutInfo[item].descricao}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-5 p-4">
        <SectionHeader icone={<Palette size={16} />} titulo="Tema do aplicativo" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {temas.map((item) => (
            <button key={item} className={`card p-3 text-left ${tema === item ? 'border-primaria' : ''}`} type="button" onClick={() => setTema(item)}>
              <div className={`h-16 rounded-xl tema-${item}`} style={{ background: 'linear-gradient(135deg, var(--fundo), var(--superficie-alta), var(--primaria))' }} />
              <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                <span>{nomesTema[item]}</span>
                {tema === item ? <span className="text-primaria">✓</span> : null}
              </div>
            </button>
          ))}
        </div>
        <label className="space-y-2">
          <span className="text-sm text-textoSecundario">Tamanho padrão da fonte</span>
          <input className="w-full accent-[var(--primaria)]" type="range" min={0} max={3} defaultValue={1} />
          <p className="rounded-xl bg-elevada p-4 text-lg">Prévia ao vivo da cifra e da interface.</p>
        </label>
      </section>

      <section className="card space-y-4 p-4">
        <SectionHeader icone={<Settings size={16} />} titulo={t('settings.title')} />
        <label className="space-y-2">
          <span className="text-sm text-textoSecundario">{t('settings.language')}</span>
          <select className="input" value={perfil.idiomaApp} onChange={(event) => void updatePerfil({ idiomaApp: event.target.value as 'pt-BR' | 'en' })}>
            <option value="pt-BR">Português Brasileiro</option>
            <option value="en">English</option>
          </select>
        </label>
        <button className="btn-ghost w-full text-perigo" type="button" onClick={() => void logout().then(() => navigate('/login'))}>
          <LogOut className="h-4 w-4" />
          {t('settings.logout')}
        </button>
      </section>
    </main>
  );
}

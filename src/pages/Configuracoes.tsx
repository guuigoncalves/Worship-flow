import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { useTema } from '../hooks/useTema';

const nomesTema = { eclipse: 'Eclipse', midnight: 'Midnight Blue', sunset: 'Sunset', forest: 'Forest', claro: 'Claro' };

export default function Configuracoes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { perfil, updatePerfil } = usePerfil();
  const { tema, setTema, temas } = useTema();
  return (
    <main className="app-page fade-in space-y-5">
      <h1 className="m-0 font-display text-3xl font-extrabold">{t('settings.title')}</h1>
      <section className="card space-y-5 p-4">
        <div>
          <p className="text-sm font-semibold text-textoSecundario">Aparência</p>
          <h2 className="font-display text-xl font-bold">Tema do aplicativo</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {temas.map((item) => (
            <button key={item} className={`card p-3 text-left ${tema === item ? 'border-primaria' : ''}`} type="button" onClick={() => setTema(item)}>
              <div className={`h-16 rounded-xl tema-${item}`} style={{ background: 'linear-gradient(135deg, var(--fundo), var(--superficie-alta), var(--primaria))' }} />
              <div className="mt-2 flex items-center justify-between text-sm font-semibold"><span>{nomesTema[item]}</span>{tema === item ? <span className="text-primaria">✓</span> : null}</div>
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

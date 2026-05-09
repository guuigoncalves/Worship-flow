import { Plus, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useMedleys } from '../hooks/useMedleys';
import { useFila } from '../hooks/useFila';

export default function Medleys() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { medleys, salvarMedley } = useMedleys();
  const { tocarAgora, adicionarFila } = useFila();

  async function novo() {
    const medley = await salvarMedley({ titulo: `${t('medleys.new')} ${medleys.length + 1}`, blocos: [] });
    navigate(`/medley/${medley.id}`);
  }

  function tocarMedley(id: string) {
    const medley = medleys.find((item) => item.id === id);
    const musicas = medley?.blocos.map((bloco) => bloco.musicaId).filter((musicaId): musicaId is string => Boolean(musicaId)) ?? [];
    if (!musicas.length) return;
    tocarAgora(musicas[0]!);
    musicas.slice(1).forEach(adicionarFila);
    navigate(`/tocar/${musicas[0]}`);
  }

  return (
    <main className="app-page fade-in space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-extrabold">{t('medleys.title')}</h1>
        <button type="button" className="btn-primary" onClick={() => void novo()}><Plus className="h-4 w-4" />{t('medleys.new')}</button>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medleys.length ? medleys.map((medley) => (
          <article key={medley.id} className="card p-4">
            <Link to={`/medley/${medley.id}`}>
              <h2 className="m-0 text-xl font-bold">{medley.titulo}</h2>
              <p className="m-0 text-sm text-textoSecundario">{medley.blocos.length} {t('medleys.blocks')}</p>
            </Link>
            <button className="btn-primary mt-4 w-full" type="button" onClick={() => tocarMedley(medley.id)}><Play className="h-4 w-4" />{t('medleys.play')}</button>
          </article>
        )) : <EstadoVazio titulo={t('common.empty')} texto={t('medleys.title')} />}
      </section>
    </main>
  );
}

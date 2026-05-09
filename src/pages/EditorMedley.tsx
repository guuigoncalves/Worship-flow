import { Play, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConstrutorBlocos } from '../components/medley/ConstrutorBlocos';
import { PreviewMedley } from '../components/medley/PreviewMedley';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useFila } from '../hooks/useFila';
import { useMedleys } from '../hooks/useMedleys';
import type { BlocoMedley } from '../types';

export default function EditorMedley() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { obterMedley, salvarMedley } = useMedleys();
  const { tocarAgora, adicionarFila } = useFila();
  const medley = id ? obterMedley(id) : undefined;
  const [titulo, setTitulo] = useState('');
  const [blocos, setBlocos] = useState<BlocoMedley[]>([]);

  useEffect(() => {
    if (!medley) return;
    setTitulo(medley.titulo);
    setBlocos(medley.blocos);
  }, [medley]);

  if (!medley) return <main className="app-page"><EstadoVazio titulo={t('common.empty')} texto={t('medleys.title')} /></main>;

  async function salvar() {
    const salvo = await salvarMedley({ id: medley?.id, titulo, blocos });
    navigate(`/medley/${salvo.id}`);
  }

  function tocar() {
    const ids = blocos.map((bloco) => bloco.musicaId).filter((musicaId): musicaId is string => Boolean(musicaId));
    if (!ids.length) return;
    tocarAgora(ids[0]!);
    ids.slice(1).forEach(adicionarFila);
    navigate(`/tocar/${ids[0]}`);
  }

  return (
    <main className="app-page fade-in space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <input className="input max-w-md text-xl font-bold" value={titulo} onChange={(event) => setTitulo(event.target.value)} />
        <div className="flex gap-2">
          <button className="btn-ghost" type="button" onClick={tocar}><Play className="h-4 w-4" />{t('medleys.play')}</button>
          <button className="btn-primary" type="button" onClick={() => void salvar()}><Save className="h-4 w-4" />{t('common.save')}</button>
        </div>
      </header>
      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <ConstrutorBlocos blocos={blocos} onChange={setBlocos} novoLabel={t('medleys.addBlock')} />
        <div>
          <h2 className="mb-3 text-lg font-bold">{t('medleys.preview')}</h2>
          <PreviewMedley blocos={blocos} />
        </div>
      </section>
    </main>
  );
}

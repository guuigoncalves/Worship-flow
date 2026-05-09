import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarraBusca } from '../components/biblioteca/BarraBusca';
import { useFila } from '../hooks/useFila';
import { useHistorico } from '../hooks/useHistorico';
import { useMusicas } from '../hooks/useMusicas';
import { usePerfil } from '../hooks/usePerfil';
import { useToast } from '../hooks/useToast';
import { temAcordeProibido } from '../utils/acordes';
import { corDoTom } from '../utils/tomCores';

export default function BuscaRapida() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { buscar } = useMusicas();
  const { recentes, favoritas } = useHistorico();
  const { adicionarFila } = useFila();
  const { perfil } = usePerfil();
  const { showToast } = useToast();
  const [consulta, setConsulta] = useState('');
  const resultados = buscar(consulta).slice(0, 12);
  const chips = useMemo(() => [...recentes.slice(0, 3), ...favoritas.slice(0, 3)].filter((musica, index, arr) => arr.findIndex((item) => item.id === musica.id) === index), [favoritas, recentes]);

  function addQueue(id: string) {
    adicionarFila(id);
    showToast(t('toast.queue'), 'sucesso');
  }

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur-sm animate-[fade-in_200ms_ease-out]">
      <section className="mx-auto min-h-[calc(100vh-32px)] max-w-xl rounded-2xl border border-borda bg-fundo p-4 shadow-2xl">
        <header className="mb-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <BarraBusca value={consulta} onChange={setConsulta} placeholder={t('search.placeholder')} autoFocus />
          </div>
          <button className="btn-ghost h-11 w-11 shrink-0 p-0" type="button" onClick={() => navigate(-1)} aria-label={t('common.cancel')}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {!consulta ? (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {chips.map((musica) => (
              <button key={musica.id} type="button" className="chip" onClick={() => navigate(`/tocar/${musica.id}`)}>
                {musica.titulo}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          {resultados.map(({ musica }) => {
            const cor = corDoTom(musica.tom);
            const proibido = temAcordeProibido(musica.acordes, perfil.acordesProibidos);
            return (
              <article key={musica.id} className="card pressable flex items-center gap-3 border-l-[3px] p-3" style={{ borderLeftColor: cor }}>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => navigate(`/tocar/${musica.id}`)}>
                  <strong className="block truncate text-lg">{musica.titulo}</strong>
                  <span className="block truncate text-sm text-textoSecundario">{musica.artista}</span>
                  {proibido ? <span className="mt-1 inline-flex rounded bg-perigo/20 px-2 py-1 text-xs text-perigo">{t('library.forbidden')}</span> : null}
                </button>
                <span className="rounded px-2 py-1 text-sm font-bold text-black" style={{ backgroundColor: cor }}>{musica.tom}</span>
                <button className="btn-ghost h-11 w-11 shrink-0 p-0" type="button" onClick={() => addQueue(musica.id)} aria-label={t('common.addQueue')}>
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

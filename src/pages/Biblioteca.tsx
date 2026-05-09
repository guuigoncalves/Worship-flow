import { Grid2X2, Import, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarraBusca } from '../components/biblioteca/BarraBusca';
import { CardMusica } from '../components/biblioteca/CardMusica';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useFila } from '../hooks/useFila';
import { useMusicas } from '../hooks/useMusicas';
import { usePerfil } from '../hooks/usePerfil';
import { useToast } from '../hooks/useToast';
import { extrairAcordes, importarTextoLivre, temAcordeProibido } from '../utils/acordes';
import type { TagMusica, Tom } from '../types';

type Ordem = 'recentes' | 'tocadas' | 'az' | 'tom' | 'dificuldade';

export default function Biblioteca() {
  const { t } = useTranslation();
  const { musicas, buscar, alternarFavorita, excluirMusica, duplicarMusica, salvarMusica } = useMusicas();
  const { adicionarFila } = useFila();
  const { perfil } = usePerfil();
  const { showToast } = useToast();
  const [consulta, setConsulta] = useState('');
  const [grade, setGrade] = useState(true);
  const [ordem, setOrdem] = useState<Ordem>('recentes');
  const [importOpen, setImportOpen] = useState(false);
  const [textoImportado, setTextoImportado] = useState('');
  const [tituloImportado, setTituloImportado] = useState('');
  const [artistaImportado, setArtistaImportado] = useState('');
  const [tomImportado, setTomImportado] = useState<Tom>('G');
  const [tagsImportadas, setTagsImportadas] = useState<TagMusica[]>(['louvor']);

  const resultados = useMemo(() => {
    const base = consulta ? buscar(consulta).map((item) => item.musica) : musicas;
    return [...base].sort((a, b) => {
      if (ordem === 'tocadas') return b.vezesTocada - a.vezesTocada;
      if (ordem === 'az') return a.titulo.localeCompare(b.titulo);
      if (ordem === 'tom') return a.tom.localeCompare(b.tom);
      if (ordem === 'dificuldade') return a.dificuldade.localeCompare(b.dificuldade);
      return (b.ultimaTocada ?? b.criadaEm).localeCompare(a.ultimaTocada ?? a.criadaEm);
    });
  }, [buscar, consulta, musicas, ordem]);

  function queue(id: string) {
    adicionarFila(id);
    showToast(t('toast.queue'), 'sucesso');
  }

  function estruturarImportacao() {
    const estruturado = importarTextoLivre(textoImportado);
    setTextoImportado(estruturado);
    const acordes = extrairAcordes(estruturado);
    const raiz = acordes[0]?.match(/^[A-G](#|b)?/)?.[0] as Tom | undefined;
    if (raiz) setTomImportado(raiz);
    if (!tituloImportado) {
      const primeiraLinha = textoImportado.split(/\r?\n/).find((linha) => linha.trim());
      if (primeiraLinha) setTituloImportado(primeiraLinha.replace(/\[[^\]]+]/g, '').slice(0, 60));
    }
  }

  return (
    <main className="app-page fade-in space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-extrabold">{t('library.title')}</h1>
        <button type="button" className="btn-primary" onClick={() => setImportOpen(true)}>
          <Import className="h-4 w-4" aria-hidden="true" />
          {t('library.import')}
        </button>
      </header>
      <BarraBusca value={consulta} onChange={setConsulta} placeholder={t('search.placeholder')} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`btn-ghost ${grade ? 'text-primaria' : ''}`} onClick={() => setGrade(true)}><Grid2X2 className="h-4 w-4" />{t('library.grid')}</button>
        <button type="button" className={`btn-ghost ${!grade ? 'text-primaria' : ''}`} onClick={() => setGrade(false)}><List className="h-4 w-4" />{t('library.list')}</button>
        <select className="input max-w-[210px]" value={ordem} onChange={(event) => setOrdem(event.target.value as Ordem)}>
          <option value="recentes">{t('library.sortRecent')}</option>
          <option value="tocadas">{t('library.sortPlayed')}</option>
          <option value="az">{t('library.sortAz')}</option>
          <option value="tom">{t('library.sortKey')}</option>
          <option value="dificuldade">{t('library.sortDifficulty')}</option>
        </select>
      </div>
      <section className={grade ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
        {resultados.length ? resultados.map((musica) => (
          <CardMusica
            key={musica.id}
            musica={musica}
            temAcordeProibido={temAcordeProibido(musica.acordes, perfil.acordesProibidos)}
            onFavorite={() => void alternarFavorita(musica.id)}
            onQueue={() => queue(musica.id)}
            onDelete={() => void excluirMusica(musica.id)}
            onDuplicate={() => void duplicarMusica(musica.id)}
          />
        )) : <EstadoVazio titulo={t('common.empty')} texto={t('library.title')} />}
      </section>
      <PainelDeslizante aberto={importOpen} titulo={t('library.import')} onClose={() => setImportOpen(false)}>
        <div className="space-y-3">
          <p className="m-0 text-sm text-textoSecundario">Copie de qualquer site de cifras e cole aqui.</p>
          <textarea className="input min-h-[260px] font-mono" value={textoImportado} onChange={(event) => setTextoImportado(event.target.value)} placeholder="Cole a cifra aqui" />
          <button type="button" className="btn-ghost w-full" onClick={estruturarImportacao}>Estruturar automaticamente</button>
          <div className="grid gap-2 sm:grid-cols-3">
            <input className="input" value={tituloImportado} onChange={(event) => setTituloImportado(event.target.value)} placeholder="Título" />
            <input className="input" value={artistaImportado} onChange={(event) => setArtistaImportado(event.target.value)} placeholder="Artista" />
            <select className="input" value={tomImportado} onChange={(event) => setTomImportado(event.target.value as Tom)}>
              {(['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as Tom[]).map((tom) => <option key={tom}>{tom}</option>)}
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['adoracao', 'louvor', 'ministerio', 'entrega', 'declaracao', 'congregacional'] as TagMusica[]).map((tag) => (
              <button key={tag} type="button" className={`chip ${tagsImportadas.includes(tag) ? 'chip-active' : ''}`} onClick={() => setTagsImportadas((atuais) => atuais.includes(tag) ? atuais.filter((item) => item !== tag) : [...atuais, tag])}>{tag}</button>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              const letra = importarTextoLivre(textoImportado);
              void salvarMusica({
                titulo: tituloImportado || 'Nova música',
                artista: artistaImportado || 'Importado',
                tom: tomImportado,
                letra,
                tags: tagsImportadas,
                dificuldade: 'intermediario'
              }).then(() => {
                setTextoImportado('');
                setTituloImportado('');
                setArtistaImportado('');
                setTomImportado('G');
                setTagsImportadas(['louvor']);
                setImportOpen(false);
              });
            }}
          >
            {t('library.import')}
          </button>
        </div>
      </PainelDeslizante>
    </main>
  );
}

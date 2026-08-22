import { ArrowLeft, Download, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CapaMusica, SectionHeader } from '../components/aurora';
import { EditorLetra } from '../components/editor/EditorLetra';
import { PreviewCifra } from '../components/editor/PreviewCifra';
import { SeletorAcorde } from '../components/editor/SeletorAcorde';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';
import { useTransposicao } from '../hooks/useTransposicao';
import { extrairAcordes } from '../utils/acordes';
import type { TagMusica, Tom } from '../types';

const tagsDisponiveis: TagMusica[] = ['adoracao', 'louvor', 'ministerio', 'entrega', 'cura', 'espirito-santo', 'congregacional', 'declaracao', 'gratidao'];
const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { obterMusica, salvarMusica, salvarVersao } = useMusicas();
  const { transpor, sugerir } = useTransposicao();
  const musica = id ? obterMusica(id) : undefined;
  const [titulo, setTitulo] = useState(musica?.titulo ?? '');
  const [artista, setArtista] = useState(musica?.artista ?? '');
  const [tom, setTom] = useState<Tom>(musica?.tom ?? 'G');
  const [letra, setLetra] = useState(musica?.letra ?? '[G]Digite a letra [C]aqui');
  const [dificuldade, setDificuldade] = useState<'iniciante' | 'intermediario' | 'avancado'>(musica?.dificuldade ?? 'intermediario');
  const [tags, setTags] = useState<TagMusica[]>(musica?.tags ?? ['louvor']);
  const [possuiCifra, setPossuiCifra] = useState<boolean>(musica?.possuiCifra ?? true);
  const [aba, setAba] = useState<'editar' | 'preview'>('editar');
  const insertRef = useRef<(texto: string) => void>(() => undefined);
  const registrarInsert = useCallback((insert: (texto: string) => void) => {
    insertRef.current = insert;
  }, []);

  useEffect(() => {
    if (!musica) return;
    setTitulo(musica.titulo);
    setArtista(musica.artista);
    setTom(musica.tom);
    setLetra(musica.letra);
    setDificuldade(musica.dificuldade);
    setTags(musica.tags);
    setPossuiCifra(musica.possuiCifra ?? true);
  }, [musica]);

  const tomSugerido = useMemo(() => sugerir(extrairAcordes(letra)), [letra, sugerir]);

  function toggleTag(tag: TagMusica) {
    setTags((atuais) => (atuais.includes(tag) ? atuais.filter((item) => item !== tag) : [...atuais, tag]));
  }

  function exportar() {
    void navigator.clipboard.writeText(letra);
    showToast(t('toast.copied'), 'sucesso');
  }

  async function salvar() {
    const salva = await salvarMusica({ titulo: titulo || 'Nova música', artista: artista || 'WorshipFlow', tom, letra, tags, dificuldade, possuiCifra }, id);
    navigate(`/musica/${salva.id}`);
  }

  function transporTudo(destino: Tom) {
    setLetra(transpor(letra, tom, destino));
    setTom(destino);
  }

  function aplicarTomSugerido() {
    if (tomSugerido === tom) {
      showToast(t('toast.keyChanged'), 'info');
      return;
    }
    transporTudo(tomSugerido);
    showToast(t('toast.keyChanged'), 'sucesso');
  }

  return (
    <main className="app-page fade-in space-y-5 w-full max-w-full overflow-x-hidden" style={{ backgroundColor: 'var(--fundo)' }}>
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button className="btn-ghost text-xs" type="button" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.back')}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <CapaMusica tom={tom} titulo={titulo} tamanho="sm" />
            <h1 className="m-0 text-xl font-extrabold text-gradient truncate">{t('editor.title')}</h1>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn-ghost" type="button" onClick={exportar}>
            <Download className="h-4 w-4" />
            {t('editor.export')}
          </button>
          <button className="btn-primary" type="button" onClick={() => void salvar()}>
            <Save className="h-4 w-4" />
            {t('editor.saveSong')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 lg:hidden">
        <button className={`btn-ghost ${aba === 'editar' ? 'text-[var(--primaria)]' : ''}`} type="button" onClick={() => setAba('editar')}>
          {t('editor.lyrics')}
        </button>
        <button className={`btn-ghost ${aba === 'preview' ? 'text-[var(--primaria)]' : ''}`} type="button" onClick={() => setAba('preview')}>
          {t('editor.preview')}
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr] w-full max-w-full overflow-x-hidden">
        <div className={`space-y-4 ${aba === 'preview' ? 'hidden lg:block' : ''} w-full max-w-full overflow-x-hidden`}>
          <div className="fixed bottom-[76px] left-4 right-4 z-30 lg:hidden">
            <button className="btn-primary w-full shadow-2xl" type="button" onClick={() => void salvar()}>
              <Save className="h-4 w-4" />
              {t('editor.saveSong')}
            </button>
          </div>

          <SectionHeader icone={<Save size={16} />} titulo={t('editor.metadata')} />
          <div className="card grid gap-3 p-4 sm:grid-cols-2 w-full max-w-full overflow-x-hidden">
            <input className="input w-full" value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Título" />
            <input className="input w-full" value={artista} onChange={(event) => setArtista(event.target.value)} placeholder={t('editor.artist')} />
            <select className="input w-full" value={tom} onChange={(event) => setTom(event.target.value as Tom)}>
              {tons.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select className="input w-full" value={dificuldade} onChange={(event) => setDificuldade(event.target.value as typeof dificuldade)}>
              <option value="iniciante">iniciante</option>
              <option value="intermediario">intermediario</option>
              <option value="avancado">avancado</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-textoSecundario sm:col-span-2">
              <input type="checkbox" checked={possuiCifra} onChange={(event) => setPossuiCifra(event.target.checked)} className="accent-[var(--cor-primaria)]" />
              Contém Cifra
            </label>
          </div>

          <SectionHeader icone={<span className="text-[var(--primaria)]">♪</span>} titulo={t('editor.lyrics')} />
          {possuiCifra ? <SeletorAcorde onInsert={(acorde) => insertRef.current(acorde)} /> : null}
          <EditorLetra value={letra} onChange={setLetra} onInsertReady={registrarInsert} />

          <div className="flex flex-wrap gap-2 w-full max-w-full overflow-x-hidden">
            {tagsDisponiveis.map((tag) => (
              <button key={tag} type="button" className={`chip ${tags.includes(tag) ? 'chip-active' : ''}`} onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className={`space-y-4 ${aba === 'editar' ? 'hidden lg:block' : ''} w-full max-w-full overflow-x-hidden`}>
          <div className="card flex flex-wrap items-center justify-between gap-2 p-3 w-full max-w-full overflow-x-hidden">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-textoSecundario">
                {t('editor.transposeAll')}: <strong className="text-[var(--primaria)]">{tomSugerido}</strong>
              </span>
              <button className="btn-ghost text-xs" type="button" onClick={aplicarTomSugerido}>
                {t('editor.applySuggested')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tons.map((item) => (
                <button key={item} type="button" className={`chip ${item === tom ? 'chip-active' : ''}`} onClick={() => transporTudo(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <PreviewCifra letra={letra} possuiCifra={possuiCifra} formato="acima" />
          {musica ? (
            <button className="btn-ghost w-full" type="button" onClick={() => void salvarVersao(musica.id, { rotulo: `${t('editor.saveVersion')} ${musica.versoes.length + 1}`, tom, letra })}>
              {t('editor.saveVersion')}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
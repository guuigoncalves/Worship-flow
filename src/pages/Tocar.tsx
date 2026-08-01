import { ArrowLeft, Heart, ListMusic, Minus, Plus, Search, Settings, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExibicaoCifra } from '../components/apresentacao/ExibicaoCifra';
import { useRolagemAutomatica } from '../components/apresentacao/RolagemAutomatica';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useFila } from '../hooks/useFila';
import { useMusicas } from '../hooks/useMusicas';
import { usePerfil } from '../hooks/usePerfil';
import { useToast } from '../hooks/useToast';
import { useTransposicao } from '../hooks/useTransposicao';
import { Metronomo } from '../components/metronomo/Metronomo';
import type { ResultadoBusca, Tom } from '../types';

type Modo = 'cifra' | 'letra' | 'ambos';
type Tamanho = 'pequeno' | 'medio' | 'grande' | 'extra';
type Velocidade = 'lenta' | 'media' | 'rapida';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

const tamanhoPorSlider: Tamanho[] = ['pequeno', 'medio', 'grande', 'extra'];
const velocidadePorSlider: Velocidade[] = ['lenta', 'media', 'rapida'];

export default function Tocar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { obterMusica, buscar, alternarFavorita, marcarTocada } = useMusicas();
  const { fila, tocarAgora, adicionarFila, proxima, anterior } = useFila();
  const { perfil } = usePerfil();
  const { transpor, deslocarTom } = useTransposicao();
  const { showToast } = useToast();
  const [tomAtual, setTomAtual] = useState<Tom>('G');
  const [modo, setModo] = useState<Modo>('ambos');
  const [tamanhoIndex, setTamanhoIndex] = useState(1);
  const [velocidadeIndex, setVelocidadeIndex] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [chromeVisivel, setChromeVisivel] = useState(true);
  const [controleAberto, setControleAberto] = useState(false);
  const [filaAberta, setFilaAberta] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [consulta, setConsulta] = useState('');
  const toqueX = useRef<number | null>(null);
  const toqueDireitaRef = useRef(0);
  const tocadaRef = useRef<string | null>(null);
  const musica = id ? obterMusica(id) : undefined;
  const scrollRef = useRolagemAutomatica(autoScroll, velocidadePorSlider[velocidadeIndex] ?? 'media');

  useEffect(() => {
    if (!musica) return;
    setTomAtual((atual) => (atual === musica.tom ? atual : musica.tom));
  }, [musica?.id, musica?.tom]);

  useEffect(() => {
    if (!musica || tocadaRef.current === musica.id) return;
    tocadaRef.current = musica.id;
    tocarAgora(musica.id);
    void marcarTocada(musica.id);
  }, [musica?.id, marcarTocada, tocarAgora]);

  useEffect(() => {
    if (!chromeVisivel) return undefined;
    const timer = window.setTimeout(() => setChromeVisivel(false), 3000);
    return () => window.clearTimeout(timer);
  }, [chromeVisivel]);

  useEffect(() => {
    let sentinel: WakeLockSentinelLike | null = null;
    const wakeLock = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } };
    void wakeLock.wakeLock?.request('screen').then((lock) => {
      sentinel = lock;
    }).catch(() => undefined);
    return () => {
      void sentinel?.release();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setAutoScroll((valor) => !valor);
      }
      if (event.key === '+') mudarSemitom(1);
      if (event.key === '-') mudarSemitom(-1);
      if (event.key === '=') setVelocidadeIndex((valor) => Math.min(2, valor + 1));
      if (event.key.toLowerCase() === 'f') void document.documentElement.requestFullscreen?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musica?.id, tomAtual]);

  const letra = useMemo(() => (musica ? transpor(musica.letra, musica.tom, tomAtual) : ''), [musica, tomAtual, transpor]);
  const resultados = useMemo(() => buscar(consulta).slice(0, 8), [buscar, consulta]);
  const tamanho = tamanhoPorSlider[tamanhoIndex] ?? 'medio';
  const proximas = fila.proximas.map(obterMusica).filter(Boolean);

  const irProxima = useCallback(() => {
    const proximo = proxima();
    if (proximo) navigate(`/tocar/${proximo}`);
  }, [navigate, proxima]);

  const irAnterior = useCallback(() => {
    const prev = anterior();
    if (prev) navigate(`/tocar/${prev}`);
  }, [anterior, navigate]);

  function mudarSemitom(delta: number) {
    if (!musica) return;
    setTomAtual(deslocarTom(tomAtual, delta));
    showToast(t('toast.keyChanged'), 'sucesso');
  }

  function addQueue(musicaId: string) {
    adicionarFila(musicaId);
    showToast(t('toast.queue'), 'sucesso');
  }

  if (!musica) {
    return <main className="grid min-h-screen place-items-center bg-fundo p-5 text-textoSecundario">{t('common.empty')}</main>;
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-fundo text-texto"
      onClick={() => setChromeVisivel(true)}
      onTouchStart={(event) => {
        toqueX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = toqueX.current;
        const end = event.changedTouches[0]?.clientX;
        if (start === null || end === undefined) return;
        if (start - end > 70) irProxima();
        if (end - start > 70) {
          const agora = Date.now();
          if (agora - toqueDireitaRef.current < 1200) irAnterior();
          else if (scrollRef.current) scrollRef.current.scrollTop = 0;
          toqueDireitaRef.current = agora;
        }
      }}
    >
      <header className={`fixed left-0 right-0 top-0 z-30 flex items-center gap-2 border-b border-borda bg-superficie px-2 py-2 transition-opacity duration-150 ${chromeVisivel ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button type="button" className="btn-text h-11 w-11 p-0 text-texto" onClick={() => navigate(-1)} aria-label={t('common.back')}><ArrowLeft className="h-5 w-5" /></button>
        <strong className="min-w-0 flex-1 truncate text-center text-sm">{musica.titulo}</strong>
        <button type="button" className="btn-text h-11 w-11 p-0 text-texto" onClick={() => setControleAberto(true)} aria-label={t('common.options')}><SlidersHorizontal className="h-5 w-5" /></button>
      </header>

      <section ref={scrollRef} className="absolute bottom-[76px] left-0 right-0 top-0 overflow-y-auto px-4 pb-8 pt-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="card bg-superficie/95 p-4 sm:p-6">
            <ExibicaoCifra letra={letra} acordesProibidos={perfil.acordesProibidos} modo={modo} tamanho={tamanho} />
          </div>
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-borda bg-superficie px-2 py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="grid h-11 min-w-11 place-items-center rounded-lg bg-elevada px-3 font-bold text-primaria">{tomAtual}</span>
          <button type="button" className="btn-ghost h-11 w-11 p-0" onClick={() => mudarSemitom(-1)} aria-label="-"><Minus className="h-5 w-5" /></button>
          <button type="button" className="btn-ghost h-11 w-11 p-0" onClick={() => mudarSemitom(1)} aria-label="+"><Plus className="h-5 w-5" /></button>
          <button type="button" className={`btn-ghost h-11 min-w-11 px-3 ${autoScroll ? 'text-primaria' : ''}`} onClick={() => setAutoScroll((valor) => !valor)}>Auto</button>
          <button type="button" className="btn-ghost h-11 w-11 p-0" onClick={() => setFilaAberta(true)} aria-label="Fila"><ListMusic className="h-5 w-5" /></button>
          <button type="button" className="btn-primary h-11 w-11 p-0" onClick={() => setBuscaAberta(true)} aria-label={t('common.addQueue')}><Plus className="h-5 w-5" /></button>
        </div>
      </footer>

      <PainelDeslizante aberto={controleAberto} titulo="Controle" onClose={() => setControleAberto(false)}>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-textoSecundario">Velocidade do auto-scroll</span>
            <input className="w-full accent-[var(--cor-primaria)]" type="range" min={0} max={2} value={velocidadeIndex} onChange={(event) => setVelocidadeIndex(Number(event.target.value))} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-textoSecundario">Tamanho da fonte</span>
            <input className="w-full accent-[var(--cor-primaria)]" type="range" min={0} max={3} value={tamanhoIndex} onChange={(event) => setTamanhoIndex(Number(event.target.value))} />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ambos', 'letra', 'cifra'] as Modo[]).map((item) => (
              <button key={item} className={`btn-ghost text-sm ${modo === item ? 'text-primaria' : ''}`} type="button" onClick={() => setModo(item)}>
                {item === 'ambos' ? 'Cifra+Letra' : item === 'letra' ? 'Só Letra' : 'Só Cifra'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Refrão', 'Ponte', 'Verso', 'Loop livre'].map((item) => <button key={item} className="btn-ghost justify-start" type="button">{item}</button>)}
          </div>
          <Metronomo />
          <button type="button" className="btn-ghost w-full" onClick={() => void alternarFavorita(musica.id)}><Heart className={`h-5 w-5 ${musica.eFavorita ? 'fill-primaria text-primaria' : ''}`} />{t('common.favorite')}</button>
        </div>
      </PainelDeslizante>

      <PainelDeslizante aberto={filaAberta} titulo="Fila" onClose={() => setFilaAberta(false)}>
        <BuscaInline consulta={consulta} setConsulta={setConsulta} resultados={resultados} onAdd={addQueue} placeholder={t('search.placeholder')} />
        <div className="mt-4 space-y-2">
          {proximas.map((item, index) => item ? (
            <div key={`${item.id}-${index}`} className="card flex items-center justify-between gap-3 p-3">
              <span className="min-w-0 truncate">{index + 1}. {item.titulo}</span>
              <span className="text-sm text-primaria">{item.tom}</span>
            </div>
          ) : null)}
        </div>
      </PainelDeslizante>

      {buscaAberta ? (
        <div className="fixed inset-0 z-40 bg-black/55 p-4 pt-20 backdrop-blur-sm" onClick={() => setBuscaAberta(false)}>
          <section className="card mx-auto max-w-lg p-4" onClick={(event) => event.stopPropagation()}>
            <BuscaInline consulta={consulta} setConsulta={setConsulta} resultados={resultados} onAdd={(musicaId) => { addQueue(musicaId); setBuscaAberta(false); }} placeholder={t('search.placeholder')} />
          </section>
        </div>
      ) : null}
    </main>
  );
}

function BuscaInline({ consulta, setConsulta, resultados, onAdd, placeholder }: { consulta: string; setConsulta: (valor: string) => void; resultados: ResultadoBusca[]; onAdd: (id: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
        <input className="input pl-10" autoFocus value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder={placeholder} />
      </label>
      <div className="mt-3 space-y-2">
        {resultados.map(({ musica }) => (
          <button key={musica.id} type="button" className="w-full rounded-lg bg-elevada p-3 text-left" onClick={() => onAdd(musica.id)}>
            <strong>{musica.titulo}</strong>
            <span className="ml-2 text-sm text-primaria">{musica.tom}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

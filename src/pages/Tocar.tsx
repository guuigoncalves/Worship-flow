import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ListMusic, LogOut, Minus, Plus, Search, SlidersHorizontal } from 'lucide-react';
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
type Formato = 'acima' | 'inline';
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
  const [formato, setFormato] = useState<Formato>('acima');
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
  const proximasMusicas = fila.proximas.map(obterMusica).filter(Boolean);
  const musicaAnteriorId = fila.anteriores[fila.anteriores.length - 1];
  const musicaAnterior = musicaAnteriorId ? obterMusica(musicaAnteriorId) : undefined;
  const proximaMusica = proximasMusicas[0];

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
    return (
      <main className="grid min-h-screen place-items-center bg-black p-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {t('common.empty')}
      </main>
    );
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#000000', color: '#ffffff' }}
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
      {/* ── CABEÇALHO MODO PALCO ── */}
      <header
        className={`fixed left-0 right-0 top-0 z-30 flex items-center gap-2 px-3 py-2 transition-opacity duration-200 ${chromeVisivel ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(162,89,255,0.25)' }}
      >
        {/* Tom atual (badge roxa) */}
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold"
            style={{ background: 'rgba(162,89,255,0.25)', border: '1px solid rgba(162,89,255,0.5)', color: '#A259FF' }}
          >
            {tomAtual}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
            onClick={() => mudarSemitom(-1)}
            aria-label="-"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
            onClick={() => mudarSemitom(1)}
            aria-label="+"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Centro: título + status */}
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A259FF' }}>
            MODO PALCO
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: autoScroll ? '#36B876' : 'rgba(255,255,255,0.3)' }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {autoScroll ? 'Rolagem automática' : 'Rolagem pausada'}
            </span>
          </div>
        </div>

        {/* Direita: botões */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setControleAberto(true)}
            aria-label={t('common.options')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(224,64,64,0.18)', border: '1px solid rgba(224,64,64,0.4)', color: '#E04040' }}
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Sair do palco</span>
          </button>
        </div>
      </header>

      {/* ── ÁREA DA CIFRA ── */}
      <section
        ref={scrollRef}
        className="absolute bottom-[140px] left-0 right-0 top-0 overflow-y-auto px-4 pb-8 pt-16 sm:px-8"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="mx-auto max-w-3xl">
          {/* Título da música */}
          <div className={`mb-6 text-center transition-opacity duration-200 ${chromeVisivel ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{musica.titulo}</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{musica.artista}</p>
          </div>

          {/* Cifra com acordes em roxo neon */}
          <div
            className="rounded-2xl p-4 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <style>{`
              .modo-palco .cifra-acorde { color: #A259FF !important; font-weight: 700; text-shadow: 0 0 12px rgba(162,89,255,0.5); }
              .modo-palco .cifra-letra { color: #ffffff !important; }
              .modo-palco .performance-text { font-size: clamp(18px, 4.5vw, 28px) !important; line-height: 1.7 !important; }
            `}</style>
            <div className="modo-palco">
              <ExibicaoCifra
                letra={letra}
                acordesProibidos={perfil.acordesProibidos}
                modo={modo}
                tamanho={tamanho}
                possuiCifra={musica.possuiCifra ?? true}
                formato={formato}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── RODAPÉ FIXO: NAVEGAÇÃO DE REPERTÓRIO ── */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 transition-opacity duration-200 ${chromeVisivel ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(162,89,255,0.2)' }}
      >
        {/* Linha superior: navegação anterior/atual/próxima */}
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
          {/* Anterior */}
          <button
            type="button"
            className="flex flex-1 items-center gap-2 rounded-xl p-2 transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}
            onClick={irAnterior}
            disabled={!musicaAnterior}
            aria-label="Música anterior"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <div className="min-w-0 text-left">
              <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>ANTERIOR</p>
              <p className="truncate text-xs font-medium">{musicaAnterior?.titulo ?? '—'}</p>
            </div>
          </button>

          {/* Atual (destaque) */}
          <div
            className="flex min-w-0 flex-[1.4] flex-col items-center rounded-xl px-3 py-2"
            style={{ background: 'rgba(162,89,255,0.15)', border: '1px solid rgba(162,89,255,0.35)' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A259FF' }}>ATUAL</p>
            <p className="max-w-full truncate text-sm font-bold" style={{ color: '#ffffff' }}>{musica.titulo}</p>
          </div>

          {/* Próxima */}
          <button
            type="button"
            className="flex flex-1 items-center justify-end gap-2 rounded-xl p-2 text-right transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)' }}
            onClick={irProxima}
            disabled={!proximaMusica}
            aria-label="Próxima música"
          >
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>PRÓXIMA</p>
              <p className="truncate text-xs font-medium">{proximaMusica?.titulo ?? '—'}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Linha inferior: carrossel de capas do repertório */}
        {proximasMusicas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-0 scrollbar-none">
            {proximasMusicas.slice(0, 10).map((item, index) =>
              item ? (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  className="flex shrink-0 flex-col items-center gap-1 rounded-xl p-1.5 transition-colors"
                  style={{
                    background: index === 0 ? 'rgba(162,89,255,0.2)' : 'rgba(255,255,255,0.04)',
                    border: index === 0 ? '1px solid rgba(162,89,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                  onClick={() => navigate(`/tocar/${item.id}`)}
                  aria-label={item.titulo}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: `hsl(${(item.titulo.charCodeAt(0) * 17) % 360}, 60%, 25%)`,
                      color: `hsl(${(item.titulo.charCodeAt(0) * 17) % 360}, 80%, 80%)`,
                    }}
                  >
                    {item.tom}
                  </div>
                  <span className="w-12 truncate text-center text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {item.titulo}
                  </span>
                </button>
              ) : null
            )}

            {/* Botão adicionar à fila */}
            <button
              type="button"
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl p-1.5 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setFilaAberta(true)}
              aria-label={t('common.addQueue')}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(162,89,255,0.15)', border: '1px solid rgba(162,89,255,0.3)' }}
              >
                <ListMusic className="h-4 w-4" style={{ color: '#A259FF' }} />
              </div>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Fila</span>
            </button>
          </div>
        )}

        {/* Linha inferior alternativa quando não há fila */}
        {proximasMusicas.length === 0 && (
          <div className="flex items-center justify-center gap-3 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-0">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
              style={{ background: 'rgba(162,89,255,0.15)', border: '1px solid rgba(162,89,255,0.3)', color: '#A259FF' }}
              onClick={() => setBuscaAberta(true)}
              aria-label={t('common.addQueue')}
            >
              <Plus className="h-4 w-4" />
              Adicionar à fila
            </button>
          </div>
        )}
      </footer>

      {/* ── PAINEL DE CONTROLES ── */}
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
            {(['acima', 'inline'] as Formato[]).map((item) => (
              <button key={item} className={`btn-ghost text-sm ${formato === item ? 'text-primaria' : ''}`} type="button" onClick={() => setFormato(item)}>
                {item === 'acima' ? 'Acima' : 'Inline'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Refrão', 'Ponte', 'Verso', 'Loop livre'].map((item) => <button key={item} className="btn-ghost justify-start" type="button">{item}</button>)}
          </div>
          <Metronomo />
          <button type="button" className="btn-ghost w-full" onClick={() => void alternarFavorita(musica.id)}>
            <Heart className={`h-5 w-5 ${musica.eFavorita ? 'fill-primaria text-primaria' : ''}`} />
            {t('common.favorite')}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setControleAberto(false); setBuscaAberta(true); }}>
            <Search className="h-4 w-4" />
            Adicionar à fila
          </button>
        </div>
      </PainelDeslizante>

      {/* ── PAINEL DE FILA ── */}
      <PainelDeslizante aberto={filaAberta} titulo="Fila" onClose={() => setFilaAberta(false)}>
        <BuscaInline consulta={consulta} setConsulta={setConsulta} resultados={resultados} onAdd={addQueue} placeholder={t('search.placeholder')} />
        <div className="mt-4 space-y-2">
          {proximasMusicas.map((item, index) => item ? (
            <div key={`${item.id}-${index}`} className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="min-w-0 truncate text-sm">{index + 1}. {item.titulo}</span>
              <span className="rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(162,89,255,0.2)', color: '#A259FF' }}>{item.tom}</span>
            </div>
          ) : null)}
        </div>
      </PainelDeslizante>

      {/* ── BUSCA MODAL ── */}
      {buscaAberta ? (
        <div className="fixed inset-0 z-40 p-4 pt-20" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }} onClick={() => setBuscaAberta(false)}>
          <section className="mx-auto max-w-lg rounded-2xl p-4" style={{ background: 'rgba(20,21,34,0.95)', border: '1px solid rgba(162,89,255,0.2)' }} onClick={(event) => event.stopPropagation()}>
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
        <input
          className="input pl-10"
          autoFocus
          value={consulta}
          onChange={(event) => setConsulta(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      <div className="mt-3 space-y-2">
        {resultados.map(({ musica }) => (
          <button
            key={musica.id}
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            onClick={() => onAdd(musica.id)}
          >
            <strong className="truncate text-sm">{musica.titulo}</strong>
            <span className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(162,89,255,0.2)', color: '#A259FF' }}>{musica.tom}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

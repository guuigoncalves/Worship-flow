import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { FilaProvider } from './hooks/useFila';
import { MedleysProvider } from './hooks/useMedleys';
import { MusicasProvider } from './hooks/useMusicas';
import { PerfilProvider } from './hooks/usePerfil';
import { ToastProvider } from './hooks/useToast';
import { PlayerProvider } from './hooks/usePlayer';
import { ErrorBoundary } from './components/compartilhado/ErrorBoundary';
import { IndicadorOffline } from './components/compartilhado/Indicador';
import { InstallBanner } from './components/compartilhado/InstallBanner';
import { NavegacaoInferior } from './components/compartilhado/NavegacaoInferior';
import { Toasts } from './components/compartilhado/Toast';
import { MiniPlayer } from './components/player/MiniPlayer';

const Inicio = lazy(() => import('./pages/Inicio'));
const Login = lazy(() => import('./pages/Login'));
const Biblioteca = lazy(() => import('./pages/Biblioteca'));
const DetalheMusica = lazy(() => import('./pages/DetalheMusica'));
const Tocar = lazy(() => import('./pages/Tocar'));
const BuscaRapida = lazy(() => import('./pages/BuscaRapida'));
const Medleys = lazy(() => import('./pages/Medleys'));
const EditorMedley = lazy(() => import('./pages/EditorMedley'));
const Editor = lazy(() => import('./pages/Editor'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Player = lazy(() => import('./pages/Player'));
const Albuns = lazy(() => import('./pages/Albuns'));
const Album = lazy(() => import('./pages/Album'));
const Artistas = lazy(() => import('./pages/Artistas'));
const Artista = lazy(() => import('./pages/Artista'));
const Espacos = lazy(() => import('./pages/Espacos'));
const Espaco = lazy(() => import('./pages/Espaco'));
const EntrarEspaco = lazy(() => import('./pages/EntrarEspaco'));
const Importar = lazy(() => import('./pages/Importar'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <PerfilProvider>
          <MusicasProvider>
            <MedleysProvider>
              <FilaProvider><PlayerProvider>{children}</PlayerProvider></FilaProvider>
            </MedleysProvider>
          </MusicasProvider>
        </PerfilProvider>
      </AuthProvider>
      <Toasts />
    </ToastProvider>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  if (loading) return <div className="app-page grid place-items-center text-textoSecundario">{t('common.loading')}</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

function Shell() {
  const location = useLocation();
  const performanceMode = location.pathname.startsWith('/tocar/');
  const publicAuthMode = location.pathname === '/login';
  const { t } = useTranslation();
  return (
    <ErrorBoundary fallback={<div className="app-page">{t('common.error')}</div>}>
      <IndicadorOffline />
      <Suspense fallback={<div className="app-page grid place-items-center text-textoSecundario">{t('common.loading')}</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/musica/:id" element={<DetalheMusica />} />
            <Route path="/tocar/:id" element={<Tocar />} />
            <Route path="/busca-rapida" element={<BuscaRapida />} />
            <Route path="/medleys" element={<Medleys />} />
            <Route path="/medley/:id" element={<EditorMedley />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/player" element={<Player />} />
            <Route path="/albuns" element={<Albuns />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/artistas" element={<Artistas />} />
            <Route path="/artista/:id" element={<Artista />} />
            <Route path="/espacos" element={<Espacos />} />
            <Route path="/espaco/:id" element={<Espaco />} />
            <Route path="/entrar/:codigo" element={<EntrarEspaco />} />
            <Route path="/importar" element={<Importar />} />
            <Route path="/adm" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Suspense>
      {!performanceMode && !publicAuthMode ? (
        <>
          <NavegacaoInferior />
          <MiniPlayer />
          <InstallBanner />
        </>
      ) : null}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Providers>
        <Shell />
      </Providers>
    </BrowserRouter>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { getIdToken } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export interface NavidromeAlbum {
  id: string;
  titulo: string;
  artista: string;
  ano?: number;
}

export interface NavidromeTrack {
  id: string;
  titulo: string;
  artista: string;
  albumId: string;
  duracao?: number;
  streamUrl: string;
}

export interface CamadaPrivadaState {
  autorizado: boolean;
  loading: boolean;
  erro: string | null;
  albuns: NavidromeAlbum[];
  faixasPorAlbum: Record<string, NavidromeTrack[]>;
  buscarFaixas: (albumId: string) => Promise<NavidromeTrack[]>;
  recarregar: () => void;
  solicitarMusica: (dados: { nomeMusica: string; artista: string; usuario: string }) => Promise<{ sucesso: boolean; mensagem: string }>;
}

export function useCamadaPrivada(): CamadaPrivadaState {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [albuns, setAlbuns] = useState<NavidromeAlbum[]>([]);
  const [faixasPorAlbum, setFaixasPorAlbum] = useState<Record<string, NavidromeTrack[]>>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const proxyUrl = import.meta.env.VITE_PRIVADO_PROXY_URL || import.meta.env.VITE_PROXY_URL || '';

  const navidromeUser = import.meta.env.VITE_NAVIDROME_USER || '';
  const navidromePass = import.meta.env.VITE_NAVIDROME_PASS || '';
  const subsonicParams = `u=${encodeURIComponent(navidromeUser)}&p=${encodeURIComponent(navidromePass)}&v=1.16.1&c=WorshipFlow&f=json`;

  const autorizado = useMemo(() => {
    if (!user || user.isAnonymous) return false;
    const allowlist = (import.meta.env.VITE_PRIVADO_ALLOWLIST || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    return allowlist.includes(user.uid);
  }, [user]);

  async function buscarToken(): Promise<string> {
    if (!auth.currentUser) return '';
    return getIdToken(auth.currentUser);
  }

  async function buscarAlbuns(): Promise<NavidromeAlbum[]> {
    if (!proxyUrl) {
      const mensagem = 'Proxy não configurado.';
      console.error('[Navidrome]', mensagem);
      setErro(mensagem);
      return [];
    }
    try {
      const token = await buscarToken();
      const url = `${proxyUrl}/navidrome/rest/getAlbumList2.view?${subsonicParams}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const texto = await response.text().catch(() => '');
        const mensagem = `Erro HTTP ${response.status} ao buscar álbuns no Navidrome.`;
        console.error('[Navidrome]', mensagem, response.status, texto);
        setErro(mensagem);
        return [];
      }
      const data = await response.json();
      const albums = data['subsonic-response']?.albumList2?.album ?? [];
      if (!albums.length) {
        const mensagem = 'Navidrome retornou lista de álbuns vazia.';
        console.error('[Navidrome]', mensagem, data);
        setErro(mensagem);
      } else {
        setErro(null);
      }
      return (albums as any[]).map((album) => ({
        id: album.id,
        titulo: album.title || 'Sem título',
        artista: album.artist || 'Desconhecido',
        ano: album.year,
      }));
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao buscar álbuns no Navidrome.';
      console.error('[Navidrome]', mensagem, err);
      setErro(mensagem);
      return [];
    }
  }

  async function buscarFaixas(albumId: string): Promise<NavidromeTrack[]> {
    if (faixasPorAlbum[albumId]) return faixasPorAlbum[albumId];
    if (!proxyUrl) {
      console.error('[Navidrome] Proxy não configurado ao buscar faixas.');
      return [];
    }
    try {
      const token = await buscarToken();
      const url = `${proxyUrl}/navidrome/rest/getAlbum.view?${subsonicParams}&id=${albumId}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const texto = await response.text().catch(() => '');
        const mensagem = `Erro HTTP ${response.status} ao buscar faixas do álbum ${albumId}.`;
        console.error('[Navidrome]', mensagem, response.status, texto);
        return [];
      }
      const data = await response.json();
      const songs = data['subsonic-response']?.album?.song ?? [];
      const tracks: NavidromeTrack[] = (songs as any[]).map((song) => ({
        id: song.id,
        titulo: song.title || 'Sem título',
        artista: song.artist || '',
        albumId,
        duracao: song.duration,
        streamUrl: `${proxyUrl}/navidrome/rest/stream.view?${subsonicParams}&id=${song.id}`,
      }));
      setFaixasPorAlbum((prev) => ({ ...prev, [albumId]: tracks }));
      return tracks;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : `Erro desconhecido ao buscar faixas do álbum ${albumId}.`;
      console.error('[Navidrome]', mensagem, err);
      return [];
    }
  }

  async function solicitarMusica(dados: { nomeMusica: string; artista: string; usuario: string }): Promise<{ sucesso: boolean; mensagem: string }> {
    if (!proxyUrl) {
      return { sucesso: false, mensagem: 'Proxy não configurado' };
    }
    const token = await buscarToken();
    const response = await fetch(`${proxyUrl}/n8n/pedido-musica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { sucesso: false, mensagem: data?.mensagem || 'Erro ao enviar pedido' };
    }
    return { sucesso: true, mensagem: data?.mensagem || 'Pedido enviado' };
  }

  function recarregar() {
    if (!autorizado) return;
    setLoading(true);
    setErro(null);
    buscarAlbuns()
      .then((albunsRes) => {
        setAlbuns(albunsRes);
        if (!albunsRes.length) {
          setErro('Nenhum álbum retornado pelo Navidrome. Verifique a configuração do proxy e as credenciais Subsonic.');
        }
      })
      .catch((err) => {
        const mensagem = err instanceof Error ? err.message : 'Erro ao carregar dados da camada privada.';
        console.error('[Navidrome] Falha ao recarregar álbuns.', err);
        setErro(mensagem);
        showToast(mensagem, 'erro');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!autorizado) {
      setAlbuns([]);
      setErro(null);
      return;
    }
    recarregar();
  }, [autorizado]);

  return { autorizado, loading, erro, albuns, faixasPorAlbum, buscarFaixas, recarregar, solicitarMusica };
}

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
    if (!proxyUrl) return [];
    const token = await buscarToken();
    const response = await fetch(`${proxyUrl}/navidrome/rest/getAlbumList2.view?${subsonicParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const albums = data['subsonic-response']?.albumList2?.album ?? [];
    return (albums as any[]).map((album) => ({
      id: album.id,
      titulo: album.title || 'Sem título',
      artista: album.artist || 'Desconhecido',
      ano: album.year,
    }));
  }

  async function buscarFaixas(albumId: string): Promise<NavidromeTrack[]> {
    if (faixasPorAlbum[albumId]) return faixasPorAlbum[albumId];
    if (!proxyUrl) return [];
    const token = await buscarToken();
    const response = await fetch(`${proxyUrl}/navidrome/rest/getAlbum.view?${subsonicParams}&id=${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
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
    buscarAlbuns()
      .then((albunsRes) => {
        setAlbuns(albunsRes);
      })
      .catch(() => {
        showToast('Erro ao carregar dados da camada privada', 'erro');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!autorizado) {
      setAlbuns([]);
      return;
    }
    recarregar();
  }, [autorizado]);

  return { autorizado, loading, albuns, faixasPorAlbum, buscarFaixas, recarregar, solicitarMusica };
}

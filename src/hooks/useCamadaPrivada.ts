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

export interface FrigateCamera {
  id: string;
  nome: string;
  streamUrl: string;
  snapshotUrl: string;
  online: boolean;
}

export interface CamadaPrivadaState {
  autorizado: boolean;
  loading: boolean;
  albuns: NavidromeAlbum[];
  cameras: FrigateCamera[];
  faixasPorAlbum: Record<string, NavidromeTrack[]>;
  buscarFaixas: (albumId: string) => Promise<NavidromeTrack[]>;
  recarregar: () => void;
}

export function useCamadaPrivada(): CamadaPrivadaState {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [albuns, setAlbuns] = useState<NavidromeAlbum[]>([]);
  const [cameras, setCameras] = useState<FrigateCamera[]>([]);
  const [faixasPorAlbum, setFaixasPorAlbum] = useState<Record<string, NavidromeTrack[]>>({});
  const [loading, setLoading] = useState(false);

  const proxyUrl = import.meta.env.VITE_PRIVADO_PROXY_URL || '';

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
    const response = await fetch(`${proxyUrl}/navidrome/soundi?method=getAlbumList2&f=json`, {
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
    const response = await fetch(`${proxyUrl}/navidrome/soundi?method=getAlbum&f=json&id=${albumId}`, {
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
      streamUrl: `${proxyUrl}/navidrome/soundi?method=stream&id=${song.id}`,
    }));
    setFaixasPorAlbum((prev) => ({ ...prev, [albumId]: tracks }));
    return tracks;
  }

  async function buscarCameras(): Promise<FrigateCamera[]> {
    if (!proxyUrl) return [];
    const token = await buscarToken();
    const response = await fetch(`${proxyUrl}/frigate/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const cams = data.cameras || {};
    return Object.entries(cams).map(([id, cam]: [string, any]) => ({
      id,
      nome: cam.display_name || id,
      streamUrl: `${proxyUrl}/frigate/${id}/hls/master.m3u8`,
      snapshotUrl: `${proxyUrl}/frigate/${id}/latest.jpg`,
      online: cam.enabled === true,
    }));
  }

  function recarregar() {
    if (!autorizado) return;
    setLoading(true);
    Promise.all([buscarAlbuns(), buscarCameras()])
      .then(([albunsRes, camerasRes]) => {
        setAlbuns(albunsRes);
        setCameras(camerasRes);
      })
      .catch(() => {
        showToast('Erro ao carregar dados da camada privada', 'erro');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!autorizado) {
      setAlbuns([]);
      setCameras([]);
      return;
    }
    recarregar();
  }, [autorizado]);

  return { autorizado, loading, albuns, cameras, faixasPorAlbum, buscarFaixas, recarregar };
}

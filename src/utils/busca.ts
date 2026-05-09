import type { Musica, ResultadoBusca } from '../types';

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\[[^\]]+]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function distanciaLevenshtein(a: string, b: string): number {
  const matriz = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matriz[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) matriz[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i]![j] = Math.min(matriz[i - 1]![j]! + 1, matriz[i]![j - 1]! + 1, matriz[i - 1]![j - 1]! + custo);
    }
  }
  return matriz[a.length]![b.length]!;
}

function pontuarCampo(campo: string, consulta: string, peso: number): number {
  const texto = normalizar(campo);
  const q = normalizar(consulta);
  if (!q) return 0;
  if (texto.includes(q)) return 20 * peso + Math.min(q.length, 12);
  const palavras = texto.split(' ');
  const termos = q.split(' ');
  let pontos = 0;
  for (const termo of termos) {
    for (const palavra of palavras) {
      if (!palavra) continue;
      const distancia = distanciaLevenshtein(palavra.slice(0, Math.max(termo.length, palavra.length)), termo);
      if (distancia <= 2) pontos += (3 - distancia) * peso;
    }
  }
  return pontos;
}

function recorteLetra(letra: string, consulta: string): string {
  const limpa = letra.replace(/\[[^\]]+]/g, '');
  const indice = normalizar(limpa).indexOf(normalizar(consulta));
  if (indice < 0) return limpa.slice(0, 110);
  return limpa.slice(Math.max(0, indice - 28), indice + consulta.length + 80);
}

export function buscarMusicas(musicas: Musica[], consulta: string, filtros: string[] = []): ResultadoBusca[] {
  const q = consulta.trim();
  const agora = Date.now();
  return musicas
    .filter((musica) => filtros.every((filtro) => filtro === 'tudo' || musica.tags.includes(filtro as never) || (filtro === 'favoritas' && musica.eFavorita)))
    .map((musica) => {
      const campos: ResultadoBusca['campos'] = [];
      const destaque: ResultadoBusca['destaque'] = {};
      const titulo = pontuarCampo(musica.titulo, q, 3);
      const artista = pontuarCampo(musica.artista, q, 2);
      const letra = pontuarCampo(musica.letra, q, 1);
      const tags = pontuarCampo(musica.tags.join(' '), q, 2);
      if (titulo > 0) {
        campos.push('titulo');
        destaque.titulo = musica.titulo;
      }
      if (artista > 0) {
        campos.push('artista');
        destaque.artista = musica.artista;
      }
      if (letra > 0) {
        campos.push('letra');
        destaque.letra = recorteLetra(musica.letra, q);
      }
      if (tags > 0) {
        campos.push('tags');
        destaque.tags = musica.tags.join(', ');
      }
      const tocadaEm = musica.ultimaTocada ? new Date(musica.ultimaTocada).getTime() : 0;
      const recente = tocadaEm > 0 ? Math.max(0, 8 - Math.floor((agora - tocadaEm) / 86_400_000)) : 0;
      const favorita = musica.eFavorita ? 8 : 0;
      const popular = Math.min(musica.vezesTocada, 20) * 0.6;
      const semConsulta = q.length === 0 ? 2 : 0;
      const pontuacao = titulo + artista + letra + tags + recente + favorita + popular + semConsulta;
      return { musica, pontuacao, campos, destaque };
    })
    .filter((resultado) => q.length === 0 || resultado.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao || a.musica.titulo.localeCompare(b.musica.titulo));
}

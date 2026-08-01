export type Tom = 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export type TagMusica =
  | 'adoracao'
  | 'louvor'
  | 'ministerio'
  | 'entrega'
  | 'cura'
  | 'espirito-santo'
  | 'congregacional'
  | 'declaracao'
  | 'gratidao';

export type Nivel = 'iniciante' | 'intermediario' | 'avancado';

export interface VersaoMusica {
  id: string;
  rotulo: string;
  tom: Tom;
  letra: string;
  capo?: number;
}

export interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  acordes: string[];
  letra: string;
  tags: TagMusica[];
  dificuldade: Nivel;
  eFavorita: boolean;
  vezesTocada: number;
  ultimaTocada: string | null;
  criadaEm: string;
  versoes: VersaoMusica[];
}

export interface BlocoMedley {
  id: string;
  tipo: 'musica' | 'verso' | 'refrao' | 'ponte' | 'instrumental' | 'pausa' | 'transicao' | 'espontaneo' | 'subida-tom';
  musicaId?: string;
  tituloMusica?: string;
  repeticoes: number;
  tom?: Tom;
  notas?: string;
  duracaoSegundos?: number;
}

export interface Medley {
  id: string;
  titulo: string;
  blocos: BlocoMedley[];
  criadoEm?: string;
  ultimaEdicao?: string;
}

export interface FilaReproducao {
  atual: string | null;
  proximas: string[];
  anteriores: string[];
}

export interface PerfilMusico {
  instrumento: string;
  nivel: Nivel;
  acordesProibidos: string[];
  tonsPreferidos: Tom[];
  preferirCapo: boolean;
  usarVersaoSimplificada: boolean;
  temaPadrao: 'escuro' | 'claro';
  idiomaApp: 'pt-BR' | 'en';
}

export interface UsuarioPerfil {
  nome: string;
  email: string;
  foto: string;
  instrumento: string;
  nivel: Nivel;
  criadoEm: string;
}

export interface HistoricoEntrada {
  id: string;
  musicaId: string;
  titulo: string;
  tom: Tom;
  tocadaEm: string;
}

export interface EstatisticasGeral {
  musicasMaisTocadas: Array<{ musicaId: string; titulo: string; contagem: number }>;
  musicasRecentes: Array<{ musicaId: string; titulo: string; tocadaEm: string }>;
  totalCultos: number;
  ultimoAcesso: string;
}

export interface Repertorio {
  id: string;
  titulo: string;
  musicaIds: string[];
  data: string;
  notas: string;
}

export interface ResultadoBusca {
  musica: Musica;
  pontuacao: number;
  campos: Array<'titulo' | 'artista' | 'letra' | 'tags'>;
  destaque: Partial<Record<'titulo' | 'artista' | 'letra' | 'tags', string>>;
}

export type PapelEspaco = 'dono' | 'admin' | 'editor' | 'leitor';

export interface Espaco {
  id: string;
  nome: string;
  tipo: 'ministerio' | 'banda' | 'estudo' | 'outro';
  donoUid: string;
  codigo: string;
  criadoEm: string;
}

export interface MembroEspaco {
  uid: string;
  nome: string;
  papel: PapelEspaco;
  entrouEm: string;
}

// Cópia da música dentro do espaço — deliberadamente desacoplada da música
// pessoal de quem compartilhou (edições no espaço não vazam pra biblioteca
// pessoal de ninguém, e vice-versa).
export interface MusicaEspaco {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  letra: string;
  compartilhadaPor: string;
  compartilhadaEm: string;
}

export type StatusMusica = 'pendente' | 'aprovada' | 'rejeitada';

export interface MusicaComunidade {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  letra: string;
  acordes: string[];
  tags: TagMusica[];
  dificuldade: Nivel;
  status: StatusMusica;
  enviadaPor: string;
  enviadaEm: string;
  aprovadaEm?: string;
  rejeitadaEm?: string;
}

export interface Playlist {
  id: string;
  nome: string;
  descricao?: string;
  faixas: string[];
  criadaEm: string;
  atualizadaEm: string;
}

export interface ToastMessage {
  id: string;
  tipo: 'sucesso' | 'erro' | 'info';
  texto: string;
}

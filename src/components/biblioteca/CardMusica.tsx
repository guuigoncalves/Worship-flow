import { Edit3, Play, Plus, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Musica } from '../../types';
import { COR_TOM } from '../../data/cores-tom';

interface CardMusicaProps {
  musica: Musica;
  compacto?: boolean;
  temAcordeProibido?: boolean;
  onFavorite: () => void;
  onQueue: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function CardMusica({ musica, compacto, temAcordeProibido, onFavorite, onQueue, onDelete, onDuplicate }: CardMusicaProps) {
  const { t } = useTranslation();
  const cor = COR_TOM[musica.tom];
  return (
    <article className={`card pressable flex min-w-0 flex-col gap-3 p-4 ${compacto ? 'w-[228px] flex-none' : ''}`} style={{ borderLeft: `3px solid ${cor}` }}>
      <div className="flex items-start justify-between gap-3">
        <Link to={`/musica/${musica.id}`} className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-lg font-bold">{musica.titulo}</h3>
          <p className="m-0 truncate text-sm text-textoSecundario">{musica.artista}</p>
        </Link>
        <button type="button" onClick={onFavorite} className="rounded p-1 text-primaria" aria-label={t('common.favorite')}>
          <Star className={`h-5 w-5 ${musica.eFavorita ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-textoSecundario">
        <span className="rounded px-2 py-1 font-bold text-black" style={{ backgroundColor: cor }}>{musica.tom}</span>
        <span className="rounded bg-elevada px-2 py-1">{musica.dificuldade}</span>
        <span className="rounded bg-elevada px-2 py-1">{musica.vezesTocada} {t('song.plays')}</span>
        {temAcordeProibido ? <span className="rounded bg-perigo/20 px-2 py-1 text-perigo">{t('library.forbidden')}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={`/tocar/${musica.id}`} className="btn-primary flex-1">
          <Play className="h-4 w-4" aria-hidden="true" />
          {t('song.play')}
        </Link>
        <button type="button" onClick={onQueue} className="btn-ghost h-11 w-11 p-0" aria-label={t('common.addQueue')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <Link to={`/editor/${musica.id}`} className="btn-ghost h-11 w-11 p-0" aria-label={t('common.edit')}>
          <Edit3 className="h-4 w-4" aria-hidden="true" />
        </Link>
        {onDuplicate ? (
          <button type="button" onClick={onDuplicate} className="btn-ghost h-11 px-3 text-xs">
            {t('common.duplicate')}
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" onClick={onDelete} className="btn-ghost h-11 w-11 p-0 text-perigo" aria-label={t('common.delete')}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

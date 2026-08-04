import { acordeAlternativoFacil, formatarBlocoCifra, normalizarAcorde } from '../../utils/acordes';

interface ExibicaoCifraProps {
  letra: string;
  acordesProibidos: string[];
  modo: 'cifra' | 'letra' | 'ambos';
  tamanho: 'pequeno' | 'medio' | 'grande' | 'extra';
  possuiCifra?: boolean;
  formato?: 'acima' | 'inline';
}

const tamanhos = {
  pequeno: 'text-[clamp(16px,4vw,22px)]',
  medio: 'text-[clamp(18px,5vw,26px)]',
  grande: 'text-[clamp(21px,6vw,31px)]',
  extra: 'text-[clamp(24px,7vw,38px)]'
};

export function ExibicaoCifra({ letra, acordesProibidos, modo, tamanho, possuiCifra = true, formato = 'acima' }: ExibicaoCifraProps) {
  if (!possuiCifra) {
    return (
      <div className={`font-mono leading-[1.75] text-texto ${tamanhos[tamanho]}`}>
        <div className="whitespace-pre-wrap break-words">{letra || 'Nenhuma letra cadastrada para esta música.'}</div>
      </div>
    );
  }

  if (formato === 'inline' || modo === 'letra') {
    const proibidos = acordesProibidos.map(normalizarAcorde);
    const linhas = letra.split(/\r?\n/);
    return (
      <div className={`font-mono leading-[1.75] text-texto ${tamanhos[tamanho]}`}>
        {linhas.map((linha, linhaIndex) => (
          <div key={`${linha}-${linhaIndex}`} className="min-h-[2.5em] whitespace-pre-wrap break-words">
            {modo === 'letra' ? (
              <span>{linha || ' '}</span>
            ) : (
              renderLinhaInline(linha, proibidos)
            )}
          </div>
        ))}
      </div>
    );
  }

  const linhas = letra.split(/\r?\n/);
  return (
    <div className={`font-mono leading-[1.75] text-texto ${tamanhos[tamanho]}`}>
      {linhas.map((linha, linhaIndex) => {
        const { acordes, texto } = formatarBlocoCifra(linha);
        const isAmbos = modo === 'ambos';
        return (
          <div key={`${linha}-${linhaIndex}`} className="min-h-[2.5em]">
            <div className="text-primaria leading-none">
              <span className="whitespace-pre-wrap break-words">{acordes || '\u00A0'}</span>
            </div>
            {isAmbos && (
              <div className="whitespace-pre-wrap break-words">{texto || '\u00A0'}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderLinhaInline(linha: string, proibidos: string[]) {
  const partes = linha.split(/(\[[^\]]+])/g).filter(Boolean);
  let pendente: string | null = null;
  return partes.map((parte, index) => {
    const acorde = parte.match(/^\[([^\]]+)]$/)?.[1];
    if (acorde) {
      pendente = acorde;
      const proibido = proibidos.includes(normalizarAcorde(acorde));
      return (
        <button
          key={`${parte}-${index}`}
          type="button"
          title={proibido ? acordeAlternativoFacil(acorde) : acorde}
          className={`mr-2 inline-flex items-center justify-center rounded-lg bg-elevada px-2 py-0.5 align-top text-[0.72em] font-bold shadow-md ${proibido ? 'bg-perigo/40 text-[#ffd6d6]' : 'text-primaria'}`}
        >
          {acorde}
        </button>
      );
    }
    const texto = parte || ' ';
    const acordeAtual = pendente;
    pendente = null;
    const proibido = acordeAtual ? proibidos.includes(normalizarAcorde(acordeAtual)) : false;
    return (
      <span key={`${parte}-${index}`} className="relative mr-1 inline-block pt-[1.05em] align-top">
        {acordeAtual ? (
          <button
            type="button"
            title={proibido ? acordeAlternativoFacil(acordeAtual) : acordeAtual}
            className={`absolute left-0 top-0 inline-flex items-center justify-center rounded-lg bg-elevada px-1.5 py-0.5 text-[0.62em] font-bold leading-none shadow ${proibido ? 'bg-perigo/40 text-[#ffd6d6]' : 'text-primaria'}`}
          >
            {acordeAtual}
          </button>
        ) : null}
        <span>{texto}</span>
      </span>
    );
  });
}

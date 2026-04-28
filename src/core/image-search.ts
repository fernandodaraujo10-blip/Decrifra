export type MediaType = 'movie' | 'book' | 'music';

export async function fetchDynamicImage(title: string, type: MediaType): Promise<string | null> {
  const query = encodeURIComponent(title);
  
  if (type === 'book') {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&maxResults=1`);
      const data = await res.json();
      const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (thumbnail) {
        return thumbnail.replace('http:', 'https:').replace('&edge=curl', '');
      }
    } catch (e) {
      console.warn('Erro ao buscar imagem de livro', e);
    }
  }
  
  if (type === 'music') {
    try {
      // Usamos a API pública do iTunes para buscar a capa do álbum/música (sem necessidade de token)
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      const artwork = data.results?.[0]?.artworkUrl100;
      if (artwork) {
        return artwork.replace('100x100bb', '600x600bb'); // alta resolução
      }
    } catch (e) {
      console.warn('Erro ao buscar imagem de música', e);
    }
  }

  if (type === 'movie') {
    try {
      const { runUnifiedSearch } = await import('./search-engine');
      const results = await runUnifiedSearch(title);
      if (results && results.length > 0 && results[0].poster) {
        return results[0].poster;
      }
    } catch (e) {
      console.warn('Erro ao buscar poster do filme', e);
    }
  }
  
  return null;
}

// Em src/core/image-search.ts adicionamos um hook para o cache
const imageCache = new Map<string, string>();

export function getCachedImage(title: string, type: MediaType): string | null {
  return imageCache.get(`${type}-${title.toLowerCase()}`) || null;
}

export function setCachedImage(title: string, type: MediaType, url: string) {
  imageCache.set(`${type}-${title.toLowerCase()}`, url);
}

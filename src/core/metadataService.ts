
export interface BookMetadata {
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  rating: number;
}

export async function fetchBookMetadata(query: string): Promise<BookMetadata | null> {
  if (!query || query.length < 3) return null;
  
  console.log(`[MetadataService] Buscando metadados para: "${query}"`);
  
  try {
    // Busca mais ampla (removendo intitle: para maior chance de acerto)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`[MetadataService] Resposta da API para "${query}":`, data.totalItems, "itens encontrados");

    if (data.items && data.items.length > 0) {
      const volumeInfo = data.items[0].volumeInfo;
      
      // Tentar pegar uma imagem maior se disponível
      const img = volumeInfo.imageLinks?.thumbnail || 
                  volumeInfo.imageLinks?.smallThumbnail || 
                  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=500&auto=format&fit=crop';

      // Normalização da nota para 1-10
      const googleRating = volumeInfo.averageRating || 4.2; // Fallback generoso
      const normalizedRating = Math.min(10, googleRating * 2);

      const meta = {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
        description: volumeInfo.description || 'Sem descrição disponível.',
        coverUrl: img.replace('http:', 'https:'),
        rating: Number(normalizedRating.toFixed(1)),
      };
      
      console.log(`[MetadataService] Metadados extraídos:`, meta.title);
      return meta;
    }
    
    console.warn(`[MetadataService] Nenhum livro encontrado para: "${query}"`);
    return null;
  } catch (error) {
    console.error("[MetadataService] Erro ao buscar metadados do livro:", error);
    return null;
  }
}

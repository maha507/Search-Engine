export interface EmbeddingPoint {
    id: string;
    vector: number[];
    payload: {
        text: string;
        filename: string;
        file_type: string;
        chunk_index: number;
        total_chunks: number;
        chunk_length: number;
        timestamp: string;
    };
}

export interface SearchResult {
    score: number;
    text: string;
    filename: string;
    chunk_index: number;
    file_type: string;
}

export function validateEmbedding(embedding: any): boolean {
    return Array.isArray(embedding) && embedding.length > 0 && embedding.every(num => typeof num === 'number');
}
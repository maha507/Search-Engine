interface OllamaEmbeddingResponse {
    embedding: number[];
}

export class OllamaService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }

    async getEmbedding(text: string): Promise<number[]> {
        try {
            console.log('🧠 Generating embedding for text');
            console.log('Getting embedding from:', `${this.baseUrl}/api/embeddings`);

            const response = await fetch(`${this.baseUrl}/api/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'nomic-embed-text',
                    prompt: text,
                }),
            });

            console.log('Ollama response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ollama error response:', errorText);
                throw new Error(`Ollama embedding error: ${response.status} - ${errorText}`);
            }

            const data: OllamaEmbeddingResponse = await response.json();

            // Validate embedding
            if (!data.embedding || !Array.isArray(data.embedding)) {
                throw new Error('Invalid embedding response from Ollama');
            }

            console.log('🔍 Embedding debug:');
            console.log('- Type:', typeof data.embedding);
            console.log('- Is Array:', Array.isArray(data.embedding));
            console.log('- Length:', data.embedding.length);
            console.log('- Sample values:', data.embedding.slice(0, 5));
            console.log('- All numbers?:', data.embedding.every(v => typeof v === 'number'));

            return data.embedding;
        } catch (error) {
            console.error('❌ Error getting embedding:', error);
            throw error;
        }
    }
}

export const ollamaService = new OllamaService();
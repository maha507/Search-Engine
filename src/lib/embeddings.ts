import { pipeline } from '@xenova/transformers';

class EmbeddingService {
    private model: any = null;
    private isLoading = false;

    async loadModel() {
        if (this.model || this.isLoading) {
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.model;
        }

        this.isLoading = true;
        try {
            console.log('Loading embedding model...');
            this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('Embedding model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }

        return this.model;
    }

    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        const model = await this.loadModel();

        const embeddings: number[][] = [];

        for (const text of texts) {
            try {
                const result = await model(text, { pooling: 'mean', normalize: true });
                embeddings.push(Array.from(result.data));
            } catch (error) {
                console.error('Error generating embedding for text:', error);
                // Add zero vector as fallback
                embeddings.push(new Array(384).fill(0));
            }
        }

        return embeddings;
    }

    async generateSingleEmbedding(text: string): Promise<number[]> {
        const embeddings = await this.generateEmbeddings([text]);
        return embeddings[0];
    }
}

export const embeddingService = new EmbeddingService();
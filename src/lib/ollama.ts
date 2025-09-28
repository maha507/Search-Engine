import { Ollama } from 'ollama';

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: text,
        });

        return response.embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

export async function generateText(prompt: string, model: string = 'llama2'): Promise<string> {
    try {
        const response = await ollama.generate({
            model: model,
            prompt: prompt,
        });

        return response.response;
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
}
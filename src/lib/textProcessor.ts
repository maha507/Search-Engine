export function splitTextIntelligently(text: string, maxChunkSize: number = 800): string[] {
    const chunks: string[] = [];

    // First, split by paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    let currentChunk = "";

    for (const paragraph of paragraphs) {
        // If paragraph is too long, split by sentences
        if (paragraph.length > maxChunkSize) {
            // Save current chunk if it exists
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }

            // Split long paragraph by sentences
            const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);

            for (const sentence of sentences) {
                const trimmedSentence = sentence.trim() + '.';

                if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
                    if (currentChunk.trim()) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = trimmedSentence;
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
                }
            }
        } else {
            // Check if adding this paragraph would exceed chunk size
            if (currentChunk.length + paragraph.length > maxChunkSize) {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = paragraph;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }
    }

    // Add the last chunk
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    // Filter out very short chunks (less than 50 characters)
    return chunks.filter(chunk => chunk.length >= 50);
}

export function splitTextSimple(text: string, chunkSize: number): string[] {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }
    }

    return chunks;
}
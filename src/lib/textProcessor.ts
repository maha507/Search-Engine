import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { DocumentChunk } from './qdrant';

export class TextProcessor {
    private chunkSize = 1000;
    private chunkOverlap = 200;

    async processFile(file: Buffer, filename: string, mimeType: string): Promise<DocumentChunk[]> {
        let text: string;

        try {
            switch (mimeType) {
                case 'text/plain':
                    text = file.toString('utf-8');
                    break;
                case 'application/pdf':
                    const pdfData = await pdfParse(file);
                    text = pdfData.text;
                    break;
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    const docResult = await mammoth.extractRawText({ buffer: file });
                    text = docResult.value;
                    break;
                default:
                    throw new Error(`Unsupported file type: ${mimeType}`);
            }

            return this.chunkText(text, filename, mimeType);
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }

    private chunkText(text: string, filename: string, fileType: string): DocumentChunk[] {
        const chunks: DocumentChunk[] = [];
        const cleanText = text.replace(/\s+/g, ' ').trim();

        if (cleanText.length === 0) {
            throw new Error('No text content found in file');
        }

        let start = 0;
        let chunkIndex = 0;

        while (start < cleanText.length) {
            const end = Math.min(start + this.chunkSize, cleanText.length);
            let chunkText = cleanText.slice(start, end);

            // Try to break at word boundary
            if (end < cleanText.length) {
                const lastSpaceIndex = chunkText.lastIndexOf(' ');
                if (lastSpaceIndex > this.chunkSize * 0.7) {
                    chunkText = chunkText.slice(0, lastSpaceIndex);
                }
            }

            chunks.push({
                id: uuidv4(),
                text: chunkText.trim(),
                filename,
                chunkIndex,
                metadata: {
                    fileType,
                    uploadedAt: new Date().toISOString(),
                    totalChunks: 0, // Will be updated after all chunks are created
                },
            });

            start += chunkText.length - this.chunkOverlap;
            chunkIndex++;
        }

        // Update total chunks count
        chunks.forEach(chunk => {
            chunk.metadata.totalChunks = chunks.length;
        });

        return chunks;
    }
}

export const textProcessor = new TextProcessor();
import { QdrantClient } from '@qdrant/js-client-rest';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'local_search_documents';

export const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
});

export interface DocumentChunk {
    id: string;
    text: string;
    filename: string;
    chunkIndex: number;
    metadata: {
        fileType: string;
        uploadedAt: string;
        totalChunks: number;
    };
}

export class QdrantService {
    async initializeCollection(): Promise<void> {
        try {
            const collections = await qdrantClient.getCollections();
            const collectionExists = collections.collections.some(
                col => col.name === COLLECTION_NAME
            );

            if (!collectionExists) {
                await qdrantClient.createCollection(COLLECTION_NAME, {
                    vectors: {
                        size: 384,
                        distance: 'Cosine',
                    },
                });
                console.log(`Collection ${COLLECTION_NAME} created successfully`);
            } else {
                console.log(`Collection ${COLLECTION_NAME} already exists`);
            }
        } catch (error) {
            console.error('Error initializing collection:', error);
            throw error;
        }
    }

    async addDocuments(chunks: DocumentChunk[], embeddings: number[][]): Promise<void> {
        try {
            const points = chunks.map((chunk, index) => ({
                id: chunk.id,
                vector: embeddings[index],
                payload: {
                    text: chunk.text,
                    filename: chunk.filename,
                    chunkIndex: chunk.chunkIndex,
                    metadata: chunk.metadata,
                },
            }));

            await qdrantClient.upsert(COLLECTION_NAME, {
                wait: true,
                points: points,
            });

            console.log(`Added ${points.length} document chunks to Qdrant`);
        } catch (error) {
            console.error('Error adding documents to Qdrant:', error);
            throw error;
        }
    }

    async searchDocuments(queryEmbedding: number[], limit: number = 10) {
        try {
            const searchResult = await qdrantClient.search(COLLECTION_NAME, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true,
            });

            return searchResult;
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    }

    async getCollectionInfo() {
        try {
            const info = await qdrantClient.getCollection(COLLECTION_NAME);
            return info;
        } catch (error) {
            console.error('Error getting collection info:', error);
            return null;
        }
    }

    async deleteDocument(filename: string): Promise<void> {
        try {
            await qdrantClient.delete(COLLECTION_NAME, {
                filter: {
                    must: [
                        {
                            key: 'filename',
                            match: { value: filename }
                        }
                    ]
                }
            });
            console.log(`Deleted documents for file: ${filename}`);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }
}

export const qdrantService = new QdrantService();
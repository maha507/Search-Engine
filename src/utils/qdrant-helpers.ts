import qdrantClient from '@/lib/qdrant';

export const COLLECTION_NAME = process.env.COLLECTION_NAME || 'documents';

export interface DocumentMetadata {
    title: string;
    fileType: string;
    fileSize: number;
    contentLength: number;
    content?: string;
}

// Ensure collection exists with correct configuration
export async function ensureCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        const exists = collections.collections.find(
            (collection: any) => collection.name === COLLECTION_NAME
        );

        if (exists) {
            console.log(`✅ Collection ${COLLECTION_NAME} already exists`);
            return;
        }

        console.log(`🏗️ Creating collection ${COLLECTION_NAME} with 768 dimensions...`);

        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: {
                size: 768, // nomic-embed-text uses 768 dimensions
                distance: 'Cosine',
            },
        });

        console.log(`✅ Collection ${COLLECTION_NAME} created successfully`);
    } catch (error) {
        console.error('❌ Error ensuring collection:', error);
        throw error;
    }
}

// Add document to Qdrant
export async function addDocument(
    id: string,
    vector: number[],
    metadata: DocumentMetadata
): Promise<void> {
    try {
        console.log(`💾 Adding document to Qdrant with ID: ${id}`);

        await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id: id,
                    vector: vector,
                    payload: {
                        ...metadata,
                        id: id,
                        timestamp: new Date().toISOString(),
                    },
                },
            ],
        });

        console.log(`✅ Document ${id} added successfully`);
    } catch (error) {
        console.error('❌ Error adding document:', error);
        throw new Error(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Get all documents
export async function getAllDocuments() {
    try {
        console.log(`📋 Getting all documents from ${COLLECTION_NAME}...`);

        const result = await qdrantClient.scroll(COLLECTION_NAME, {
            limit: 100,
            with_payload: true,
            with_vector: false,
        });

        const documents = result.points.map((point: any) => ({
            id: point.id,
            ...point.payload,
        }));

        console.log(`✅ Found ${documents.length} documents`);
        return documents;
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        throw error;
    }
}

// Search documents
export async function searchDocuments(
    vector: number[],
    limit: number = 5
) {
    try {
        const result = await qdrantClient.search(COLLECTION_NAME, {
            vector,
            limit,
            with_payload: true,
            with_vector: false,
        });

        return result.map((item: any) => ({
            id: item.id,
            score: item.score,
            ...item.payload,
        }));
    } catch (error) {
        console.error('❌ Error searching documents:', error);
        throw error;
    }
}
import { QdrantClient } from '@qdrant/js-client-rest';

// Create and configure the Qdrant client for cloud
export const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});

export async function ensureCollection(
    collectionName: string = process.env.COLLECTION_NAME || "my-collection",
    vectorSize: number = 1536,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
) {
    try {
        console.log(`Checking if collection ${collectionName} exists...`);

        // Check if collection exists
        await qdrant.getCollection(collectionName);
        console.log(`Collection ${collectionName} already exists`);
        return true;
    } catch (error) {
        // Collection doesn't exist, create it
        console.log(`Creating collection: ${collectionName}`);
        try {
            await qdrant.createCollection(collectionName, {
                vectors: {
                    size: vectorSize,
                    distance: distance,
                },
            });
            console.log(`Successfully created collection: ${collectionName}`);
            return true;
        } catch (createError) {
            console.error(`Failed to create collection ${collectionName}:`, createError);
            throw createError;
        }
    }
}

export default qdrant;
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({ url: "http://localhost:6333" });

export async function ensureCollection() {
    try {
        await qdrant.getCollection("documents");
    } catch {
        await qdrant.createCollection("documents", {
            vectors: { size: 1536, distance: "Cosine" }
        });
    }
}

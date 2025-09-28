import { NextRequest, NextResponse } from "next/server";
import { qdrant } from "@/lib/qdrant";
import { generateEmbedding } from "@/lib/ollama";

export async function POST(request: NextRequest) {
    try {
        const { query, limit = 5, score_threshold = 0.7 } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const queryEmbedding = await generateEmbedding(query);

        const searchResult = await qdrant.search("documents", {
            vector: queryEmbedding,
            limit: limit,
            score_threshold: score_threshold,
            with_payload: true,
        });

        const results = searchResult.map((result) => ({
            score: result.score,
            text: result.payload?.text,
            filename: result.payload?.filename,
            chunk_index: result.payload?.chunk_index,
            file_type: result.payload?.file_type,
            timestamp: result.payload?.timestamp,
        }));

        return NextResponse.json({
            query,
            results,
            total_results: results.length,
        });

    } catch (error) {
        console.error("Error searching:", error);
        return NextResponse.json(
            {
                error: "Failed to search",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { qdrant } from "@/lib/qdrant";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('=== Documents API called ===');

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const collectionName = process.env.COLLECTION_NAME || "my-collection";

        console.log('Fetching documents from collection:', collectionName);

        const result = await qdrant.scroll(collectionName, {
            limit,
            offset,
            with_payload: true,
        });

        console.log('Qdrant response:', result.points.length, 'points');

        const documents = result.points.map(point => ({
            id: point.id,
            filename: point.payload?.filename || 'Unknown',
            file_type: point.payload?.file_type || 'Unknown',
            chunk_index: point.payload?.chunk_index || 0,
            total_chunks: point.payload?.total_chunks || 1,
            timestamp: point.payload?.timestamp || new Date().toISOString(),
            text_preview: point.payload?.text?.substring(0, 200) + "..." || 'No preview',
            full_text_length: point.payload?.full_text_length || 0
        }));

        return NextResponse.json({
            documents,
            total_count: result.points.length,
            has_more: result.next_page_offset !== null,
            collection: collectionName
        });

    } catch (error) {
        console.error("=== Documents API Error ===");
        console.error("Error fetching documents:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch documents",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");
        const collectionName = process.env.COLLECTION_NAME || "my-collection";

        if (!filename) {
            return NextResponse.json({ error: "Filename is required" }, { status: 400 });
        }

        await qdrant.delete(collectionName, {
            filter: {
                must: [
                    {
                        key: "filename",
                        match: { value: filename }
                    }
                ]
            }
        });

        return NextResponse.json({
            message: `All chunks for ${filename} deleted successfully`
        });

    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
}
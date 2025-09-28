import { NextRequest, NextResponse } from "next/server";
import { qdrant, deleteCollection } from "@/lib/qdrant";

export async function GET() {
    try {
        const collections = await qdrant.getCollections();
        return NextResponse.json(collections);
    } catch (error) {
        console.error("Error fetching collections:", error);
        return NextResponse.json(
            { error: "Failed to fetch collections" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectionName = searchParams.get("name");

        if (!collectionName) {
            return NextResponse.json(
                { error: "Collection name is required" },
                { status: 400 }
            );
        }

        const result = await deleteCollection(collectionName);

        if (result.success) {
            return NextResponse.json({ message: `Collection ${collectionName} deleted successfully` });
        } else {
            return NextResponse.json(
                { error: "Failed to delete collection" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error deleting collection:", error);
        return NextResponse.json(
            { error: "Failed to delete collection" },
            { status: 500 }
        );
    }
}
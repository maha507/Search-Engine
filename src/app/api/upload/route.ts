import { NextRequest, NextResponse } from "next/server";
import { qdrant } from "@/lib/qdrant";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('=== Upload API called ===');

    try {
        const collectionName = process.env.COLLECTION_NAME || "my-collection";

        // First, get the EXISTING collection info to see what vector size it uses
        console.log('1. Getting existing collection info...');
        let collection;
        try {
            collection = await qdrant.getCollection(collectionName);
            console.log('Collection config:', JSON.stringify(collection.config?.params?.vectors, null, 2));
        } catch (error) {
            return NextResponse.json({
                error: "Collection doesn't exist",
                details: "Please create the collection first or check the collection name"
            }, { status: 400 });
        }

        // Get the actual vector size from the collection
        const actualVectorSize = collection.config?.params?.vectors?.size;
        if (!actualVectorSize) {
            return NextResponse.json({
                error: "Cannot determine vector size from collection",
                details: "Collection configuration is invalid"
            }, { status: 400 });
        }

        console.log('Collection expects vectors of size:', actualVectorSize);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log('2. Processing file:', file.name, file.type, 'size:', file.size, 'bytes');

        // Read file content
        const buffer = Buffer.from(await file.arrayBuffer());
        let textContent = '';

        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            textContent = buffer.toString('utf-8');
        } else {
            return NextResponse.json({
                error: "Only .txt files supported currently"
            }, { status: 400 });
        }

        if (!textContent.trim()) {
            return NextResponse.json({
                error: "No text content found"
            }, { status: 400 });
        }

        console.log('3. Text extracted, length:', textContent.length);

        // Split text into smaller chunks to avoid payload issues
        const chunkSize = 500; // Smaller chunks
        const chunks = [];

        if (textContent.length <= chunkSize) {
            chunks.push(textContent);
        } else {
            for (let i = 0; i < textContent.length; i += chunkSize) {
                chunks.push(textContent.substring(i, i + chunkSize));
            }
        }

        console.log('4. Text split into', chunks.length, 'chunks');

        // Create points with SAFE IDs and correct vector size
        const timestamp = Date.now();
        const fileBaseName = file.name.replace(/[^a-zA-Z0-9]/g, '_'); // Safe filename

        const points = chunks.map((chunk, index) => ({
            id: `${timestamp}_${fileBaseName}_${index}`, // Safe ID format
            vector: Array.from({ length: actualVectorSize }, () => Math.random()), // Use actual vector size
            payload: {
                filename: file.name,
                file_type: file.type,
                chunk_index: index,
                total_chunks: chunks.length,
                text: chunk,
                timestamp: new Date().toISOString(),
                full_text_length: textContent.length
            }
        }));

        console.log('5. Created', points.length, 'points');
        console.log('Sample point:', {
            id: points[0].id,
            vectorLength: points[0].vector.length,
            payloadKeys: Object.keys(points[0].payload)
        });

        // Insert points individually to catch specific errors
        let successCount = 0;
        let lastError = null;

        for (let i = 0; i < points.length; i++) {
            try {
                console.log(`Inserting point ${i + 1}/${points.length}...`);
                await qdrant.upsert(collectionName, {
                    wait: true,
                    points: [points[i]]
                });
                successCount++;
                console.log(`Successfully inserted point ${i + 1}`);
            } catch (pointError) {
                console.error(`Failed to insert point ${i + 1}:`, pointError);
                lastError = pointError;
                // Continue with other points instead of failing completely
            }
        }

        if (successCount === 0) {
            return NextResponse.json({
                error: "Failed to insert any points",
                details: lastError instanceof Error ? lastError.message : "Unknown error",
                vectorSizeUsed: actualVectorSize,
                samplePointId: points[0]?.id
            }, { status: 500 });
        }

        console.log(`6. Successfully inserted ${successCount}/${points.length} points`);

        return NextResponse.json({
            message: "File uploaded successfully",
            filename: file.name,
            chunks_processed: successCount,
            total_chunks: chunks.length,
            textLength: textContent.length,
            collection: collectionName,
            vectorSize: actualVectorSize,
            failedChunks: points.length - successCount
        });

    } catch (error) {
        console.error('=== Upload Error ===');
        console.error('Error details:', error);

        return NextResponse.json({
            error: "Upload failed",
            details: error instanceof Error ? error.message : "Unknown error",
            errorType: error?.constructor?.name
        }, { status: 500 });
    }
}
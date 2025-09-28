import { NextRequest, NextResponse } from 'next/server';
import { qdrantService } from '@/lib/qdrant';

export async function GET() {
    try {
        const collectionInfo = await qdrantService.getCollectionInfo();

        return NextResponse.json({
            success: true,
            collection: collectionInfo,
        });
    } catch (error) {
        console.error('Collection info error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get collection info' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, filename } = await request.json();

        if (action === 'delete' && filename) {
            await qdrantService.deleteDocument(filename);
            return NextResponse.json({
                success: true,
                message: `Deleted documents for ${filename}`,
            });
        }

        if (action === 'initialize') {
            await qdrantService.initializeCollection();
            return NextResponse.json({
                success: true,
                message: 'Collection initialized',
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Collection action error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Action failed' },
            { status: 500 }
        );
    }
}
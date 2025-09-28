'use client';

import { useState, useEffect } from 'react';

interface CollectionInfo {
    status: string;
    optimizer_status: string;
    vectors_count: number;
    indexed_vectors_count: number;
    points_count: number;
}

export default function CollectionManager() {
    const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCollectionInfo = async () => {
        try {
            const response = await fetch('/api/collections');
            const data = await response.json();
            if (data.success && data.collection) {
                setCollectionInfo(data.collection);
            }
        } catch (error) {
            console.error('Error fetching collection info:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializeCollection = async () => {
        try {
            const response = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'initialize' }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchCollectionInfo();
            }
        } catch (error) {
            console.error('Error initializing collection:', error);
        }
    };

    useEffect(() => {
        fetchCollectionInfo();
    }, []);

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Collection Status</h3>

            {loading ? (
                <div>Loading collection info...</div>
            ) : collectionInfo ? (
                <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> {collectionInfo.status}</div>
                    <div><strong>Points Count:</strong> {collectionInfo.points_count}</div>
                    <div><strong>Vectors Count:</strong> {collectionInfo.vectors_count}</div>
                    <div><strong>Indexed Vectors:</strong> {collectionInfo.indexed_vectors_count}</div>
                    <div><strong>Optimizer Status:</strong> {collectionInfo.optimizer_status}</div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="text-red-600">Collection not found or not accessible</div>
                    <button
                        onClick={initializeCollection}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                    >
                        Initialize Collection
                    </button>
                </div>
            )}

            <button
                onClick={fetchCollectionInfo}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
                Refresh
            </button>
        </div>
    );
}
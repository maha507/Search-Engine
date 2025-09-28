"use client";
import React, { useState, useEffect } from 'react';

interface Document {
    title: string;
    uploadedAt: string;
    fileType: string;
    chunks: Array<{
        content: string;
        chunkIndex: number;
    }>;
}

export default function DocumentList({ refresh }: { refresh: number }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, [refresh]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/documents');
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow-md">Loading documents...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>

            {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet.</p>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-800">{doc.title}</h3>
                                <span className="text-sm text-gray-500">{doc.fileType}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                Chunks: {doc.chunks.length}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
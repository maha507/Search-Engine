"use client";

import { useState } from 'react';
import DocumentUpload from '@/app/components/DocumentUpload';
import SearchInterface from '@/app/components/SearchInterface';
import DocumentList from '@/app/components/DocumentList';

export default function Home() {
    const [refreshCounter, setRefreshCounter] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshCounter(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Document Search Engine
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Upload documents and ask questions to get AI-powered answers
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                        <DocumentList refresh={refreshCounter} />
                    </div>

                    <div>
                        <SearchInterface />
                    </div>
                </div>
            </div>
        </div>
    );
}
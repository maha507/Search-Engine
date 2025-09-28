"use client";

import React, { useState } from 'react';

interface DocumentUploadProps {
    onUploadSuccess: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file first');
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setMessage(`✅ ${data.message}`);
                setFile(null);
                onUploadSuccess();
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (error) {
            setMessage(`❌ Upload failed: ${error}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

            <div className="space-y-4">
                <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </button>

                {message && (
                    <div className={`p-3 rounded-md ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
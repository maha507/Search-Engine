'use client';

import { useState } from 'react';

interface SearchResult {
    id: string;
    score: number;
    text: string;
    filename: string;
    chunkIndex: number;
    metadata: {
        fileType: string;
        uploadedAt: string;
        totalChunks: number;
    };
}

interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResult[];
    totalResults: number;
}

export default function SearchInterface() {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SearchResponse | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.trim(), limit: 10 }),
            });

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
            setResults({
                success: false,
                query: query.trim(),
                results: [],
                totalResults: 0,
            });
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Search Documents</h2>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your search query..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={!query.trim() || searching}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {results && (
                <div className="space-y-4">
                    {results.success ? (
                        <>
                            <div className="text-sm text-gray-600">
                                Found {results.totalResults} results for "{results.query}"
                            </div>

                            {results.results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.results.map((result) => (
                                        <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-blue-600">
                                                    {result.filename}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Score: {(result.score * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-2">
                                                Chunk {result.chunkIndex + 1} of {result.metadata.totalChunks} •
                                                {result.metadata.fileType} •
                                                {new Date(result.metadata.uploadedAt).toLocaleDateString()}
                                            </div>

                                            <div className="text-gray-800 leading-relaxed">
                                                {result.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    No results found for your query.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-red-100 text-red-800 p-4 rounded">
                            Search failed. Please try again.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
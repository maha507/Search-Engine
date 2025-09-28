"use client";
import React, { useState } from 'react';

interface Source {
    title: string;
    content: string;
    score: number;
}

interface SearchResult {
    answer: string;
    sources: Source[];
}

export default function SearchInterface() {
    const [question, setQuestion] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);

    const handleSearch = async () => {
        if (!question.trim()) return;

        setSearching(true);
        setResult(null);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    answer: data.answer,
                    sources: data.sources || [],
                });
            } else {
                setResult({
                    answer: `Error: ${data.error}`,
                    sources: [],
                });
            }
        } catch (error) {
            setResult({
                answer: `Search failed: ${error}`,
                sources: [],
            });
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ask Questions</h2>

            <div className="space-y-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about your documents..."
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || !question.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {result && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="font-semibold text-gray-800 mb-2">Answer:</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
                        </div>

                        {result.sources.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Sources:</h3>
                                <div className="space-y-2">
                                    {result.sources.map((source, index) => (
                                        <div key={index} className="bg-blue-50 p-3 rounded-md">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-blue-800">{source.title}</span>
                                                <span className="text-sm text-blue-600">Score: {source.score.toFixed(3)}</span>
                                            </div>
                                            <p className="text-blue-700 text-sm">{source.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
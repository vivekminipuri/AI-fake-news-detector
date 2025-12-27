import React from 'react';

function App() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-primary">AI Fake News Detector</h1>
                <p className="text-lg text-gray-600 mt-2">Verify news with the power of AI</p>
            </header>
            <main className="max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg">
                <p className="text-center">Welcome! The project structure is now initialized.</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                        <h3 className="font-semibold text-lg text-blue-600">Analyze News</h3>
                        <p className="text-sm text-gray-500">Paste text or URL to verify.</p>
                    </div>
                    <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                        <h3 className="font-semibold text-lg text-green-600">View History</h3>
                        <p className="text-sm text-gray-500">Check past analyses.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;

"use client";

import { useState } from "react";

interface NewTaskFormProps {
  onCreate: (title: string, description: string) => void;
  loading: boolean;
}

export default function NewTaskForm({ onCreate, loading }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title, description);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
            required
            disabled={loading}
          />
        </div>
        <div className="relative">
          <textarea
            placeholder="Add details (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
            rows={2}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Task...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Task
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

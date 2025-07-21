"use client";

import { useState } from 'react';
import { useDictionary } from '../lib/useDictionary';
import { WordData } from '../lib/word_data';

export default function Home() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<WordData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { find } = useDictionary();

  const handleSearch = async () => {
    if (!word) return;
    setError(null);
    setResult(undefined);
    try {
      const findResult = await find(word);
      if (findResult) {
        setResult(findResult);
      } else {
        setError('Word not found');
      }
    } catch (e) {
      setError('An error occurred');
    }
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>llexicom</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word"
          style={{ padding: "10px", width: "300px" }}
        />
        <button onClick={handleSearch} style={{ padding: "10px" }}>Search</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <h2>{word}</h2>
          {result.map((wordData, index) => (
            <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
              {wordData.meanings.map((meaning, mIndex) => (
                <div key={mIndex}>
                  <p><strong>{meaning.part_of_speech_translated}:</strong> {meaning.definition}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
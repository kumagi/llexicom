"use client";

import { useState, useRef, useCallback } from 'react';
import { WordData } from './word_data';
// @ts-ignore
import { table } from './table';

export const useDictionary = () => {
    const [cachedDictionary, setCachedDictionary] = useState<{[key: string]: WordData[]}>({});
    const tableRef = useRef<string[]>(table);

    const nearestIndex = useCallback((key: string, table: string[]): number => {
        let left = -1;
        let right = table.length;
        while (right - left > 1) {
            const mid = Math.floor(left + (right - left) / 2);
            if (table[mid] > key) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return left;
    }, []);

    const find = useCallback(async (key: string): Promise<WordData[] | undefined> => {
        const canonical_key = key.toLowerCase();
        if (cachedDictionary[canonical_key]) {
            console.log(`cache hit for ${canonical_key}`);
            return cachedDictionary[canonical_key];
        }

        try {
            const nearest_key = tableRef.current[nearestIndex(canonical_key, tableRef.current)];
            console.log(`fetching /dict/${nearest_key}.json.lz for ${canonical_key}`);
            const response = await fetch(`/dict/${nearest_key}.json.lz`);

            if (!response.ok || !response.body) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const ds = new DecompressionStream("deflate");
            const decompressedStream = response.body.pipeThrough(ds);
            const blob = await new Response(decompressedStream).blob();
            const dict = JSON.parse(await blob.text());

            const newCache = { ...cachedDictionary, ...dict };
            setCachedDictionary(newCache);
            return newCache[canonical_key];
        } catch (error) {
            console.error('Error fetching dictionary data:', error);
            return undefined;
        }
    }, [cachedDictionary, nearestIndex]);

    const nearby = useCallback(async (key: string, count: number): Promise<{[key: string]: string}> => {
        await find(key); // Ensure cache is populated
        const near_keys = Object.keys(cachedDictionary).sort();
	const index = nearestIndex(key, near_keys);
	const keys = near_keys.slice(Math.max(0, index - (count / 2)),
				index + (count / 2) + 1)
	return Object.fromEntries(
	    keys.map((k) => [k, cachedDictionary[k][0].meanings[0].definition])
	)
    }, [find, cachedDictionary, nearestIndex]);

    const randomChoice = useCallback(async (count: number): Promise<{[key: string]: string}> => {
        const shuffled = [...tableRef.current];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const filesToFetch = Math.ceil(count / 10);
        const keysToFetch = shuffled.slice(0, filesToFetch);
        
        await Promise.all(keysToFetch.map(key => find(key)));

        const allWords = Object.keys(cachedDictionary);
        const randomWords = allWords.sort(() => 0.5 - Math.random()).slice(0, count);

        return Object.fromEntries(
            randomWords.map((k) => [k, cachedDictionary[k][0].meanings[0].definition])
        );
    }, [find, cachedDictionary]);


    return { find, nearby, randomChoice };
};

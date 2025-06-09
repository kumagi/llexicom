import { WordData } from './word_data';

export class Finder {
    private readonly table: string[];
    private cachedDictionary: {[key: string]: WordData[] };

    public constructor() {
	this.table = require('./table').table;
	this.cachedDictionary = {};
    }

    public nearestIndex(key: string, table: string[] = this.table): number {
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
    }

    // Returns `count` of words which nears specified `key` in dictionary.
    public async nearby(key: string, count: number): Promise<string[]> {
	const _ = await this.find(key);  // Call this just for populate the cache.
	const keys = Object.keys(this.cachedDictionary).sort();
	const index = this.nearestIndex(key, keys);
	console.log(`${keys} is ${keys.length}`)
	console.log(`${Math.max(0, index - (count / 2))} ${index + (count / 2) + 1}`)
	return keys.slice(Math.max(0, index - (count / 2)),
			  index + (count / 2) + 1)
    }

    // Returns single word data which exactly matches specified `key`.
    // The `key` is case-insensitive.
    public async find(key: string): Promise<WordData[] | undefined> {
	const canonical_key = key.toLowerCase()
	if (this.cachedDictionary[canonical_key]) {
	    console.log(`cache hit for ${canonical_key}`)
	    return this.cachedDictionary[canonical_key];
	}
	try {
	    const nearest_index = this.nearestIndex(canonical_key)
	    const nearest_key = this.table[nearest_index];
	    console.log(`fetching ${nearest_key} for ${canonical_key}`)
            const response = await fetch(`${nearest_key}.json.lz`, {
		method: 'GET',
		headers: {
                    'Accept-Encoding': 'br'
		}
            });
	    const ds = new DecompressionStream("deflate");

	    const readableStream = response.body;
	    if (readableStream === null) {
		console.error("no readable stream")
		return undefined;
	    }
	    const decompressedStream = readableStream.pipeThrough(ds);
	    const blob = await new Response(decompressedStream).blob();
	    const dict = JSON.parse(await blob.text());

            if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
            }
	    this.cachedDictionary = { ...this.cachedDictionary, ...dict };
	    return this.cachedDictionary[canonical_key];
	} catch (error) {
            console.error('Error fetching dictionary data:', error);
	    return undefined;
	}
    }
}

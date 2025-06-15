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
    public async nearby(key: string, count: number): Promise<{[key: string]: string}> {
	const _ = await this.find(key);  // Call this just for populate the cache.
	const near_keys = Object.keys(this.cachedDictionary).sort();
	const index = this.nearestIndex(key, near_keys);
	const keys = near_keys.slice(Math.max(0, index - (count / 2)),
				index + (count / 2) + 1)
	return Object.fromEntries(
	    keys.map((key) => [key, this.cachedDictionary[key][0].meanings[0].definition])
	)
    }

    public async randomChoice(count: number): Promise<{[key: string]: string}> {
	const shuffled = [...this.table];
	for (let i = shuffled.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));
	    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	const files = count / 10;
	const src = shuffled.slice(0, files);
	const promises = src.map((key) => this.find(key));
	const results = await Promise.all(promises);

	const usedIndices = new Set<number>();
	const words: string[] = [];
	const originalKeys = Object.keys(this.cachedDictionary)
	while (words.length < count) {
	    const index = Math.floor(Math.random() * originalKeys.length)
	    if (usedIndices.has(index)) { continue; }
	    if (!this.cachedDictionary[originalKeys[index]] ||
		!this.cachedDictionary[originalKeys[index]][0].meanings) { continue; }
	    usedIndices.add(index);
	    words.push(originalKeys[index])
	}
	return Object.fromEntries(
	    words.map((key) => [key, this.cachedDictionary[key][0].meanings[0].definition])
	)
    }

    // Returns single word data which exactly matches specified `key`.
    // The `key` is case-insensitive.
    public async find(key: string): Promise<WordData[] | undefined> {
	const canonical_key = key.toLowerCase()
	if (this.cachedDictionary[canonical_key]) {
	    console.log(`cache hit for ${canonical_key} out of ${Object.keys(this.cachedDictionary).length}`)
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

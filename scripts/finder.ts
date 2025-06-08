import { WordData } from './word_data';

export class Finder {
    private readonly table: string[];
    private cachedDictionary: {[key: string]: WordData[] };

    public constructor() {
	this.table = require('./table').table;
	this.cachedDictionary = {};
    }

    public nearestIndex(key: string): string {
	let left = -1;
	let right = this.table.length;
	while (right - left > 1) {
            const mid = Math.floor(left + (right - left) / 2);
            if (this.table[mid] > key) {
		right = mid;
	    } else {
		left = mid;
	    }
	}
	return this.table[left];
    }

    // Input key will be handled in case-insensitive.
    public async find(key: string): Promise<WordData[] | undefined> {
	const canonical_key = key.toLowerCase()
	if (this.cachedDictionary[canonical_key]) {
	    console.log(`cache hit for ${canonical_key}`)
	    return this.cachedDictionary[canonical_key];
	}
	try {
	    const nearest_key = this.nearestIndex(canonical_key)
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

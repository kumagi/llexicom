import { WordData } from './word_data';

export class Finder {
    private readonly table: string[];
    private cachedDictionary: {[key: string]: WordData };

    public constructor() {
	this.table = require('./table').table;
	console.log(this.table)
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

    public async find(key: string): Promise<WordData | undefined> {
	if (this.cachedDictionary[key]) {
	    console.log(`cache hit for ${key} as ${this.cachedDictionary[key]}`)
	    return this.cachedDictionary[key];
	}
	try {
	    const nearest_key = this.nearestIndex(key)
	    console.log(`fetching ${nearest_key}`)
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
	    return this.cachedDictionary[key];
	} catch (error) {
            console.error('Error fetching dictionary data:', error);
	    return undefined;
	}
    }
}

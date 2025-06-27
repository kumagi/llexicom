import { Finder } from './finder'
import { WordData } from './word_data';
import { render, renderNotfoundMessage, renderIndexSamples } from './render'

const finder = new Finder();

const performSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (!(searchInput instanceof HTMLInputElement)) {
	console.error("not valid input");
	return
    }
    const searchTerm = searchInput?.value.trim();
    if (searchTerm === undefined) {
	return;
    }
    performSearchAndPushHistory(searchTerm);
}

const performSearchAndPushHistory = (searchTerm: string) => {
    performSearchImpl(searchTerm);
    const newUrl = `?query=${searchTerm}`;
    history.pushState({
	query: searchTerm
    }, '', newUrl);
}

const performSearchImpl = async (searchTerm: string) => {
    if (searchTerm === '') {
	console.log("empty query");
        return;
    }
    const resultsContainer: Element | null = document.getElementById('results');
    if (resultsContainer === null) {
	console.error("No result box");
	return;
    }
    const data: WordData[] | undefined = await finder.find(searchTerm);
    if (data === undefined) {
	const candidates = await finder.nearby(searchTerm, 100);
        resultsContainer.innerHTML = renderNotfoundMessage(searchTerm, candidates);
    } else {
        resultsContainer.innerHTML = render(data);
	const cards = document.getElementsByClassName("meaning-card");
	for (const card of cards) {
	    card.addEventListener('click', (m) => {
		if (!(m.target instanceof HTMLElement)) {
		    return;
		}
		const body = card.querySelector('.meaning-content')
		if (body) {
		    body.classList.toggle("visible");
		}
		const title = card.querySelector('.meaning-title')
		if (title) {
		    title.classList.toggle("expand");
		}
	    }
					)
	}
    }
};

const fillSamples = async () => {
    const samples = await finder.randomChoice(100);
    const resultsContainer: Element | null = document.getElementById('results');
    if (!resultsContainer) {
	return;
    }
    resultsContainer.innerHTML = renderIndexSamples(samples);
    const wordEntries = document.getElementsByClassName('word-entry');
    for (const wordEntry of wordEntries) {
	wordEntry.addEventListener('click', (event) => {
	    const div = wordEntry.querySelector('div');
	    if (div) {
		const word = div.innerHTML;
		performSearchAndPushHistory(word);
	    }
	    event.stopPropagation();
	    console.log("clidked word");
	    window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth'
	    })
	}, true)
    }
}

function load() {
    const searchButton = document.getElementById('searchButton');
    searchButton?.addEventListener('click', () => {
	performSearch()
    });
    
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('keypress', (event) => {
	if (event.key === 'Enter') {
	    performSearch();
	}
    });

    const logo = document.getElementById('logo');
    logo?.addEventListener('click', () => {
	history.pushState({
	    query: undefined
	}, '', location.pathname);
	fillSamples();
    });
    
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (searchInput instanceof HTMLInputElement && query !== null) {
	searchInput.value = query;
	performSearchImpl(query);
    } else {
	fillSamples();
    }
};

window.addEventListener('pageshow', (event) => {
    load();
});

window.addEventListener('popstate', (event) => {
    const searchInput = document.getElementById('searchInput');
    if (event.state && searchInput instanceof HTMLInputElement) {
	const query = event.state.query || '';
	if (!query) {
	    fillSamples();
	} else {
	    searchInput.value = query;
	    performSearchImpl(query);
	}
    } else {
	load();
    }
});


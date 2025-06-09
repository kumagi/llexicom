import { Finder } from './finder'
import { WordData } from './word_data';
import { render, renderNotfoundMessage } from './render'

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
	return;
    } else {
        resultsContainer.innerHTML = render(data);
	const meanings = document.getElementsByClassName("meaning-title");
	for (let i = 0; i < meanings.length; i++) {
	    meanings[i].addEventListener('click', (m) => {
		if (!(m.target instanceof HTMLElement)) {
		    return;
		}
		const content = m.target.parentElement;
		const body = content?.querySelector('.meaning-content');
		if (body) {
		    body.classList.toggle("visible");
		}
		const title = content?.querySelector('.meaning-title');
		if (title) {
		    title.classList.toggle("expand");
		}
	    }
					)
	}
    }
};

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
    
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (searchInput instanceof HTMLInputElement && query !== null) {
	searchInput.value = query;
	performSearchImpl(query);
    }
};

window.addEventListener('pageshow', (event) => {
    load();
});

window.addEventListener('popstate', (event) => {
    const searchInput = document.getElementById('searchInput');
    if (event.state && searchInput instanceof HTMLInputElement) {
	const query = event.state.query || '';
	searchInput.value = query;
	performSearchImpl(query);
    } else {
	load();
    }
});


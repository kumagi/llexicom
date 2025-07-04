const Hogan = require('hogan.js')
import { WordData } from './word_data';
import templateString from './word.mustache';

const template = Hogan.compile(templateString);

function parseMarkdownBold(text: string): string {
    if (!text) {
	return "";
    }
    
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function translatePartOfSpeech(pos: string): string {
    switch (pos) {
	case "verb":
	    return "動詞";
	case "verb (vt)":
	    return "他動詞";
	case "verb (vi)":
	    return "自動詞"
	case "noun":
	    return "名詞";
	case "pronoun":
	    return "代名詞";
	case "proper noun":
	    return "固有名詞";
	case "adjective":
	    return "形容詞";
	case "adverb":
	    return "副詞";
	case "preposition":
	    return "前置詞";
	case "conjunction":
	    return "接続詞";
	case "interjection":
	    return "間投詞";
    }
    if (pos.startsWith("verb")) {
	return "動詞 (変化)";
    }
    if (pos.startsWith("adjective")) {
	return "形容詞";
    }
    console.log(pos);
    return "Unknown";
}

function translateTransitivity(en: string): string {
    switch (en) {
	case "vr":
	case "vi":
	    return "自";
	case "vt":
	    return "他";
    }
    return "sss";
}

function mustachePreprocess(data: WordData): WordData {
    if (data.meanings) {
	for (let i = 0; i < data.meanings.length; i++) {
	    data.meanings[i].index_plus_1 = i + 1;
	    if (data.meanings[i].part_of_speech) {
		data.meanings[i].part_of_speech_translated = translatePartOfSpeech(data.meanings[i].part_of_speech);
	    }
	    if (data.meanings[i].transitivity) {
		data.meanings[i].transitivity_translated = translateTransitivity(data.meanings[i].transitivity);
	    }

	    data.meanings[i].has_collocations = !!data.meanings[i].collocations;
	    data.meanings[i].has_synonyms = !!data.meanings[i].synonyms;
	    data.meanings[i].has_antonyms = !!data.meanings[i].antonyms;
	}
    }
    if (data.example_sentences) {
	for (let i = 0; i < data.example_sentences.length; i++) {
	    if (data.example_sentences[i].type) {
		data.example_sentences[i].type_translated = translatePartOfSpeech(data.example_sentences[i].type);
	    }
	    if (data.example_sentences[i].sentence) {
		data.example_sentences[i].sentence = parseMarkdownBold(data.example_sentences[i].sentence)
	    }
	}
    }
    if (data.readability_explanation) {
	data.readability_explanation.text = parseMarkdownBold(data.readability_explanation.text);
    }
    if (data.usage_notes) {
	data.usage_notes.explanation = parseMarkdownBold(data.usage_notes.explanation)
    }

    data.related_words.has_derivatives = !!data.related_words.derivatives;
    data.related_words.has_idioms_phrases = !!data.related_words.idioms_phrases;
    data.related_words.has_phrasal_verbs = !!data.related_words.has_phrasal_verbs;

    data.has_inflection_forms = !!data.inflection;
    data.has_related_words = !!data.related_words;
    data.has_example_sentences = !!data.example_sentences;
    
    return data;
}

export function render(data: WordData[]): string {
    return template.render(mustachePreprocess(data[0]));  // TODO: Handle multiple words data if exists.
}

export function renderNotfoundMessage(target: string, words: {[key: string]: string}): string {
    const sorted_words = Object.keys(words).sort();
    let result: string = `${target}は見つかりませんでした<br>`;
    result += '<div class="suggestions-container">\n'
    result += '<div class="suggestions-title">もしかして:</div>\n';
    result += '<div class="word-tags">\n'
    for (let i = 0; i < sorted_words.length; i++) {
	result += `<a href="?query=${sorted_words[i]}" class="word-tag" title="${words[sorted_words[i]]}">${sorted_words[i]}</a><br>`;
    }
    result += '</div></div>';
    return result;
}

export function renderIndexSamples(words: {[key: string]: string}): string {
    const keys = Object.keys(words);
    let result: string = '<div class="list-container">\n'
    result += '<ul class="word-list">\n'
    for (let i = 0; i < keys.length; i++) {
	result += `<li class="word-entry" title="${keys[i]}"><div class="word-link">${keys[i]}</div>`;
	result += `<span class="word-translation">${words[keys[i]]}</span></li>`;
    }
    result += '</ul></div>';
    return result;
}

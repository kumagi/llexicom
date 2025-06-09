const Hogan = require('hogan.js')
import { WordData } from './word_data';
import templateString from './word.mustache';

const template = Hogan.compile(templateString);

function parseMarkdownBold(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function render(data: WordData[]): string {
    data[0].readability_explanation.text = parseMarkdownBold(data[0].readability_explanation.text);
    data[0].usage_notes.explanation = parseMarkdownBold(data[0].usage_notes.explanation)
    return template.render(data[0]);
}

export function renderNotfoundMessage(target: string, words: string[]): string {
    let result: string = `${target}は見つかりませんでした<br>`;
    result += '<div class="suggestions-container">\n'
    result += '<div class="suggestions-title">もしかして:</div>\n';
    result += '<div class="word-tags">\n'
    for (let i = 0; i < words.length; i++) {
	result += `<a href="?query=${words[i]}" class="word-tag">${words[i]}</a><br>`;
    }
    result += '</div></div>';
    return result;
}

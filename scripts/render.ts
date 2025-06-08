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

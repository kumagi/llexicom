const Hogan = require('hogan.js')
import { WordData } from './word_data';
import templateString from './word.mustache';

const template = Hogan.compile(templateString);

function parseMarkdownBold(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function render(data: WordData): string {
    data.readability_explanation.text = parseMarkdownBold(data.readability_explanation.text);
    data.usage_notes.explanation = parseMarkdownBold(data.usage_notes.explanation)
    return template.render(data);
}

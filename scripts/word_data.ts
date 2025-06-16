
interface Meanings {
    index_plus_1: number;
    part_of_speech: string;
    part_of_speech_translated: string;
    transitivity: string;
    transitivity_translated: string;
    definition: string;
    collocations: string[];
    synonyms: string[];
    antonyms: string[];

    has_collocations: boolean;
    has_synonyms: boolean;
    has_antonyms: boolean;
};

interface ExampleSentence {
    type: string;
    type_translated: string;
    sentence: string;
};

interface Inflection {
    noun_plural: string;
    noun_singular: string;
    verb_forms: object;
    notes: string;
};

interface RelatedWords {
    derivatives: string;
    idioms_phrases: string;
    phrasal_verbs: string;

    has_derivatives: boolean;
    has_idioms_phrases: boolean;
    has_phrasal_verbs: boolean;
};

export interface WordData {
    readability_explanation: {
	text: string
    };
    usage_notes: {
	explanation: string
    };
    meanings:  Meanings[];
    example_sentences: ExampleSentence[];
    inflection: Inflection;
    related_words: RelatedWords;

    has_inflection: boolean;
    has_related_words: boolean;
    has_inflection_forms: boolean;
    has_example_sentences: boolean;
};


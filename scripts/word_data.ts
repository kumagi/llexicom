
interface Meanings {
    index_plus_1: number;
    part_of_speech: string;
    part_of_speech_translated: string;
    transitivity: string;
    transitivity_translated: string;
    definition: string;
};

interface ExampleSentence {
    type: string;
    type_translated: string;
    sentence: string;
}

export interface WordData {
    readability_explanation: {
	text: string
    };
    usage_notes: {
	explanation: string
    };
    meanings:  Meanings[];
    example_sentences: ExampleSentence[];
};


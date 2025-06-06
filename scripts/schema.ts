exports.schema={
    "name": "Word Definition Schema",
    "strict": "true",
    "description": "Schema for defining a word with its various meanings, etymology, pronunciation, and usage.",
    "required": [
	"word",
	"priority",
	"meanings",
	"etymology",
	"pronunciation",
	"inflection",
	"usage_notes",
	"common_mistakes",
	"related_words",
	"level_frequency",
	"readability_explanation",
	"example_sentences"
    ],
    "schema": {
	"type": "object",
	"properties": {
	    "word": {
		"type": "string",
		"description": "The word being defined."
	    },
	    "priority": {
		"type": "string",
		"description": "The priority level of the word (e.g., '★★★')."
	    },
	    "meanings": {
		"type": "array",
		"description": "An array of different meanings for the word.",
		"items": {
		    "type": "object",
		    "required": [
			"part_of_speech",
			"definition",
			"english_definition",
			"examples",
			"collocations",
			"synonyms",
			"antonyms"
		    ],
		    "properties": {
			"part_of_speech": {
			    "type": "string",
			    "description": "The part of speech (e.g., 'noun', 'verb')."
			},
			"transitivity": {
			    "type": "string",
			    "description": "For verbs, indicates transitivity (e.g., 'vt', 'vi').",
			    "enum": ["vt", "vi"]
			},
			"definition": {
			    "type": "string",
			    "description": "Japanese definition of the meaning."
			},
			"english_definition": {
			    "type": "string",
			    "description": "English definition of the meaning."
			},
			"examples": {
			    "type": "array",
			    "description": "Example sentences with translations.",
			    "items": {
				"type": "object",
				"required": [
				    "sentence",
				    "translation"
				],
				"properties": {
				    "sentence": {
					"type": "string",
					"description": "An example sentence in English."
				    },
				    "translation": {
					"type": "string",
					"description": "Japanese translation of the example sentence."
				    }
				}
			    }
			},
			"collocations": {
			    "type": "array",
			    "description": "Common collocations for this meaning.",
			    "items": {
				"type": "string"
			    }
			},
			"synonyms": {
			    "type": "array",
			    "description": "Synonyms for this meaning.",
			    "items": {
				"type": "string"
			    }
			},
			"antonyms": {
			    "type": "array",
			    "description": "Antonyms for this meaning.",
			    "items": {
				"type": "string"
			    }
			}
		    }
		}
	    },
	    "etymology": {
		"type": "object",
		"description": "Information about the word's origin.",
		"required": [
		    "value"
		],
		"properties": {
		    "value": {
			"type": "string",
			"description": "The etymological explanation."
		    }
		}
	    },
	    "pronunciation": {
		"type": "object",
		"description": "Pronunciation details.",
		"required": [
		    "ipa_uk",
		    "ipa_us",
		    "syllables"
		],
		"properties": {
		    "ipa_uk": {
			"type": "string",
			"description": "IPA pronunciation for UK English."
		    },
		    "ipa_us": {
			"type": "string",
			"description": "IPA pronunciation for US English."
		    },
		    "syllables": {
			"type": "string",
			"description": "Syllabification of the word."
		    }
		}
	    },
	    "inflection": {
		"type": "object",
		"description": "Grammatical inflections of the word.",
		"properties": {
		    "noun_forms": {
			"type": "object",
			"properties": {
			    "singular": {
				"type": "string",
				"description": "Singular form of the noun."
			    },
			    "plural": {
				"type": "string",
				"description": "Plural form(s) of the noun, with notes on usage."
			    }
			}
		    },
		    "verb_forms": {
			"type": "object",
			"properties": {
			    "present_simple": {
				"type": "array",
				"items": {
				    "type": "string"
				},
				"description": "Present simple forms of the verb."
			    },
			    "past_simple": {
				"type": "string",
				"description": "Past simple form of the verb."
			    },
			    "past_participle": {
				"type": "string",
				"description": "Past participle form of the verb."
			    },
			    "present_participle": {
				"type": "string",
				"description": "Present participle form of the verb."
			    }
			}
		    }
		}
	    },
	    "usage_notes": {
		"type": "object",
		"description": "Notes on how the word is typically used.",
		"required": [
		    "explanation"
		],
		"properties": {
		    "explanation": {
			"type": "string",
			"description": "Detailed explanation of usage, including common patterns and variations."
		    }
		}
	    },
	    "common_mistakes": {
		"type": "object",
		"description": "Common errors made by learners and their corrections.",
		"required": [
		    "examples"
		],
		"properties": {
		    "examples": {
			"type": "array",
			"items": {
			    "type": "object",
			    "required": [
				"incorrect",
				"correct",
				"note"
			    ],
			    "properties": {
				"incorrect": {
				    "type": "string",
				    "description": "An incorrect usage example."
				},
				"correct": {
				    "type": "string",
				    "description": "The correct usage example."
				},
				"note": {
				    "type": "string",
				    "description": "An explanation of why the incorrect usage is wrong."
				}
			    }
			}
		    }
		}
	    },
	    "related_words": {
		"type": "object",
		"description": "Words and phrases related to the main word.",
		"properties": {
		    "derivatives": {
			"type": "array",
			"description": "Words derived from the main word.",
			"items": {
			    "type": "string"
			}
		    },
		    "phrasal_verbs": {
			"type": "array",
			"description": "Phrasal verbs using the main word.",
			"items": {
			    "type": "string"
			}
		    },
		    "idioms_phrases": {
			"type": "array",
			"description": "Idiomatic expressions and common phrases using the main word.",
			"items": {
			    "type": "string"
			}
		    }
		}
	    },
	    "level_frequency": {
		"type": "object",
		"description": "Information about the word's difficulty level and frequency.",
		"required": [
		    "CEFR",
		    "frequency_google_ngram"
		],
		"properties": {
		    "CEFR": {
			"type": "string",
			"description": "CEFR level for the word and its usages."
		    },
		    "frequency_google_ngram": {
			"type": "string",
			"description": "Frequency of the word based on Google Ngram data."
		    }
		}
	    },
	    "readability_explanation": {
		"type": "object",
		"description": "A simplified explanation for readability, targeted at a specific level.",
		"required": [
		    "level",
		    "text"
		],
		"properties": {
		    "level": {
			"type": "string",
			"description": "The target readability level (e.g., 'A1')."
		    },
		    "text": {
			"type": "string",
			"description": "The simplified explanation text."
		    }
		}
	    },
	    "example_sentences": {
		"type": "array",
		"description": "Additional example sentences categorised by type and meaning.",
		"items": {
		    "type": "object",
		    "required": [
			"sentence",
			"translation",
			"type",
			"meaning_category"
		    ],
		    "properties": {
			"sentence": {
			    "type": "string",
			    "description": "The example sentence in English."
			},
			"translation": {
			    "type": "string",
			    "description": "The Japanese translation of the example sentence."
			},
			"type": {
			    "type": "string",
			    "description": "The grammatical type of usage (e.g., 'noun (uncountable)', 'verb (vt)', 'idiom')."
			},
			"meaning_category": {
			    "type": "string",
			    "description": "A brief category for the meaning illustrated by the sentence."
			}
		    }
		}
	    }
	}
    }
}


// Reactのコンポーネントとロジックをここに記述します
// (Create React AppのApp.jsの中身に相当します)
const { useState, useEffect, useCallback } = React;

// --- データ部分 ---
const initialWordList = [
    { word: 'apple', meaning: 'りんご' }, { word: 'book', meaning: '本' },
    { word: 'cat', meaning: '猫' }, { word: 'dog', meaning: '犬' },
    { word: 'egg', meaning: '卵' }, { word: 'flower', meaning: '花' },
    { word: 'go', meaning: '行く' }, { word: 'house', meaning: '家' },
    { word: 'ice', meaning: '氷' }, { word: 'jump', meaning: '跳ぶ' },
    { word: 'key', meaning: '鍵' }, { word: 'love', meaning: '愛' },
    { word: 'money', meaning: 'お金' }, { word: 'night', meaning: '夜' },
    { word: 'open', meaning: '開く' }, { word: 'pen', meaning: 'ペン' },
    { word: 'queen', meaning: '女王' }, { word: 'run', meaning: '走る' },
];

const REPETITION_INTERVALS = [3, 8, 15, 30, 60];

const initializeWordBank = (wordList) => {
    return wordList.map((item, index) => ({
        ...item,
        index: index,
        status: 'Unseen',
        repetitionLevel: 0,
        nextAppearance: 0,
        timesAsked: 0,
        everIncorrect: false,
    }));
};

const App = () => {
    const [wordBank, setWordBank] = useState(() => initializeWordBank(initialWordList));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [options, setOptions] = useState([]);
    
    const determineNextQuestionIndex = useCallback(() => {
        const learningCandidates = wordBank.filter(w => w.status === 'Learning' && w.nextAppearance <= questionNumber);
        if (learningCandidates.length > 0) {
            learningCandidates.sort((a, b) => a.nextAppearance - b.nextAppearance);
            return learningCandidates[0].index;
        }

        const unseenCandidates = wordBank.filter(w => w.status === 'Unseen');
        if (unseenCandidates.length > 0) {
            return unseenCandidates[Math.floor(Math.random() * unseenCandidates.length)].index;
        }
        
        const onceCorrectCandidates = wordBank.filter(w => w.timesAsked === 1 && !w.everIncorrect);
        if (onceCorrectCandidates.length > 0) {
            return onceCorrectCandidates[Math.floor(Math.random() * onceCorrectCandidates.length)].index;
        }

        const masteredCandidates = wordBank.filter(w => w.status === 'Mastered');
        if (masteredCandidates.length > 0) {
            masteredCandidates.sort((a,b) => a.nextAppearance - b.nextAppearance);
            return masteredCandidates[0].index;
        }
        
        return Math.floor(Math.random() * wordBank.length);

    }, [wordBank, questionNumber]);
    
    const generateQuestion = useCallback((targetIndex) => {
        const correctWord = wordBank[targetIndex];

        const incorrectOptions = new Set();
        while (incorrectOptions.size < 3) {
            const randomIndex = Math.floor(Math.random() * wordBank.length);
            if (randomIndex !== targetIndex) {
		incorrectOptions.add(wordBank[randomIndex].meaning);
            }
        }
        const newOptions = [correctWord.meaning, ...incorrectOptions];
        newOptions.sort(() => Math.random() - 0.5);
        
        setOptions(newOptions);
        setCurrentQuestionIndex(targetIndex);
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [wordBank]);

    useEffect(() => {
        const firstIndex = determineNextQuestionIndex();
        generateQuestion(firstIndex);
    }, []);

    const handleAnswerSelect = (option) => {
        if (isAnswered) return;

        const newWordBank = [...wordBank];
        const word = { ...newWordBank[currentQuestionIndex] };
        const isCorrect = option === word.meaning;
        word.timesAsked += 1;

        if (isCorrect) {
            if (word.status === 'Learning') {
		if(word.repetitionLevel >= REPETITION_INTERVALS.length) {
                    word.status = 'Mastered';
		}
            } else if (word.timesAsked >= 2 && !word.everIncorrect) {
		word.status = 'Mastered';
		word.nextAppearance = questionNumber + 50 + Math.floor(Math.random() * 50); 
            }
        } else {
            word.everIncorrect = true;
            word.status = 'Learning';
            if (word.repetitionLevel < REPETITION_INTERVALS.length) {
		word.nextAppearance = questionNumber + REPETITION_INTERVALS[word.repetitionLevel];
		word.repetitionLevel += 1;
            } else {
		word.nextAppearance = questionNumber + 5;
            }
        }
        
        newWordBank[currentQuestionIndex] = word;
        setWordBank(newWordBank);
        setSelectedAnswer(option);
        setIsAnswered(true);
    };

    const handleNextQuestion = () => {
        const nextQNum = questionNumber + 1;
        const nextIndex = determineNextQuestionIndex();
        setQuestionNumber(nextQNum);
        generateQuestion(nextIndex);
    };

    if (currentQuestionIndex === null) {
        return <div>Loading...</div>;
    }
    
    const currentQuestion = wordBank[currentQuestionIndex];

    const getButtonClass = (option) => {
        if (!isAnswered) return 'option-button';
        if (option === currentQuestion.meaning) return 'option-button correct';
        if (option === selectedAnswer) return 'option-button incorrect';
        return 'option-button';
    };

    return (
        <div className="container">
            <header>
		<h1>間隔反復 英単語テスト</h1>
		<div className="score">
		    問題番号: {questionNumber}
		</div>
		<div className="debug-info">
		    {/* デバッグ用に単語の状態を表示 */}
		    Status: {currentQuestion.status}, 
		    Level: {currentQuestion.repetitionLevel}, 
		    Next: {currentQuestion.nextAppearance > questionNumber ? `あと${currentQuestion.nextAppearance - questionNumber}問` : 'Now'},
		    Asked: {currentQuestion.timesAsked}
		</div>
            </header>
            
            <main className="quiz-card">
		<div className="question-word">{currentQuestion.word}</div>
		<div className="options-grid">
		    {options.map((option, index) => (
			<button
			    key={index}
			    className={getButtonClass(option)}
			    onClick={() => handleAnswerSelect(option)}
			    disabled={isAnswered}
			>
			    {option}
			</button>
		    ))}
		</div>
		
		{isAnswered && (
		    <div className="feedback-container">
			{selectedAnswer === currentQuestion.meaning ? (
			    <p className="feedback-text correct-text">正解！ 🎉</p>
			) : (
			    <p className="feedback-text incorrect-text">
				不正解... 正解は「{currentQuestion.meaning}」
			    </p>
			)}
			<button className="next-button" onClick={handleNextQuestion}>
			    次の問題へ →
			</button>
		    </div>
		)}
            </main>
        </div>
    );
};

// ReactアプリケーションをHTMLの#root要素に描画します
ReactDOM.render(<App />, document.getElementById('root'));

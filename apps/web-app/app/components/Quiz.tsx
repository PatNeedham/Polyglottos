import React, { useState } from 'react';

interface QuizQuestion {
  id: string;
  danish: string;
  options: string[];
  correct: string;
  category: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<
    {
      question: string;
      selected: string;
      correct: string;
      isCorrect: boolean;
    }[]
  >([]);

  const question = questions[currentQuestion];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === question.correct;
    const newAnswer = {
      question: question.danish,
      selected: selectedAnswer,
      correct: question.correct,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
        if (onComplete) {
          onComplete(isCorrect ? score + 1 : score, questions.length);
        }
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizComplete(false);
    setAnswers([]);
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-complete">
        <div className="quiz-header">
          <h2>Quiz Complete! 🎉</h2>
        </div>

        <div className="quiz-score">
          <div className="score-circle">
            <span className="score-number">
              {score}/{questions.length}
            </span>
            <span className="score-percentage">{percentage}%</span>
          </div>
        </div>

        <div className="quiz-results">
          <h3>Review your answers:</h3>
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`answer-review ${
                answer.isCorrect ? 'correct' : 'incorrect'
              }`}
            >
              <div className="question-text">{answer.question}</div>
              <div className="answer-comparison">
                <span className="your-answer">
                  Your answer: <strong>{answer.selected}</strong>
                </span>
                {!answer.isCorrect && (
                  <span className="correct-answer">
                    Correct answer: <strong>{answer.correct}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={resetQuiz} className="button primary">
          Take Quiz Again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <h2>Quick Quiz</h2>
        <div className="quiz-progress">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <div className="question-text">
            <h3>What does this mean in English?</h3>
            <div className="danish-word">{question.danish}</div>
          </div>

          {!showResult && (
            <div className="answer-options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${
                    selectedAnswer === option ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {showResult && (
            <div className="answer-result">
              <div
                className={`result-message ${
                  selectedAnswer === question.correct ? 'correct' : 'incorrect'
                }`}
              >
                {selectedAnswer === question.correct ? (
                  <>
                    <div className="result-icon">✓</div>
                    <div className="result-text">Correct!</div>
                  </>
                ) : (
                  <>
                    <div className="result-icon">✗</div>
                    <div className="result-text">
                      Incorrect. The answer is:{' '}
                      <strong>{question.correct}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {!showResult && (
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="button primary"
            >
              {currentQuestion === questions.length - 1
                ? 'Finish Quiz'
                : 'Next Question'}
            </button>
          )}
        </div>

        <div className="quiz-score-display">
          <span>
            Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

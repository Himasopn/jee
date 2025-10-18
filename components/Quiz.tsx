import React, { useState } from 'react';
import { Question } from '../types';

interface QuizProps {
  questions: Question[];
  examTitle: string;
  onQuizComplete: (score: number, answers: Record<number, number>) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, examTitle, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = currentQuestion.section;
  
  const sectionStartIndex = questions.findIndex(q => q.section === currentSection);
  const questionsInSection = questions.filter(q => q.section === currentSection).length;
  const sectionQuestionIndex = currentQuestionIndex - sectionStartIndex;


  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };
  
  const advanceToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleNext = () => {
    advanceToNextQuestion();
  };
  
  const handleSkip = () => {
    advanceToNextQuestion();
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, index) => {
      const userAnswerIndex = selectedAnswers[index];

      if (userAnswerIndex !== undefined) {
        if (userAnswerIndex === q.correctAnswerIndex) {
          score += 4;
        } else {
          score -= 1;
        }
      }
    });
    onQuizComplete(score, selectedAnswers);
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8 border border-gray-700">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">{examTitle} - {currentSection}</h1>
            <span className="text-lg font-semibold text-gray-300">
              {sectionQuestionIndex + 1} / {questionsInSection}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-2">Overall Progress: {currentQuestionIndex + 1} / {questions.length}</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div>
          {currentQuestion.diagramBase64 && (
            <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg flex justify-center items-center">
              <img 
                src={`data:image/png;base64,${currentQuestion.diagramBase64}`} 
                alt="Question Diagram" 
                className="max-w-full h-auto max-h-60 rounded-md bg-white"
              />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 overflow-y-auto pr-2 max-h-48">{currentQuestion.question}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 border-2 
                    ${isSelected 
                        ? 'bg-blue-500 border-blue-400 ring-2 ring-blue-300 text-white' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500'
                    }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={handleSkip}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
                Skip <i className="fas fa-forward ml-2"></i>
            </button>
            <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                <i className="fas fa-arrow-right ml-2"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

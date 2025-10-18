import React, { useState, useMemo } from 'react';
import { Question } from '../types';

interface ResultProps {
  score: number;
  totalQuestions: number;
  examTitle: string;
  onRestart: () => void;
  questions: Question[];
  userAnswers: Record<number, number>;
}

const Result: React.FC<ResultProps> = ({ score, totalQuestions, examTitle, onRestart, questions, userAnswers }) => {
    const [showReview, setShowReview] = useState(false);

    const { correctCount, incorrectCount, unattemptedCount, positiveMarks, negativeMarks } = useMemo(() => {
        let correct = 0;
        let incorrect = 0;
        
        questions.forEach((_, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer !== undefined) {
                if (userAnswer === questions[index].correctAnswerIndex) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        });

        const unattempted = totalQuestions - correct - incorrect;

        return {
            correctCount: correct,
            incorrectCount: incorrect,
            unattemptedCount: unattempted,
            positiveMarks: correct * 4,
            negativeMarks: incorrect * -1,
        };
    }, [questions, userAnswers, totalQuestions]);
    
    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, question, index) => {
            const section = question.section || 'General';
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push({ ...question, originalIndex: index });
            return acc;
        }, {} as Record<string, (Question & { originalIndex: number })[]>);
    }, [questions]);

    const maxScore = totalQuestions * 4;
    const percentage = maxScore > 0 ? Math.round((Math.max(0, score) / maxScore) * 100) : 0;
    
    let feedbackMessage = '';
    let feedbackColor = '';

    if (percentage >= 80) {
        feedbackMessage = "Excellent Work! You're ready for the challenge!";
        feedbackColor = 'text-green-400';
    } else if (percentage >= 50) {
        feedbackMessage = "Good Effort! Keep practicing to improve.";
        feedbackColor = 'text-yellow-400';
    } else {
        feedbackMessage = "Don't give up! Review your mistakes and try again.";
        feedbackColor = 'text-red-400';
    }

    const renderReview = () => (
      <div>
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-300">Answer Review</h2>
        <div className="space-y-8 max-h-[60vh] overflow-y-auto p-2 -mr-2">
          {Object.entries(groupedQuestions).map(([section, sectionQuestions], secIndex) => (
            <div key={secIndex}>
                <h3 className="text-2xl font-bold text-indigo-400 mb-4 pb-2 border-b-2 border-indigo-500 sticky top-0 bg-gray-800 py-2">{section}</h3>
                <div className="space-y-6">
                    {sectionQuestions.map((q) => {
                        const index = q.originalIndex;
                        const userAnswer = userAnswers[index];
                        const correctAnswer = q.correctAnswerIndex;
                        const isCorrect = userAnswer === correctAnswer;
                        const isAttempted = userAnswer !== undefined;

                        let points = 0;
                        let pointsColor = 'text-gray-400';

                        if (isAttempted) {
                            if (isCorrect) {
                                points = 4;
                                pointsColor = 'text-green-400';
                            } else {
                                points = -1;
                                pointsColor = 'text-red-400';
                            }
                        } else {
                            points = 0;
                            pointsColor = 'text-yellow-400';
                        }

                        return (
                            <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-start mb-4">
                                <p className="font-semibold flex-1 pr-4">
                                    <span className="font-bold mr-2">Q{index + 1}.</span> {q.question}
                                </p>
                                <span className={`font-bold text-lg whitespace-nowrap ml-4 px-3 py-1 rounded-md ${points > 0 ? 'bg-green-900/80' : points < 0 ? 'bg-red-900/80' : 'bg-yellow-900/80'} ${pointsColor}`}>
                                    {points > 0 ? `+${points}` : points} pts
                                </span>
                            </div>
                            
                            {q.diagramBase64 && (
                                <div className="mb-4 p-2 bg-gray-800/50 border border-gray-700 rounded-lg flex justify-center items-center">
                                    <img 
                                        src={`data:image/png;base64,${q.diagramBase64}`} 
                                        alt="Question Diagram" 
                                        className="max-w-full h-auto max-h-52 rounded-md bg-white"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                {q.options.map((option, optionIndex) => {
                                let optionClass = 'bg-gray-700 border-gray-600'; // Default
                                if (optionIndex === correctAnswer) {
                                    optionClass = 'bg-green-800/50 border-green-600 text-white'; // Correct answer
                                }
                                if (optionIndex === userAnswer && !isCorrect) {
                                    optionClass = 'bg-red-800/50 border-red-600 text-white'; // User's wrong answer
                                }
                                
                                return (
                                    <div key={optionIndex} className={`p-3 rounded-md border text-left flex justify-between items-center ${optionClass}`}>
                                    <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                                    <span>
                                        {optionIndex === correctAnswer && <i className="fas fa-check text-green-400 ml-2"></i>}
                                        {optionIndex === userAnswer && !isCorrect && <i className="fas fa-times text-red-400 ml-2"></i>}
                                    </span>
                                    </div>
                                );
                                })}
                            </div>
                            {!isAttempted && (
                                <p className="text-yellow-400 mt-3 font-semibold text-sm">You did not attempt this question (skipped).</p>
                            )}
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-xl p-8 border border-gray-700 transition-all duration-300">
            {!showReview ? (
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-400 mb-2">Quiz Completed!</h1>
                    <p className="text-lg text-gray-400 mb-6">{examTitle}</p>

                    <div className="my-8">
                        <p className="text-xl text-gray-300">Your Score</p>
                        <p className={`text-6xl font-bold my-2 ${score >= 0 ? 'text-white' : 'text-red-400'}`}>{score} / {maxScore}</p>
                        <p className="text-2xl font-semibold text-blue-400">{percentage}%</p>
                    </div>

                    <div className="my-8 border-t border-b border-gray-700 py-4 px-2">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4 text-center">Performance Breakdown</h3>
                        <div className="flex justify-around text-lg">
                            <div className="text-center px-2">
                                <p className="font-bold text-3xl text-green-400">{correctCount}</p>
                                <p className="text-sm text-gray-400">Correct (+{positiveMarks})</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="font-bold text-3xl text-red-400">{incorrectCount}</p>
                                <p className="text-sm text-gray-400">Incorrect ({negativeMarks})</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="font-bold text-3xl text-yellow-400">{unattemptedCount}</p>
                                <p className="text-sm text-gray-400">Unattempted</p>
                            </div>
                        </div>
                    </div>

                    <p className={`text-lg font-medium mb-8 ${feedbackColor}`}>{feedbackMessage}</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onRestart}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            <i className="fas fa-home mr-2"></i>
                            Back to Home
                        </button>
                        <button
                            onClick={() => setShowReview(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            <i className="fas fa-search mr-2"></i>
                            Review Answers
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {renderReview()}
                    <div className="mt-6 text-center">
                       <button
                            onClick={() => setShowReview(false)}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            <i className="fas fa-trophy mr-2"></i>
                            Back to Score
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Result;

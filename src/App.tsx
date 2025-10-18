import React, { useState, useCallback } from 'react';
import { ExamType, Question } from './types';
import { generateQuizQuestions } from './services/geminiService';
import Quiz from './components/Quiz';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

type AppState = 'home' | 'loading' | 'quiz' | 'result' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [error, setError] = useState<string>('');

  const handleStartQuiz = useCallback(async (type: ExamType) => {
    setAppState('loading');
    setExamType(type);
    setError('');
    try {
      const fetchedQuestions = await generateQuizQuestions(type);
      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setAppState('quiz');
      } else {
        throw new Error("No questions were generated. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setAppState('error');
    }
  }, []);

  const handleQuizComplete = (finalScore: number, answers: Record<number, number>) => {
    setScore(finalScore);
    setUserAnswers(answers);
    setAppState('result');
  };

  const handleRestart = () => {
    setAppState('home');
    setQuestions([]);
    setScore(0);
    setUserAnswers({});
    setExamType(null);
    setError('');
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <i className="fas fa-brain text-6xl text-blue-400 mb-4"></i>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3">
          JEE Mock Test Simulator
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          Sharpen your skills with AI-generated mock tests for JEE Mains and Advanced. Get a unique set of 30 questions every time you practice.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => handleStartQuiz(ExamType.MAINS)}
            className="px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
          >
            JEE Mains
          </button>
          <button
            onClick={() => handleStartQuiz(ExamType.ADVANCED)}
            className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
          >
            JEE Advanced
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingSpinner message={`Generating ${examType} questions & diagrams...`} />;
      case 'quiz':
        return <Quiz questions={questions} examTitle={examType!} onQuizComplete={handleQuizComplete} />;
      case 'result':
        return <Result 
                    score={score} 
                    totalQuestions={questions.length} 
                    examTitle={examType!} 
                    onRestart={handleRestart}
                    questions={questions}
                    userAnswers={userAnswers} 
                />;
      case 'error':
        return <ErrorDisplay message={error} onRetry={() => {
            if(examType) handleStartQuiz(examType);
            else handleRestart();
        }} />;
      case 'home':
      default:
        return renderHome();
    }
  };

  return <div className="bg-gray-900">{renderContent()}</div>;
};

export default App;

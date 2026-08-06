import React, { useState, useEffect, useCallback } from 'react';
import { trackEvent } from "../../utils/analytics.js";
// --- UNIT DEFINITIONS ---
const LENGTH_UNITS = [
  // Level 1 & 2 Pool
  { name: 'meter', symbol: 'm', base: 1, minLevel: 1 },
  { name: 'foot', symbol: 'ft', base: 0.3048, minLevel: 1 },
  { name: 'inch', symbol: 'in', base: 0.0254, minLevel: 1 },
  { name: 'link', symbol: 'li', base: 0.201168, minLevel: 1 },
  // Level 3 Expansion
  { name: 'mile', symbol: 'mi', base: 1609.344, minLevel: 3 },
  // Level 4 Expansion}
  { name: 'yard / kejam', symbol: 'yard', base: 0.9144, minLevel: 4 },
];
const AREA_UNITS = [
  // Level 1 & 2 Pool
  { name: 'square meter', symbol: 'sq m', base: 1, minLevel: 1 },
  { name: 'square foot', symbol: 'sq ft', base: 0.092903, minLevel: 1 },
  { name: 'Cent', symbol: 'cent', base: 40.4686, minLevel: 1 },
  { name: 'Ground', symbol: 'ground', base: 222.967, minLevel: 1 },
  { name: 'Acre', symbol: 'ac', base: 4046.86, minLevel: 1 },
  { name: 'Ares', symbol: 'are', base: 100, minLevel: 1 },
  { name: 'Hectare', symbol: 'ha', base: 10000, minLevel: 1 },
  // Level 3 Expansion
  { name: 'Kuzhi', symbol: 'kuzhi', base: 13.378, minLevel: 3 },
  // Level 4 Expansion
  { name: 'Maa', symbol: 'maa', base: 1337.8, minLevel: 4},
];
export default function ConversionQuiz() {
  const [level, setLevel] = useState(1);
  const [questionCount, setQuestionCount] = useState(1);
  const [setScore, setSetScore] = useState(0);
  const [completedSetScore, setCompletedSetScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const formatNumber = (num) => {
    if (Math.abs(num) < 0.01 || Math.abs(num) >= 100000) {
      return parseFloat(num.toPrecision(4));
    }
    return Math.round(num * 10000) / 10000;
  };
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  // --- QUESTION & OPTIONS GENERATION ENGINE ---
  const generateQuestion = useCallback(() => {
    const isLength = Math.random() < 0.5;
    const rawPool = isLength ? LENGTH_UNITS : AREA_UNITS;
    const availablePool = rawPool.filter((u) => u.minLevel <= level);
    const fromUnit = getRandom(availablePool);
    const toUnit = getRandom(availablePool.filter((u) => u.name !== fromUnit.name));
    let valueToConvert;
    // if (level === 1) {
      valueToConvert = Math.floor(Math.random() * 9) + 1;
    // } else {
      // valueToConvert = Math.floor(Math.random() * 90) + 10;
    // }
    const exactAnswer = (valueToConvert * fromUnit.base) / toUnit.base;
    const formattedCorrect = formatNumber(exactAnswer);
    // Calculate 1-unit reference equivalence
    const singleUnitValue = formatNumber(fromUnit.base / toUnit.base);
    const wrongOptionsSet = new Set();
    const multipliers = [0.5, 1.5, 2.0, 10, 0.1, 0.25, 1.2, 0.8];
    while (wrongOptionsSet.size < 3) {
      const mult = getRandom(multipliers);
      let wrongVal = formatNumber(exactAnswer * mult);
      if (wrongVal !== formattedCorrect && wrongVal > 0 && !wrongOptionsSet.has(wrongVal)) {
        wrongOptionsSet.add(wrongVal);
      }
    }
    const optionsList = shuffleArray([
      { text: `${formattedCorrect} ${toUnit.symbol}`, isCorrect: true, val: formattedCorrect },
      ...Array.from(wrongOptionsSet).map((val) => ({
        text: `${val} ${toUnit.symbol}`,
        isCorrect: false,
        val
      }))
    ]);
    setCurrentQuestion({
      category: isLength ? 'Length' : 'Area',
      val: valueToConvert,
      from: fromUnit,
      to: toUnit,
      correctAnswer: formattedCorrect,
      unitReference: singleUnitValue,
      options: optionsList
    });
    setSelectedOption(null);
    setFeedback(null);
  }, [level]);
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);
  // --- HANDLE OPTION SELECTION ---
  const handleOptionSelect = (option) => {
    if (feedback !== null) return;
    setSelectedOption(option);
    const refMsg = `hint: 1 ${currentQuestion.from.name} = ${currentQuestion.unitReference} ${currentQuestion.to.name}`;
    if (option.isCorrect) {
      setSetScore((prev) => prev + 1);
      setFeedback({
        status: 'correct',
        title: 'Correct Answer!',
        msg: refMsg
      });
    } else {
      setFeedback({
        status: 'wrong',
        title: 'Incorrect Answer',
        msg: refMsg
      });
    }
  };
  // --- HANDLE NEXT QUESTION / SET RESET ---
  const handleNextQuestion = () => {
    if (questionCount >= 10) {
      trackEvent("quiz_completed", {
        level,
        score: setScore,
        total_questions: 10,
      });
      setCompletedSetScore(setScore);
    } else {
      setQuestionCount((prev) => prev + 1);
      generateQuestion();
    }
  };
  const handleStartNextSet = () => {
    let nextLevel = 1;
    if (completedSetScore > 9) {
      nextLevel = 2;
    } else if (completedSetScore > 99) {
      nextLevel = 3;
    } else if (completedSetScore > 99) {
      nextLevel = 4;
    }
    setLevel(nextLevel);
    setCompletedSetScore(null);
    setSetScore(0);
    setQuestionCount(1);
    generateQuestion();
  };
  const optionPrefixes = ['A', 'B', 'C', 'D'];
  return (
    <div style={styles.card}>
      {/* Set Completion Summary Screen */}
      {completedSetScore !== null ? (
        <div style={styles.resultsContainer}>
          <h2>Congrats! 🎉</h2>
          <p style={styles.scoreText}>
            Your Score: <strong>{completedSetScore}</strong> / 10
          </p>
          <button onClick={handleStartNextSet} style={styles.nextBtn}>
            Start Again
          </button>
        </div>
      ) : (
        <>
          {/* Header Progress Bar */}
          <div style={styles.header}>
            <span style={styles.categoryBadge}>{currentQuestion?.category}</span>
            <span style={styles.counterText}>Question {questionCount} of 10</span>
          </div>
          {/* Question Display */}
          {currentQuestion && (
            <div style={styles.questionContainer}>
              <p style={styles.questionText}>
                Convert <span style={styles.highlight}>{currentQuestion.val}</span> {currentQuestion.from.name} ({currentQuestion.from.symbol}) into <strong>{currentQuestion.to.name}</strong>
              </p>
              {/* 4 Multiple Choice Options with A, B, C, D */}
              <div style={styles.optionsGrid}>
                {currentQuestion.options.map((option, index) => {
                  let btnStyle = { ...styles.optionBtn };
                  if (feedback) {
                    if (option.isCorrect) {
                      btnStyle = { ...btnStyle, ...styles.correctOption };
                    } else if (selectedOption === option && !option.isCorrect) {
                      btnStyle = { ...btnStyle, ...styles.wrongOption };
                    } else {
                      btnStyle = { ...btnStyle, opacity: 0.5 };
                    }
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={feedback !== null}
                      style={btnStyle}
                    >
                      <span style={styles.prefixBadge}>{optionPrefixes[index]}</span>
                      {option.text}
                    </button>
                  );
                })}
              </div>
              {/* Next Question Button */}
              {feedback !== null && (
                <button type="button" onClick={handleNextQuestion} style={styles.nextBtn}>
                  {questionCount >= 10 ? 'Complete →' : 'Next Question →'}
                </button>
              )}
            </div>
          )}
          {/* Feedback Banner displaying 1-Unit conversion reference */}
          {feedback && (
            <div style={feedback.status === 'correct' ? styles.correctAlert : styles.wrongAlert}>
              <strong>{feedback.title}</strong>
              <div style={styles.feedbackDetail}>{feedback.msg}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
// Inline Styles
const styles = {
  card: {
    maxWidth: '480px',
    margin: '2rem auto',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.75rem'
  },
  categoryBadge: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  counterText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#6B7280'
  },
  questionContainer: {
    textAlign: 'center',
    margin: '1rem 0'
  },
  questionText: {
    fontSize: '1.2rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem'
  },
  highlight: {
    color: '#4F46E5',
    fontSize: '1.4rem',
    fontWeight: 'bold'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0.6rem',
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  prefixBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginRight: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    color: '#065F46'
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    color: '#991B1B'
  },
  nextBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4F46E5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  correctAlert: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: '1rem',
    textAlign: 'center'
  },
  wrongAlert: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    fontSize: '1rem',
    textAlign: 'center'
  },
  feedbackDetail: {
    fontSize: '0.9rem',
    marginTop: '4px',
    fontWeight: '500'
  },
  resultsContainer: {
    textAlign: 'center',
    padding: '2rem 1rem'
  },
  scoreText: {
    fontSize: '1.5rem',
    margin: '1.5rem 0'
  }
};
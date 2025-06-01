import React, { useState } from 'react';

interface Exercise {
  id: string;
  type: 'vocabulary' | 'listening' | 'translation' | 'matching';
  title: string;
  completed: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: number;
  progress: number;
  exercises: Exercise[];
  vocabulary: string[];
}

interface DailyLessonProps {
  lesson: Lesson;
}

export default function DailyLesson({ lesson }: DailyLessonProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);

  const completedExercises = lesson.exercises.filter(
    (ex) => ex.completed
  ).length;
  const progressPercentage =
    (completedExercises / lesson.exercises.length) * 100;

  const handleStartLesson = () => {
    setLessonStarted(true);
  };

  const handleExerciseComplete = () => {
    // In a real app, this would update the backend
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  if (!lessonStarted) {
    return (
      <div className="daily-lesson">
        <div className="lesson-preview">
          <div className="lesson-header">
            <div className="lesson-badge">{lesson.level}</div>
            <h2>{lesson.title}</h2>
            <p className="lesson-description">{lesson.description}</p>
          </div>

          <div className="lesson-details">
            <div className="lesson-stats">
              <div className="stat">
                <span className="stat-icon">📚</span>
                <div>
                  <div className="stat-number">{lesson.exercises.length}</div>
                  <div className="stat-label">Exercises</div>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">⏱️</span>
                <div>
                  <div className="stat-number">{lesson.estimatedTime}</div>
                  <div className="stat-label">Minutes</div>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">📖</span>
                <div>
                  <div className="stat-number">{lesson.vocabulary.length}</div>
                  <div className="stat-label">New Words</div>
                </div>
              </div>
            </div>

            <div className="lesson-progress">
              <div className="progress-header">
                <span>
                  Progress: {completedExercises}/{lesson.exercises.length}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="vocabulary-preview">
              <h4>Today's vocabulary:</h4>
              <div className="vocabulary-list">
                {lesson.vocabulary.map((word, index) => (
                  <span key={index} className="vocabulary-word">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleStartLesson} className="button primary large">
            {completedExercises > 0 ? 'Continue Lesson' : 'Start Lesson'}
          </button>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[currentExercise];

  return (
    <div className="daily-lesson">
      <div className="lesson-header">
        <button onClick={() => setLessonStarted(false)} className="back-button">
          ← Back to Overview
        </button>
        <div className="lesson-progress">
          <span>
            Exercise {currentExercise + 1} of {lesson.exercises.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentExercise + 1) / lesson.exercises.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="exercise-content">
        <div className="exercise-card">
          <div className="exercise-type-badge">{exercise.type}</div>
          <h3>{exercise.title}</h3>

          {exercise.type === 'vocabulary' && (
            <div className="vocabulary-exercise">
              <div className="word-card">
                <div className="danish-word">restaurant</div>
                <div className="word-options">
                  <button className="word-option">library</button>
                  <button className="word-option correct">restaurant</button>
                  <button className="word-option">hospital</button>
                  <button className="word-option">school</button>
                </div>
              </div>
            </div>
          )}

          {exercise.type === 'translation' && (
            <div className="translation-exercise">
              <div className="sentence-prompt">
                <p>Translate this sentence to Danish:</p>
                <div className="english-sentence">
                  "I would like a table for two."
                </div>
              </div>
              <div className="translation-input">
                <input
                  type="text"
                  placeholder="Type your translation here..."
                  className="translation-field"
                />
              </div>
            </div>
          )}

          {exercise.type === 'listening' && (
            <div className="listening-exercise">
              <div className="audio-prompt">
                <button className="play-button">🔊 Play Audio</button>
                <p>What did you hear?</p>
              </div>
              <div className="listening-options">
                <button className="listening-option">
                  Jeg vil gerne have en øl
                </button>
                <button className="listening-option">
                  Jeg vil gerne have et bord
                </button>
                <button className="listening-option">
                  Jeg vil gerne have regningen
                </button>
              </div>
            </div>
          )}

          {exercise.type === 'matching' && (
            <div className="matching-exercise">
              <div className="matching-pairs">
                <div className="danish-words">
                  <div className="match-item">kaffe</div>
                  <div className="match-item">øl</div>
                  <div className="match-item">vand</div>
                </div>
                <div className="english-words">
                  <div className="match-item">beer</div>
                  <div className="match-item">water</div>
                  <div className="match-item">coffee</div>
                </div>
              </div>
            </div>
          )}

          <div className="exercise-actions">
            <button className="button secondary">Skip</button>
            <button onClick={handleExerciseComplete} className="button primary">
              {currentExercise === lesson.exercises.length - 1
                ? 'Complete Lesson'
                : 'Next Exercise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

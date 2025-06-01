import React from 'react';

interface DashboardProps {
  userName: string;
  targetLanguage: string;
  nativeLanguage: string;
}

export default function Dashboard({
  userName,
  targetLanguage,
  nativeLanguage,
}: DashboardProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <p>
          Learning {targetLanguage} • Native {nativeLanguage} speaker
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h3>My Progress</h3>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">47</span>
              <span className="stat-label">Days streak</span>
            </div>
            <div className="stat">
              <span className="stat-number">234</span>
              <span className="stat-label">Words learned</span>
            </div>
            <div className="stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Lessons completed</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '68%' }}></div>
          </div>
          <p className="progress-text">68% complete • Level 3</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3>Today's Lesson</h3>
          <div className="lesson-preview">
            <h4>Lesson 13: At the Restaurant</h4>
            <p>Learn how to order food and drinks in Danish</p>
            <div className="lesson-progress">
              <span>Progress: 3/8 exercises</span>
              <div className="mini-progress-bar">
                <div
                  className="mini-progress-fill"
                  style={{ width: '37%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🎯</div>
          <h3>Quick Quiz</h3>
          <p>Test your knowledge with 5 random words</p>
          <div className="quiz-stats">
            <span>Last score: 4/5 (80%)</span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📖</div>
          <h3>Grammar Focus</h3>
          <div className="grammar-topic">
            <h4>Danish Articles (en/et)</h4>
            <p>Master the use of definite and indefinite articles</p>
            <div className="difficulty-badge">Intermediate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

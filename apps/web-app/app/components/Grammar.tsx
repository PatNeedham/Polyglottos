import React, { useState } from 'react';

interface GrammarRule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  examples: {
    danish: string;
    english: string;
    explanation: string;
  }[];
}

interface GrammarTopic {
  id: string;
  title: string;
  description: string;
  rules: GrammarRule[];
  progress: number;
}

interface GrammarProps {
  topics: GrammarTopic[];
}

export default function Grammar({ topics }: GrammarProps) {
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'beginner';
      case 'Intermediate':
        return 'intermediate';
      case 'Advanced':
        return 'advanced';
      default:
        return 'beginner';
    }
  };

  if (selectedRule && selectedTopic) {
    return (
      <div className="grammar">
        <div className="grammar-header">
          <button onClick={() => setSelectedRule(null)} className="back-button">
            ← Back to {selectedTopic.title}
          </button>
          <div
            className={`difficulty-badge ${getDifficultyColor(
              selectedRule.difficulty
            )}`}
          >
            {selectedRule.difficulty}
          </div>
        </div>

        <div className="rule-detail">
          <h2>{selectedRule.title}</h2>
          <p className="rule-description">{selectedRule.description}</p>

          <div className="rule-examples">
            <h3>Examples:</h3>
            {selectedRule.examples.map((example, index) => (
              <div key={index} className="example-card">
                <div className="example-sentences">
                  <div className="danish-example">{example.danish}</div>
                  <div className="english-example">{example.english}</div>
                </div>
                <div className="example-explanation">
                  <strong>Explanation:</strong> {example.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="rule-actions">
            <button className="button secondary">Practice Exercises</button>
            <button className="button primary">Mark as Learned</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="grammar">
        <div className="grammar-header">
          <button
            onClick={() => setSelectedTopic(null)}
            className="back-button"
          >
            ← Back to Grammar Topics
          </button>
        </div>

        <div className="topic-detail">
          <h2>{selectedTopic.title}</h2>
          <p className="topic-description">{selectedTopic.description}</p>

          <div className="topic-progress">
            <div className="progress-header">
              <span>Progress: {selectedTopic.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${selectedTopic.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="rules-list">
            <h3>Grammar Rules:</h3>
            {selectedTopic.rules.map((rule) => (
              <div
                key={rule.id}
                className="rule-card"
                onClick={() => setSelectedRule(rule)}
              >
                <div className="rule-header">
                  <h4>{rule.title}</h4>
                  <div
                    className={`difficulty-badge ${getDifficultyColor(
                      rule.difficulty
                    )}`}
                  >
                    {rule.difficulty}
                  </div>
                </div>
                <p className="rule-preview">{rule.description}</p>
                <div className="rule-examples-count">
                  {rule.examples.length} examples
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grammar">
      <div className="grammar-header">
        <h2>Grammar Topics</h2>
        <p>Master Danish grammar step by step</p>
      </div>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="topic-card"
            onClick={() => setSelectedTopic(topic)}
          >
            <div className="topic-header">
              <h3>{topic.title}</h3>
              <div className="topic-progress-circle">
                <span>{topic.progress}%</span>
              </div>
            </div>
            <p className="topic-description">{topic.description}</p>
            <div className="topic-stats">
              <span>{topic.rules.length} rules</span>
              <span>•</span>
              <span>
                {topic.rules.reduce(
                  (acc, rule) => acc + rule.examples.length,
                  0
                )}{' '}
                examples
              </span>
            </div>
            <div className="topic-progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${topic.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

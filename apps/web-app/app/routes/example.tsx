import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import PersonalWordBank from '../components/PersonalWordBank';
import Quiz from '../components/Quiz';
import DailyLesson from '../components/DailyLesson';
import Grammar from '../components/Grammar';

// Mock data for the example
const mockWords = [
  {
    id: '1',
    danish: 'hej',
    english: 'hello',
    ipa: 'haɪ',
    lastEncountered: 'May 22nd 2025',
    timesEncountered: 15,
    correctRate: 95,
    category: 'Greetings',
  },
  {
    id: '2',
    danish: 'kaffe',
    english: 'coffee',
    ipa: 'ˈkʰafə',
    lastEncountered: 'May 21st 2025',
    timesEncountered: 8,
    correctRate: 87,
    category: 'Food',
  },
  {
    id: '3',
    danish: 'familie',
    english: 'family',
    ipa: 'faˈmiːliə',
    lastEncountered: 'May 20th 2025',
    timesEncountered: 12,
    correctRate: 75,
    category: 'Family',
  },
  {
    id: '4',
    danish: 'restaurant',
    english: 'restaurant',
    ipa: 'ʁɛsdoˈʁɑŋ',
    lastEncountered: 'May 22nd 2025',
    timesEncountered: 6,
    correctRate: 67,
    category: 'Food',
  },
  {
    id: '5',
    danish: 'rejse',
    english: 'travel',
    ipa: 'ˈʁaɪsə',
    lastEncountered: 'May 19th 2025',
    timesEncountered: 4,
    correctRate: 50,
    category: 'Travel',
  },
  {
    id: '6',
    danish: 'skole',
    english: 'school',
    ipa: 'ˈskoːlə',
    lastEncountered: 'May 21st 2025',
    timesEncountered: 9,
    correctRate: 89,
    category: 'School',
  },
  {
    id: '7',
    danish: 'arbejde',
    english: 'work',
    ipa: 'ˈɑːbaɪðə',
    lastEncountered: 'May 20th 2025',
    timesEncountered: 7,
    correctRate: 71,
    category: 'Work',
  },
  {
    id: '8',
    danish: 'indkøb',
    english: 'shopping',
    ipa: 'ˈinˌkʰøːb',
    lastEncountered: 'May 18th 2025',
    timesEncountered: 3,
    correctRate: 33,
    category: 'Shopping',
  },
];

const mockQuizQuestions = [
  {
    id: '1',
    danish: 'kaffe',
    options: ['coffee', 'tea', 'water', 'milk'],
    correct: 'coffee',
    category: 'Food',
  },
  {
    id: '2',
    danish: 'hej',
    options: ['goodbye', 'hello', 'please', 'thank you'],
    correct: 'hello',
    category: 'Greetings',
  },
  {
    id: '3',
    danish: 'skole',
    options: ['hospital', 'school', 'library', 'restaurant'],
    correct: 'school',
    category: 'School',
  },
  {
    id: '4',
    danish: 'familie',
    options: ['friend', 'family', 'neighbor', 'teacher'],
    correct: 'family',
    category: 'Family',
  },
  {
    id: '5',
    danish: 'arbejde',
    options: ['play', 'work', 'sleep', 'eat'],
    correct: 'work',
    category: 'Work',
  },
];

const mockLesson = {
  id: '13',
  title: 'At the Restaurant',
  description: 'Learn how to order food and drinks in Danish',
  level: 'Intermediate',
  estimatedTime: 15,
  progress: 37,
  exercises: [
    {
      id: '1',
      type: 'vocabulary' as const,
      title: 'Restaurant Vocabulary',
      completed: true,
    },
    {
      id: '2',
      type: 'listening' as const,
      title: 'Ordering Drinks',
      completed: true,
    },
    {
      id: '3',
      type: 'translation' as const,
      title: 'Making Reservations',
      completed: true,
    },
    {
      id: '4',
      type: 'vocabulary' as const,
      title: 'Food Items',
      completed: false,
    },
    {
      id: '5',
      type: 'matching' as const,
      title: 'Menu Items',
      completed: false,
    },
    {
      id: '6',
      type: 'listening' as const,
      title: 'Asking for the Bill',
      completed: false,
    },
    {
      id: '7',
      type: 'translation' as const,
      title: 'Restaurant Dialogue',
      completed: false,
    },
    {
      id: '8',
      type: 'vocabulary' as const,
      title: 'Review & Practice',
      completed: false,
    },
  ],
  vocabulary: ['restaurant', 'menu', 'regning', 'bestille', 'kaffe', 'øl'],
};

const mockGrammarTopics = [
  {
    id: '1',
    title: 'Danish Articles (en/et)',
    description: 'Learn when to use "en" vs "et" with Danish nouns',
    progress: 85,
    rules: [
      {
        id: '1',
        title: 'Common Gender Articles (en)',
        description: 'Most Danish nouns use "en" as their indefinite article',
        difficulty: 'Beginner' as const,
        examples: [
          {
            danish: 'en bil',
            english: 'a car',
            explanation:
              'The word "bil" (car) is common gender, so it uses "en"',
          },
          {
            danish: 'en kat',
            english: 'a cat',
            explanation:
              'The word "kat" (cat) is common gender, so it uses "en"',
          },
        ],
      },
      {
        id: '2',
        title: 'Neuter Gender Articles (et)',
        description: 'Some Danish nouns use "et" as their indefinite article',
        difficulty: 'Beginner' as const,
        examples: [
          {
            danish: 'et hus',
            english: 'a house',
            explanation:
              'The word "hus" (house) is neuter gender, so it uses "et"',
          },
          {
            danish: 'et barn',
            english: 'a child',
            explanation:
              'The word "barn" (child) is neuter gender, so it uses "et"',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Verb Conjugation',
    description: 'Master Danish verb conjugations in different tenses',
    progress: 60,
    rules: [
      {
        id: '3',
        title: 'Present Tense',
        description: 'Danish verbs in present tense typically end in -r',
        difficulty: 'Intermediate' as const,
        examples: [
          {
            danish: 'Jeg spiser',
            english: 'I eat',
            explanation: 'The verb "spise" becomes "spiser" in present tense',
          },
        ],
      },
    ],
  },
];

type ViewType = 'dashboard' | 'wordBank' | 'quiz' | 'lesson' | 'grammar';

export default function Example() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderNavigation = () => (
    <nav className="example-nav">
      <div className="nav-header">
        <h1>Polyglottos</h1>
        <p className="demo-badge">Demo Mode</p>
      </div>
      <ul className="nav-links">
        <li>
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 My Progress
          </button>
        </li>
        <li>
          <button
            className={currentView === 'wordBank' ? 'active' : ''}
            onClick={() => setCurrentView('wordBank')}
          >
            📚 Personal Word Bank
          </button>
        </li>
        <li>
          <button
            className={currentView === 'quiz' ? 'active' : ''}
            onClick={() => setCurrentView('quiz')}
          >
            🎯 Start Quiz
          </button>
        </li>
        <li>
          <button
            className={currentView === 'lesson' ? 'active' : ''}
            onClick={() => setCurrentView('lesson')}
          >
            📖 View Daily Lesson
          </button>
        </li>
        <li>
          <button
            className={currentView === 'grammar' ? 'active' : ''}
            onClick={() => setCurrentView('grammar')}
          >
            📝 Grammar
          </button>
        </li>
      </ul>
    </nav>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            userName="Alex"
            targetLanguage="Danish"
            nativeLanguage="English"
          />
        );
      case 'wordBank':
        return <PersonalWordBank words={mockWords} />;
      case 'quiz':
        return <Quiz questions={mockQuizQuestions} />;
      case 'lesson':
        return <DailyLesson lesson={mockLesson} />;
      case 'grammar':
        return <Grammar topics={mockGrammarTopics} />;
      default:
        return (
          <Dashboard
            userName="Alex"
            targetLanguage="Danish"
            nativeLanguage="English"
          />
        );
    }
  };

  return (
    <div className="example-page">
      <div className="example-layout">
        {renderNavigation()}
        <main className="example-content">{renderContent()}</main>
      </div>
    </div>
  );
}

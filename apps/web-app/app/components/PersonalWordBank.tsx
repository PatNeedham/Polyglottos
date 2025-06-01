import React, { useState } from 'react';

interface Word {
  id: string;
  danish: string;
  english: string;
  ipa: string;
  lastEncountered: string;
  timesEncountered: number;
  correctRate: number;
  category: string;
}

interface PersonalWordBankProps {
  words: Word[];
}

const CATEGORIES = [
  'All',
  'Food',
  'Family',
  'Travel',
  'Shopping',
  'Greetings',
  'Work',
  'School',
  'Numbers',
  'Colors',
  'Time',
  'Weather',
];

export default function PersonalWordBank({ words }: PersonalWordBankProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<
    'danish' | 'lastEncountered' | 'timesEncountered' | 'correctRate'
  >('danish');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredWords = words.filter(
    (word) => selectedCategory === 'All' || word.category === selectedCategory
  );

  const sortedWords = [...filteredWords].sort((a, b) => {
    let aValue: string | number = a[sortBy];
    let bValue: string | number = b[sortBy];

    if (sortBy === 'lastEncountered') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }

    return sortOrder === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getCorrectRateColor = (rate: number) => {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="word-bank">
      <div className="word-bank-header">
        <h2>Personal Word Bank</h2>
        <p>
          {filteredWords.length} words • {words.length} total
        </p>
      </div>

      <div className="word-bank-controls">
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="word-bank-stats">
          <span className="stat">
            <strong>{words.filter((w) => w.correctRate >= 80).length}</strong>{' '}
            mastered
          </span>
          <span className="stat">
            <strong>{words.filter((w) => w.correctRate < 60).length}</strong>{' '}
            need practice
          </span>
        </div>
      </div>

      <div className="word-table-container">
        <table className="word-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('danish')} className="sortable">
                Danish{' '}
                {sortBy === 'danish' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>English</th>
              <th>Pronunciation</th>
              <th
                onClick={() => handleSort('lastEncountered')}
                className="sortable"
              >
                Last Seen{' '}
                {sortBy === 'lastEncountered' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('timesEncountered')}
                className="sortable"
              >
                Count{' '}
                {sortBy === 'timesEncountered' &&
                  (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('correctRate')}
                className="sortable"
              >
                Accuracy{' '}
                {sortBy === 'correctRate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {sortedWords.map((word) => (
              <tr key={word.id}>
                <td className="word-danish">{word.danish}</td>
                <td className="word-english">{word.english}</td>
                <td className="word-ipa">/{word.ipa}/</td>
                <td className="word-date">{word.lastEncountered}</td>
                <td className="word-count">{word.timesEncountered}</td>
                <td
                  className={`word-accuracy ${getCorrectRateColor(
                    word.correctRate
                  )}`}
                >
                  {word.correctRate}%
                </td>
                <td className="word-category">
                  <span className="category-badge">{word.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

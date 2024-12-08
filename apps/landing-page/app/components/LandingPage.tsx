import React from 'react';

const LandingPage = () => {
  return (
    <div className="landing-page p-4 sm:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Polyglottos</h1>
        <p className="text-lg text-gray-600">
          Your ultimate language learning companion
        </p>
      </header>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">About Polyglottos</h2>
        <p className="text-gray-700">
          Polyglottos is designed to help you master new languages through
          interactive quizzes and lessons. Whether you're a beginner or looking
          to refine your skills, our platform provides a comprehensive approach
          to language learning.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            Interactive quizzes: Fill in the blank, multiple choice, and more
          </li>
          <li className="mb-2">
            Structured lessons: Collections of quizzes to test your knowledge
          </li>
          <li className="mb-2">
            Progress tracking: Monitor your comprehension and improvement over
            time
          </li>
          <li className="mb-2">
            Detailed statistics: See your performance broken down by topic,
            difficulty, and quiz type
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <p className="text-gray-700">
          Sign up today and start your journey towards mastering a new language
          with Polyglottos!
        </p>
        <p className="text-gray-700 mt-4">
          Interested in becoming a tutor?{' '}
          <a href="/prospective-tutors" className="text-blue-500 underline">
            Find out more here
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default LandingPage;

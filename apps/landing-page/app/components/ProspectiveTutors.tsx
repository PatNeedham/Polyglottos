import React from 'react';

const ProspectiveTutors = () => {
  return (
    <div className="prospective-tutors p-4 sm:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Empower Learners, Earn Fairly with Polyglottos
        </h1>
      </header>
      <section className="mb-8">
        <p className="text-gray-700">
          Are you passionate about language education? Tired of platforms that
          undervalue your skills? Polyglottos is a new language learning app
          that puts tutors first.
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          Here's why you should join Polyglottos:
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          <li className="mb-2">
            Set Your Own Rates: You control your earning potential. Offer
            30-minute or 1-hour sessions at the price you deserve.
          </li>
          <li className="mb-2">
            Fair Commission: We believe in fair compensation. Keep 90% of your
            earnings – that means if you charge $10/hour, you keep $9 for every
            hour you teach.
          </li>
          <li className="mb-2">
            Flexible Schedule: Teach when you want, as much as you want. Fit
            tutoring around your life, not the other way around.
          </li>
          <li className="mb-2">
            Engaged Community: Connect with motivated learners eager to improve
            their language skills.
          </li>
          <li className="mb-2">
            Innovative Platform: Our app provides tools and resources to enhance
            your teaching and track student progress.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Example Earnings:</h2>
        <p className="text-gray-700">
          Teach just 5 hours a week at $10/hour, and earn $45 per week – perfect
          for supplementing your income or enjoying a fulfilling side hustle.
          Increase your sessions to 10 hours a week, and earn $90 per week – all
          while making a real difference in the lives of your students.
        </p>
        <p className="text-gray-700">
          Join Polyglottos today and become part of a community that values your
          expertise and dedication!
        </p>
        <p className="text-center mt-8">
          <a href="/signup" className="text-blue-500 underline">
            Sign Up Now & Start Tutoring!
          </a>
        </p>
      </section>
    </div>
  );
};

export default ProspectiveTutors;

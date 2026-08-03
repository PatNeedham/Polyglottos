import Comparison from '../components/Comparison';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import LanguageMarquee from '../components/LanguageMarquee';
import MakeItYours from '../components/MakeItYours';
import Nav from '../components/Nav';
import OpenSource from '../components/OpenSource';
import SelfHost from '../components/SelfHost';
import StartCta from '../components/StartCta';

export default function Index() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <LanguageMarquee />
        <HowItWorks />
        <SelfHost />
        <MakeItYours />
        <Comparison />
        <OpenSource />
        <StartCta />
      </main>
      <Footer />
    </>
  );
}

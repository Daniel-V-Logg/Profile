
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import FeaturedGames from '@/components/FeaturedGames';
import IntroSection from '@/components/IntroSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <FeaturedGames />
    </Layout>
  );
};

export default Index;

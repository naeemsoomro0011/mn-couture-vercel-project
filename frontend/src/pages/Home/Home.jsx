import { useState } from 'react';
import AboutHero from '../../components/Home/AboutHero';
import TopPicksCarousel from '../../components/Home/TopPicksCarousel';
import CategoryShowcase from '../../components/Home/CategoryShowcase';
import ShopSection from '../../components/Shop/ShopSection';
import ChatSection from '../../components/Chat/ChatSection';
import GallerySection from '../../components/Gallery/GallerySection';
import ShopInfoSection from '../../components/ShopInfoSection/ShopInfoSection';

const Home = () => {
  const [activeGender, setActiveGender] = useState('');

  const handleCategorySelect = (gender) => {
    setActiveGender(gender);
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <AboutHero />
      <TopPicksCarousel />
      <CategoryShowcase onSelectCategory={handleCategorySelect} />
      <ShopSection activeGender={activeGender} />
      <ChatSection />
      <GallerySection />
      <ShopInfoSection />
    </>
  );
};

export default Home;

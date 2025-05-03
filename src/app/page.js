import Header from '../components/Header';
import Categories from '../components/Categories';
import ProductCard from '../components/ProductCard';
import ConfiguratorSection from '@/components/ConfiguratorSection'; 

export default function Home() {
  return (
    <div>
      <Header />
      <Categories />
      <ProductCard />
      <ConfiguratorSection />
      <main>
      </main>
    </div>
  );
}
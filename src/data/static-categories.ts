// Static category data for server components and static generation
export interface StaticCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
}

// This data matches the initialCategories in CategoryContext
export const staticCategories: StaticCategory[] = [
  {
    id: '1',
    title: 'Rice',
    slug: 'rice',
    description: 'Premium quality rice varieties sourced from the finest farms worldwide.',
    image: '/images/rice.jpg',
    productCount: 0,
    featured: true
  },
  {
    id: '2',
    title: 'Seeds',
    slug: 'seeds',
    description: 'High-yield agricultural seeds for various crops and growing conditions.',
    image: '/images/seeds.jpg',
    productCount: 0,
    featured: true
  },
  {
    id: '3',
    title: 'Oil',
    slug: 'oil',
    description: 'Refined and crude oils for industrial and commercial applications.',
    image: '/images/oil.jpg',
    productCount: 0,
    featured: false
  },
  {
    id: '4',
    title: 'Minerals',
    slug: 'minerals',
    description: 'Industrial-grade polymers for manufacturing and production needs.',
    image: '/images/minerals.jpg',
    productCount: 0,
    featured: false
  },
  {
    id: '5',
    title: 'Bromine',
    slug: 'bromine-salt',
    description: 'High-purity bromine compounds for chemical and industrial use.',
    image: '/images/bromine.jpg',
    productCount: 0,
    featured: false
  },
  {
    id: '6',
    title: 'Sugar',
    slug: 'sugar',
    description: 'High-quality sugar products for various industrial and commercial applications.',
    image: '/images/sugar.jpg',
    productCount: 0,
    featured: false
  },
  {
    id: '7',
    title: 'Special Category',
    slug: 'special-category',
    description: 'Discover our exclusive selection: Explore unique premium products curated just to meet global needs, found only in our special category.',
    image: '/images/special-category.jpg',
    productCount: 0,
    featured: false
  }
];

// Helper function to get category by slug
export function getStaticCategoryBySlug(slug: string): StaticCategory | undefined {
  return staticCategories.find(cat => cat.slug === slug);
}

// Get all category slugs for static paths
export function getAllCategorySlugs(): string[] {
  return staticCategories.map(category => category.slug);
}

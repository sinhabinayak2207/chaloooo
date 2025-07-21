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
    image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: true
  },
  {
    id: '2',
    title: 'Seeds',
    slug: 'seeds',
    description: 'High-yield agricultural seeds for various crops and growing conditions.',
    image: 'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: true
  },
  {
    id: '3',
    title: 'Oil',
    slug: 'oil',
    description: 'Refined and crude oils for industrial and commercial applications.',
    image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: false
  },
  {
    id: '4',
    title: 'Minerals',
    slug: 'minerals',
    description: 'Industrial-grade polymers for manufacturing and production needs.',
    image: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: false
  },
  {
    id: '5',
    title: 'Bromine',
    slug: 'bromine-salt',
    description: 'High-purity bromine compounds for chemical and industrial use.',
    image: 'https://images.pexels.com/photos/6195085/pexels-photo-6195085.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: false
  },
  {
    id: '6',
    title: 'Sugar',
    slug: 'sugar',
    description: 'High-quality sugar products for various industrial and commercial applications.',
    image: 'https://images.pexels.com/photos/6195085/pexels-photo-6195085.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCount: 0,
    featured: false
  },
  {
    id: '7',
    title: 'Special Category',
    slug: 'special-category',
    description: 'Discover our exclusive selection: Explore unique premium products curated just to meet global needs, found only in our special category.',
    image: 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=600',
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

import { getFirestore, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';

/**
 * Interface for product data from Firebase
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  keyFeatures?: string[];
  specifications?: Record<string, string>;
  unit?: string;
  inStock?: boolean;
}

/**
 * Interface for category data from Firebase
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
}

/**
 * Search for products by name, description, or category
 */
export const searchProducts = async (searchTerm: string, maxResults = 5): Promise<Product[]> => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const productsRef = collection(db, 'products');
    
    // Convert search term to lowercase for case-insensitive comparison
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Get all products (we'll filter in memory since Firestore doesn't support full text search)
    const snapshot = await getDocs(productsRef);
    
    const matchingProducts: Product[] = [];
    
    snapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() } as Product;
      
      // Check if product name, description, or category contains the search term
      if (
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm)) ||
        product.category.toLowerCase().includes(lowerSearchTerm)
      ) {
        matchingProducts.push(product);
      }
    });
    
    // Sort by relevance (name match is most relevant)
    matchingProducts.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(lowerSearchTerm) ? 1 : 0;
      const bNameMatch = b.name.toLowerCase().includes(lowerSearchTerm) ? 1 : 0;
      return bNameMatch - aNameMatch;
    });
    
    // Limit results
    return matchingProducts.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryName: string, maxResults = 5): Promise<Product[]> => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const productsRef = collection(db, 'products');
    
    // First, try exact match
    let q = query(productsRef, where('category', '==', categoryName), limit(maxResults));
    let snapshot = await getDocs(q);
    
    // If no results, try case-insensitive match
    if (snapshot.empty) {
      // Get all products and filter in memory
      snapshot = await getDocs(productsRef);
      
      const matchingProducts: Product[] = [];
      const lowerCategoryName = categoryName.toLowerCase();
      
      snapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as Product;
        if (product.category.toLowerCase().includes(lowerCategoryName)) {
          matchingProducts.push(product);
        }
      });
      
      return matchingProducts.slice(0, maxResults);
    }
    
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

/**
 * Get category by name
 */
export const getCategoryByName = async (categoryName: string): Promise<Category | null> => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const categoriesRef = collection(db, 'categories');
    
    // First, try exact match
    let q = query(categoriesRef, where('name', '==', categoryName));
    let snapshot = await getDocs(q);
    
    // If no results, try case-insensitive match
    if (snapshot.empty) {
      // Get all categories and filter in memory
      snapshot = await getDocs(categoriesRef);
      
      let matchingCategory: Category | null = null;
      const lowerCategoryName = categoryName.toLowerCase();
      
      snapshot.forEach((doc) => {
        const category = { id: doc.id, ...doc.data() } as Category;
        if (category.name.toLowerCase().includes(lowerCategoryName)) {
          matchingCategory = category;
        }
      });
      
      return matchingCategory;
    }
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Category;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting category by name:', error);
    return null;
  }
};

/**
 * Format product information for chat response
 */
export const formatProductsForChatResponse = (products: Product[]): string => {
  if (products.length === 0) {
    return "I couldn't find any products matching your query. Please try a different search term or ask about our available categories.";
  }
  
  let response = `Here are the products I found:\n\n`;
  
  products.forEach((product, index) => {
    response += `${index + 1}. **${product.name}**\n`;
    if (product.description) {
      response += `   ${product.description}\n`;
    }
    if (product.price) {
      response += `   Price: $${product.price.toLocaleString()} ${product.unit || ''}\n`;
    }
    if (product.keyFeatures && product.keyFeatures.length > 0) {
      response += `   Key Features: ${product.keyFeatures.join(', ')}\n`;
    }
    response += `\n`;
  });
  
  response += `Would you like more specific information about any of these products?`;
  
  return response;
};

/**
 * Format category information for chat response
 */
export const formatCategoriesForChatResponse = (categories: Category[]): string => {
  if (categories.length === 0) {
    return "We don't have any product categories available at the moment. Please check back later.";
  }
  
  let response = `Here are our product categories:\n\n`;
  
  categories.forEach((category, index) => {
    response += `${index + 1}. **${category.name}** (${category.productCount} products)\n`;
    if (category.description) {
      response += `   ${category.description}\n`;
    }
    response += `\n`;
  });
  
  response += `You can ask me about specific products in any of these categories!`;
  
  return response;
};

/**
 * Process a product-related query and return a response
 */
export const processProductQuery = async (query: string): Promise<string | null> => {
  try {
    // Normalize query
    const normalizedQuery = query.toLowerCase();
    
    // Check if query is about categories
    if (
      normalizedQuery.includes('categories') || 
      normalizedQuery.includes('category') ||
      normalizedQuery.includes('what do you sell') ||
      normalizedQuery.includes('what do you offer')
    ) {
      const categories = await getAllCategories();
      return formatCategoriesForChatResponse(categories);
    }
    
    // Extract category name from query if it exists
    const categoryKeywords = [
      'rice', 'seeds', 'oil', 'minerals', 'bromine', 'sugar', 'special'
    ];
    
    let categoryMatch = null;
    for (const keyword of categoryKeywords) {
      if (normalizedQuery.includes(keyword)) {
        categoryMatch = keyword;
        break;
      }
    }
    
    if (categoryMatch) {
      // Query is about a specific category
      const products = await getProductsByCategory(categoryMatch, 5);
      if (products.length > 0) {
        return formatProductsForChatResponse(products);
      }
    }
    
    // General product search
    if (
      normalizedQuery.includes('product') || 
      normalizedQuery.includes('item') ||
      normalizedQuery.includes('goods') ||
      normalizedQuery.includes('merchandise')
    ) {
      // Extract potential product name
      const searchTerm = normalizedQuery.replace(/tell me about|show me|what about|do you have|do you sell|i want to know about|products|items|goods|merchandise/g, '').trim();
      
      if (searchTerm) {
        const products = await searchProducts(searchTerm, 5);
        if (products.length > 0) {
          return formatProductsForChatResponse(products);
        }
      } else {
        // General product inquiry
        const categories = await getAllCategories();
        return formatCategoriesForChatResponse(categories);
      }
    }
    
    // No product-related query detected
    return null;
  } catch (error) {
    console.error('Error processing product query:', error);
    return "I'm having trouble retrieving product information at the moment. Please try again later or contact our support team.";
  }
};

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import { addCategory as addFirebaseCategory, removeCategory as removeFirebaseCategory } from '@/lib/firebase-db';
import { useProducts, Product } from './ProductContext';

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  imageUrl?: string; // Added for compatibility with new components
  productCount: number;
  featured?: boolean;
  updatedAt?: Date;
  updatedBy?: string;
}

// Initial category data
export const initialCategories: Category[] = [
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

interface CategoryContextType {
  categories: Category[];
  featuredCategories: Category[];
  updateCategoryFeaturedStatus: (categoryId: string, featured: boolean) => Promise<void>;
  updateCategoryImage: (categoryId: string, imageUrl: string) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  addCategory: (category: { title: string, description: string, image?: string }) => Promise<string>;
  removeCategory: (categoryId: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const productContext = useProducts();

  // Initialize categories from hardcoded data but get imageUrl and featured status from Firebase
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        // Start with hardcoded categories
        let baseCategories = initialCategories.map(category => ({
          ...category,
          imageUrl: category.image // Default imageUrl to hardcoded image
        }));
        
        // Try to get categories data from Firebase
        try {
          const { getAllCategories } = await import('@/lib/firebase-db');
          const firebaseCategories = await getAllCategories();
          
          if (firebaseCategories && firebaseCategories.length > 0) {
            console.log('Found Firebase categories, extracting data');
            
            // Create maps of Firebase category IDs to their data
            const firebaseImageMap: Record<string, string> = {};
            const firebaseFeaturedMap: Record<string, boolean> = {};
            
            firebaseCategories.forEach(fbCategory => {
              if (fbCategory.id) {
                // Extract image URLs
                if (fbCategory.imageUrl || fbCategory.image) {
                  firebaseImageMap[fbCategory.id] = fbCategory.imageUrl || fbCategory.image || '';
                }
                
                // Extract featured status
                if (fbCategory.featured !== undefined) {
                  firebaseFeaturedMap[fbCategory.id] = fbCategory.featured;
                  console.log(`Firebase category ${fbCategory.id} featured status:`, fbCategory.featured);
                }
              }
            });
            
            // Update our hardcoded categories with Firebase data
            baseCategories = baseCategories.map(category => {
              if (category.id) {
                const updates: Partial<Category> = {};
                
                // Update image if available
                if (firebaseImageMap[category.id]) {
                  updates.imageUrl = firebaseImageMap[category.id];
                  updates.image = firebaseImageMap[category.id];
                }
                
                // Update featured status if available
                if (firebaseFeaturedMap[category.id] !== undefined) {
                  updates.featured = firebaseFeaturedMap[category.id];
                  console.log(`Updating category ${category.id} featured status from Firebase:`, updates.featured);
                }
                
                return { ...category, ...updates };
              }
              return category;
            });
          }
        } catch (fbError) {
          console.warn('Could not fetch Firebase categories:', fbError);
          // Continue with hardcoded categories
        }
        
        // Try to load cached category data from localStorage
        let cachedCategories = [...baseCategories];
        try {
          if (typeof window !== 'undefined') {
            // Check for individual category caches first (more specific)
            for (const category of baseCategories) {
              const storageKey = `category_${category.id}`;
              const cachedCategoryData = localStorage.getItem(storageKey);
              
              if (cachedCategoryData) {
                try {
                  const cachedCategory = JSON.parse(cachedCategoryData);
                  const updates: Partial<Category> = {};
                  
                  // Handle image caching
                  if (cachedCategory.image) {
                    // For Cloudinary URLs, don't add timestamp parameters
                    let cachedImageUrl = cachedCategory.image;
                    
                    // Only add timestamp for non-Cloudinary URLs
                    if (!cachedCategory.image.includes('cloudinary.com')) {
                      const timestamp = new Date().getTime();
                      cachedImageUrl = cachedCategory.image.includes('?') 
                        ? `${cachedCategory.image}&t=${timestamp}` 
                        : `${cachedCategory.image}?t=${timestamp}`;
                    }
                    
                    console.log(`Applying cached image for category ${category.id}: ${cachedImageUrl}`);
                    updates.image = cachedCategory.image;
                    updates.imageUrl = cachedImageUrl;
                  }
                  
                  // Handle featured status
                  if (cachedCategory.featured !== undefined) {
                    console.log(`Applying cached featured status for category ${category.id}: ${cachedCategory.featured}`);
                    updates.featured = cachedCategory.featured;
                  }
                  
                  // Update the category in our array if we have updates
                  if (Object.keys(updates).length > 0) {
                    const index = cachedCategories.findIndex(c => c.id === category.id);
                    if (index !== -1) {
                      cachedCategories[index] = {
                        ...cachedCategories[index],
                        ...updates
                      };
                    }
                  }
                } catch (e) {
                  console.warn(`Failed to parse cached category ${category.id}:`, e);
                }
              }
            }
            
            // Also check legacy categoryCache format as fallback
            const categoryCache = JSON.parse(localStorage.getItem('categoryCache') || '{}');
            console.log('Found category cache:', categoryCache);
            
            // Apply cached data to categories that weren't already updated
            cachedCategories = cachedCategories.map(category => {
              const cached = categoryCache[category.id];
              if (cached) {
                const updates: Partial<Category> = {};
                
                // Handle image caching
                if (cached.image && category.imageUrl === category.image) {
                  // For Cloudinary URLs, don't add timestamp parameters
                  let cachedImageUrl = cached.image;
                  
                  // Only add timestamp for non-Cloudinary URLs
                  if (!cached.image.includes('cloudinary.com')) {
                    const timestamp = new Date().getTime();
                    cachedImageUrl = cached.image.includes('?') 
                      ? `${cached.image}&t=${timestamp}` 
                      : `${cached.image}?t=${timestamp}`;
                  }
                  
                  console.log(`Applying legacy cached image for category ${category.id}: ${cachedImageUrl}`);
                  updates.image = cached.image;
                  updates.imageUrl = cachedImageUrl;
                }
                
                // Handle featured status
                if (cached.featured !== undefined) {
                  console.log(`Applying legacy cached featured status for category ${category.id}: ${cached.featured}`);
                  updates.featured = cached.featured;
                }
                
                // Apply updates if we have any
                if (Object.keys(updates).length > 0) {
                  return {
                    ...category,
                    ...updates
                  };
                }
              }
              return category;
            });
            console.log('Categories with cached data:', cachedCategories);
          }
        } catch (cacheError) {
          console.error('Error loading from localStorage:', cacheError);
        }
        
        // In a real app, you would fetch categories from Firestore here
        // For now, we'll use the cachedCategories
        setCategories(cachedCategories);
      } catch (error) {
        console.error('Error initializing categories:', error);
      }
    };

    // Listen for refresh events
    const handleRefresh = async () => {
      console.log('Refreshing category images from Firebase');
      
      // Clear localStorage cache to force fresh data
      if (typeof window !== 'undefined') {
        // Clear individual category caches
        for (const category of categories) {
          localStorage.removeItem(`category_${category.id}`);
        }
        // Clear global cache
        localStorage.removeItem('categoryCache');
      }
      
      // Re-fetch just the images from Firebase
      await initializeCategories();
    };

    // Listen for product count updates
    const handleProductCountUpdate = (event: CustomEvent) => {
      const { categoryId, productCount } = event.detail;
      console.log(`Updating product count for category ${categoryId} to ${productCount}`);
      
      setCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          if (category.slug === categoryId) {
            return {
              ...category,
              productCount
            };
          }
          return category;
        });
        return updatedCategories;
      });
      
      // Dispatch event to notify other components that categories have been updated
      const updateEvent = new CustomEvent('categoryUpdated');
      window.dispatchEvent(updateEvent);
    };
    
    window.addEventListener('categoryProductCountUpdated', handleProductCountUpdate as EventListener);
    window.addEventListener('refreshCategories', handleRefresh);
    initializeCategories();
    
    // Update product counts based on products in ProductContext
    if (productContext && productContext.products) {
      const productCounts: Record<string, number> = {};
      
      // Count products by category
      productContext.products.forEach(product => {
        if (product.category) {
          productCounts[product.category] = (productCounts[product.category] || 0) + 1;
        }
      });
      
      // Update category product counts
      setCategories(prevCategories => {
        return prevCategories.map(category => {
          const count = productCounts[category.slug] || 0;
          if (count !== category.productCount) {
            return {
              ...category,
              productCount: count
            };
          }
          return category;
        });
      });
    }
    
    return () => {
      window.removeEventListener('refreshCategories', handleRefresh);
    };
  }, []);

  // Update featured categories whenever categories change
  useEffect(() => {
    const featured = categories.filter(category => category.featured === true);
    setFeaturedCategories(featured);
  }, [categories]);

  // Update product counts dynamically based on actual products
  useEffect(() => {
    if (productContext?.products) {
      const products = productContext.products;
      
      // Create a count of products per category
      const categoryCounts: Record<string, number> = {};
      
      // Count products for each category
      products.forEach((product: Product) => {
        const categorySlug = product.category.toLowerCase();
        if (!categoryCounts[categorySlug]) {
          categoryCounts[categorySlug] = 0;
        }
        categoryCounts[categorySlug]++;
      });
      
      // Update category counts
      const updatedCategories = categories.map(category => ({
        ...category,
        productCount: categoryCounts[category.slug.toLowerCase()] || 0
      }));
      
      setCategories(updatedCategories);
    }
  }, [productContext?.products]);

  // Helper function to get current user
  const getCurrentUser = async (): Promise<string> => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      return auth.currentUser?.email || 'system@b2b-showcase.com';
    } catch (authError) {
      console.warn('Could not get current user, using default:', authError);
      return 'system@b2b-showcase.com';
    }
  };

  /**
   * Update a category's featured status
   * @param categoryId The ID of the category to update
   * @param featured Whether the category should be featured
   */
  const updateCategoryFeaturedStatus = async (categoryId: string, featured: boolean): Promise<void> => {
    try {
      console.log(`Updating featured status for category ${categoryId} to ${featured ? 'featured' : 'not featured'}`);
      
      // Check if we're trying to feature more than 3 categories
      if (featured) {
        const currentFeaturedCount = categories.filter(c => c.featured && c.id !== categoryId).length;
        if (currentFeaturedCount >= 3) {
          console.log('Cannot feature more than 3 categories. Please unfeatured one first.');
          throw new Error('Maximum of 3 featured categories allowed. Please unfeature one first.');
        }
      }
      
      const updatedBy = await getCurrentUser();
      
      // Update local state
      setCategories(prevCategories => prevCategories.map(category => {
        if (category.id === categoryId) {
          return { ...category, featured, updatedAt: new Date(), updatedBy };
        }
        return category;
      }));

      // Save to localStorage for persistence
      try {
        if (typeof window !== 'undefined') {
          // Update individual category cache
          const storageKey = `category_${categoryId}`;
          const cachedCategory = JSON.parse(localStorage.getItem(storageKey) || '{}');
          const updatedCache = {
            ...cachedCategory,
            id: categoryId,
            featured: featured,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(updatedCache));
          console.log(`Updated individual category cache for ${categoryId} with featured status:`, featured);
          
          // Also update the global categoryCache
          const globalCache = JSON.parse(localStorage.getItem('categoryCache') || '{}');
          globalCache[categoryId] = {
            ...globalCache[categoryId],
            featured: featured,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('categoryCache', JSON.stringify(globalCache));
          console.log('Updated global category cache with featured status:', featured);
        }
      } catch (e) {
        console.warn('Failed to update localStorage cache:', e);
      }
      
      // Update featured status in Firebase
      try {
        const { updateCategoryFeaturedStatus } = await import('@/lib/firebase-db');
        await updateCategoryFeaturedStatus(categoryId, featured, updatedBy);
        console.log(`Updated category featured status in Firestore: ${featured}`);
      } catch (dbError) {
        console.error('Error updating category featured status in Firestore:', dbError);
        // Continue with local state update even if Firestore update fails
      }

      // Notify UI components that category data has changed
      window.dispatchEvent(new CustomEvent('categoryUpdated', {
        detail: { categoryId }
      }));

      console.log(`Category ${categoryId} featured status updated to ${featured}`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }
  };

  /**
   * Wrapper for updateCategory to maintain backward compatibility
   * @param categoryId The ID of the category to update
   * @param imageUrl The new image URL
   */
  const updateCategoryImage = async (categoryId: string, imageUrl: string): Promise<void> => {
    return updateCategory(categoryId, { imageUrl });
  };

  /**
   * Update a category with partial data
   * @param categoryId The ID of the category to update
   * @param updates Partial category data to update
   */
  const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<void> => {
    try {
      if (!categoryId) {
        console.error('CategoryContext: Invalid categoryId for updateCategory');
        return;
      }

      const updatedBy = await getCurrentUser();
      
      // Create a processed update object to ensure image fields are synchronized
      const processedUpdates = { ...updates, updatedAt: new Date(), updatedBy };
      
      // If this is an image update, handle it specially
      if (updates.image || updates.imageUrl) {
        // Get the URL (prefer imageUrl over image for backward compatibility)
        const imageUrl = updates.imageUrl || updates.image || '';
        
        // For Cloudinary URLs, don't add timestamp parameters
        // Just ensure both image and imageUrl fields are set to the same value
        processedUpdates.image = imageUrl;
        processedUpdates.imageUrl = imageUrl;
        
        console.log(`Setting category image to URL: ${imageUrl}`);
        
        // Update individual category cache
        try {
          if (typeof window !== 'undefined') {
            // Update individual category cache
            const storageKey = `category_${categoryId}`;
            const cachedCategory = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const updatedCache = {
              ...cachedCategory,
              id: categoryId,
              image: imageUrl,
              imageUrl: imageUrl,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(updatedCache));
            console.log(`Updated individual category cache for ${categoryId}:`, updatedCache);
            
            // Also update the global categoryCache
            const globalCache = JSON.parse(localStorage.getItem('categoryCache') || '{}');
            globalCache[categoryId] = {
              ...globalCache[categoryId],
              image: imageUrl,
              imageUrl: imageUrl,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('categoryCache', JSON.stringify(globalCache));
            console.log('Updated global category cache:', globalCache);
            
            // Force browser to load the new image
            const tempImg = new Image();
            tempImg.src = imageUrl;
          }
        } catch (e) {
          console.warn('Failed to update localStorage cache:', e);
        }
        
        // Update only the image URL in Firestore
        try {
          const { updateCategoryImage } = await import('@/lib/firebase-db');
          // Update both image and imageUrl fields in Firebase for consistency
          await updateCategoryImage(categoryId, imageUrl, updatedBy);
          console.log(`Updated category image in Firestore: ${imageUrl}`);
          
          // Force a refresh to get the updated image URL from Firebase
          setTimeout(() => {
            window.dispatchEvent(new Event('refreshCategories'));
          }, 1000);
        } catch (dbError) {
          console.error('Error updating category image in Firestore:', dbError);
          // Continue with local state update even if Firestore update fails
        }
      }
      
      // Update local state
      setCategories(prevCategories => {
        const newCategories = prevCategories.map(category => {
          if (category.id === categoryId) {
            return { ...category, ...processedUpdates };
          }
          return category;
        });
        return newCategories;
      });

      // Notify UI components that category data has changed
      setTimeout(() => {
        // Dispatch event to window and document for maximum compatibility
        const event = new CustomEvent('categoryUpdated', {
          detail: { categoryId, updates: processedUpdates, imageUpdated: !!(updates.image || updates.imageUrl) },
          bubbles: true
        });
        window.dispatchEvent(event);
        document.dispatchEvent(event);
        
        // Also dispatch a global refresh event if image was updated
        if (updates.image || updates.imageUrl) {
          window.dispatchEvent(new Event('refreshCategories'));
        }
      }, 0);
      
      console.log(`Category ${categoryId} updated successfully`);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Add a new category
  const addCategory = async (category: { title: string, description: string, image?: string }): Promise<string> => {
    try {
      const user = await getCurrentUser();
      const newCategoryId = await addFirebaseCategory(category, user);
      
      // Update local state
      const newCategory: Category = {
        id: newCategoryId,
        title: category.title,
        slug: category.title.toLowerCase().replace(/\s+/g, '-'),
        description: category.description,
        image: category.image || '',
        imageUrl: category.image || '',
        productCount: 0,
        featured: false,
        updatedAt: new Date(),
        updatedBy: user
      };
      
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Dispatch event for components to update
      window.dispatchEvent(new CustomEvent('categoryAdded', { detail: { categoryId: newCategoryId } }));
      
      return newCategoryId;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };
  
  // Remove a category
  const removeCategory = async (categoryId: string): Promise<void> => {
    try {
      await removeFirebaseCategory(categoryId);
      
      // Update local state
      setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
      
      // Dispatch event for components to update
      window.dispatchEvent(new CustomEvent('categoryRemoved', { detail: { categoryId } }));
    } catch (error) {
      console.error('Error removing category:', error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      featuredCategories,
      updateCategoryFeaturedStatus,
      updateCategoryImage,
      updateCategory,
      addCategory,
      removeCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

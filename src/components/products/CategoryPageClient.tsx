"use client";

import { useState, useEffect } from "react";
import Section from "../ui/Section";
import ProductCard from "./ProductCard";
import { useProducts, Product, initialProducts } from "@/context/ProductContext";
import { StaticCategory } from "@/data/static-categories";

interface CategoryPageClientProps {
  category: StaticCategory;
  categorySlug: string;
}

export default function CategoryPageClient({ category, categorySlug }: CategoryPageClientProps) {
  const productContext = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Initialize products and handle loading state
  useEffect(() => {
    // Start with a short timeout to prevent immediate loading state flicker
    const timer = setTimeout(() => {
      try {
        // Get products from context if available
        if (productContext && productContext.products && productContext.products.length > 0) {
          setProducts(productContext.products);
        } else {
          // Fallback to initialProducts if context is not available
          setProducts(initialProducts);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(true);
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [productContext]);
  
  // Filter products by category
  const categoryProducts = products.filter((product: Product) => 
    product.category.toLowerCase() === categorySlug.toLowerCase()
  );
  
  if (loading) {
    return (
      <Section background="white">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Section>
    );
  }
  
  if (error) {
    return (
      <Section background="white">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Something Went Wrong</h2>
          <p className="text-gray-600 mb-8">We're having trouble loading products. Please try again later.</p>
        </div>
      </Section>
    );
  }
  
  return (
    <>
      <Section background="gradient" paddingY="lg">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-700">
            {category.title} <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {category.description}
          </p>
        </div>
      </Section>
      
      <Section background="white">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.name}
                description={product.description}
                image={product.imageUrl}
                category={product.category}
                slug={product.slug}
                featured={product.featured}
                inStock={product.inStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No products found</h3>
            <p className="text-gray-600">
              There are currently no products available in this category.
              Please check back later or explore our other product categories.
            </p>
          </div>
        )}
      </Section>
    </>
  );
}

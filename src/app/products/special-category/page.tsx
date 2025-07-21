"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import Section from "../../../components/ui/Section";
import { useProducts } from "@/context/ProductContext";
import { useCategories, Category } from "@/context/CategoryContext";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

export default function SpecialCategoryPage() {
  const { products } = useProducts() || { products: [] };
  const { categories } = useCategories() || { categories: [] };
  const [specialCategory, setSpecialCategory] = useState<Category | null>(null);
  const [specialCategoryProducts, setSpecialCategoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the Special Category
    const category = categories.find(cat => cat.slug === 'special-category');
    if (category) {
      setSpecialCategory(category);
    }

    // Filter products by the special-category
    const filteredProducts = products.filter(product => product.category === 'special-category');
    setSpecialCategoryProducts(filteredProducts);

    // Update the product count for this category
    if (category && filteredProducts.length !== category.productCount) {
      // Dispatch an event to update the product count
      const event = new CustomEvent('categoryProductCountUpdated', {
        detail: {
          categoryId: 'special-category',
          productCount: filteredProducts.length
        }
      });
      window.dispatchEvent(event);
    }

    if (products.length > 0) {
      setLoading(false);
    }
  }, [products, categories]);

  if (loading) {
    return (
      <MainLayout>
        <Section background="white">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section background="gradient" paddingY="lg">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-700">
            <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">Special Category</span> Products
          </h1>
          {specialCategory && (
            <p className="text-lg text-gray-600 mb-8">
              {specialCategory.description}
            </p>
          )}
        </div>
      </Section>

      <Section background="white">
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link href="/products" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Products</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Special Category</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {specialCategoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialCategoryProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                title={product.title}
                description={product.description}
                image={product.image}
                category={product.category}
                slug={product.slug}
                featured={product.featured}
                inStock={product.inStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Products Found</h2>
            <p className="text-gray-500 mb-8">
              There are currently no products in this category.
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Browse Other Products
              <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </Link>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}

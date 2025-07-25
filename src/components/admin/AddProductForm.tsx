"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useProducts } from '@/context/ProductContext';
import { logToSystem } from '@/components/SystemLog';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/cloudinary';
import { Switch } from '@/components/ui/Switch';

interface Category {
  id: string;
  name: string;
}

const productCategories: Category[] = [
  { id: 'rice', name: 'Rice' },
  { id: 'seeds', name: 'Seeds' },
  { id: 'oil', name: 'Oil' },
  { id: 'minerals', name: 'Minerals' },
  { id: 'bromine-salt', name: 'Bromine' },
  { id: 'sugar', name: 'Sugar' },
  { id: 'special-category', name: 'Special Category' },
];

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded?: (productId: string) => void;
}

export default function AddProductForm({ onClose, onProductAdded }: AddProductFormProps) {
  const { user, isMasterAdmin } = useAuth();
  const productContext = useProducts();
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([{key: '', value: ''}]);
  const [keyFeatures, setKeyFeatures] = useState<string[]>(['']);
  const [showPricing, setShowPricing] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    category: 'rice',
    imageUrl: '',
    featured: false,
    inStock: true,
    price: '',
    unit: ''
  });

  if (!productContext) {
    return <div className="p-4 text-red-500">Error: Product context not available</div>;
  }

  const { addProduct } = productContext;

  // Handle product form changes
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product image upload for new product
  const handleProductFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImageFile(e.target.files[0]);
    }
  };

  // Handle add product form submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!newProductForm.name || !newProductForm.description || !newProductForm.category) {
        logToSystem('Please fill all required fields', 'error');
        return;
      }
      
      // Validate pricing fields if pricing is enabled
      if (showPricing) {
        if (!newProductForm.price || parseFloat(newProductForm.price) <= 0) {
          logToSystem('Please enter a valid price when pricing is enabled', 'error');
          return;
        }
        if (!newProductForm.unit || newProductForm.unit.trim() === '') {
          logToSystem('Please enter a unit when pricing is enabled', 'error');
          return;
        }
      }
      
      // Validate advanced options if they are being added
      if (isMasterAdmin && showAdvancedOptions) {
        // Filter out empty specifications
        const validSpecs = specifications.filter(spec => spec.key.trim() !== '' && spec.value.trim() !== '');
        if (validSpecs.length === 0 && specifications.length > 1) {
          logToSystem('Please add at least one valid specification or remove empty ones', 'error');
          return;
        }
        
        // Filter out empty key features
        const validFeatures = keyFeatures.filter(feature => feature.trim() !== '');
        if (validFeatures.length === 0 && keyFeatures.length > 1) {
          logToSystem('Please add at least one valid key feature or remove empty ones', 'error');
          return;
        }
      }
      
      let imageUrl = newProductForm.imageUrl;
      
      // Upload image to Cloudinary if provided
      if (productImageFile) {
        try {
          logToSystem(`Uploading image for product ${newProductForm.name}...`, 'info');
          imageUrl = await uploadImage(productImageFile, 'products');
          logToSystem(`Image uploaded successfully: ${imageUrl}`, 'success');
        } catch (error) {
          logToSystem(`Error uploading image: ${error instanceof Error ? error.message : String(error)}`, 'error');
          // Continue with default image if upload fails
          imageUrl = 'https://via.placeholder.com/300x300?text=Product+Image';
        }
      } else {
        // Set a default image if none provided
        imageUrl = 'https://via.placeholder.com/300x300?text=Product+Image';
      }
      
      // Always initialize with empty objects/arrays to avoid undefined values
      let productSpecifications: Record<string, string> = {};
      let productKeyFeatures: string[] = [];
      
      // Only process advanced options if toggle is on
      if (isMasterAdmin && showAdvancedOptions) {
        // Process specifications
        specifications.forEach(spec => {
          if (spec.key.trim() !== '' && spec.value.trim() !== '') {
            productSpecifications[spec.key.trim()] = spec.value.trim();
          }
        });
        
        if (Object.keys(productSpecifications).length > 0) {
          logToSystem(`Added ${Object.keys(productSpecifications).length} specifications to product`, 'info');
        }
        
        // Process key features
        productKeyFeatures = keyFeatures.filter(feature => feature.trim() !== '');
        
        if (productKeyFeatures.length > 0) {
          logToSystem(`Added ${productKeyFeatures.length} key features to product`, 'info');
        }
      }
      
      // Log what's happening with the advanced fields
      logToSystem(`Advanced toggle is ${showAdvancedOptions ? 'ON' : 'OFF'}`, 'info');
      logToSystem(`Key Features count: ${productKeyFeatures.length}`, 'info');
      logToSystem(`Specifications count: ${Object.keys(productSpecifications).length}`, 'info');
      
      // Create product object with the image URL, key features, specifications, and pricing
      const newProduct: any = {
        ...newProductForm,
        imageUrl: imageUrl, // Use the uploaded image URL or default
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user?.email || 'admin',
        keyFeatures: productKeyFeatures,
        specifications: productSpecifications,
        showPricing: showPricing
      };
      
      // Only add price and unit if pricing is enabled to avoid Firebase undefined errors
      if (showPricing && newProductForm.price) {
        newProduct.price = parseFloat(newProductForm.price);
      }
      if (showPricing && newProductForm.unit) {
        newProduct.unit = newProductForm.unit;
      }
      
      // Add product to database
      // Explicitly pass the user email to ensure proper permissions
      const productId = await addProduct(newProduct);
      console.log(`Product added by user: ${user?.email || 'admin'}`);
      logToSystem(`Product ${newProductForm.name} added with ID: ${productId}`, 'success');
      
      // Reset form and close modal
      setNewProductForm({
        name: '',
        description: '',
        category: 'rice',
        imageUrl: '',
        featured: false,
        inStock: true,
        price: '',
        unit: ''
      });
      setShowPricing(false);
      setProductImageFile(null);
      setSpecifications([{key: '', value: ''}]);
      setKeyFeatures(['']);
      
      // Call onProductAdded callback if provided
      if (onProductAdded) {
        onProductAdded(productId);
      } else {
        onClose();
      }
    } catch (error) {
      logToSystem(`Error adding product: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleAddProduct} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Image Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-80">
                {productImageFile ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={URL.createObjectURL(productImageFile)} 
                      alt="Product preview" 
                      fill
                      className="object-contain" 
                    />
                    <button 
                      type="button"
                      onClick={() => setProductImageFile(null)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Upload product image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="product-image" 
                  accept="image/*" 
                  onChange={handleProductFormFileChange}
                  className="hidden" 
                />
                <label 
                  htmlFor="product-image"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  {productImageFile ? 'Change Image' : 'Select Image'}
                </label>
              </div>
            </div>
            
            {/* Right Column - Product Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={newProductForm.name}
                  onChange={handleProductFormChange}
                  className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  value={newProductForm.category}
                  onChange={handleProductFormChange}
                  className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {productCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={4} 
                  value={newProductForm.description}
                  onChange={handleProductFormChange}
                  className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input 
                    id="featured" 
                    name="featured" 
                    type="checkbox" 
                    checked={newProductForm.featured}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">Featured Product</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    id="inStock" 
                    name="inStock" 
                    type="checkbox" 
                    checked={newProductForm.inStock}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">In Stock</label>
                </div>
              </div>
              
              {/* Pricing Toggle */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Pricing Information</h3>
                  <Switch 
                    id="pricing-toggle" 
                    checked={showPricing} 
                    onChange={setShowPricing}
                    label={showPricing ? "Show Pricing" : "Hide Pricing"}
                    description={showPricing ? "Price and unit will be displayed" : "Product will show without pricing"}
                  />
                </div>
                
                {showPricing && (
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                      <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        step="0.01"
                        min="0"
                        value={newProductForm.price}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter price"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                      <input 
                        type="text" 
                        id="unit" 
                        name="unit" 
                        value={newProductForm.unit}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., per kg, per ton, per piece"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Master Admin Advanced Options Toggle - Only visible to master admins */}
              {isMasterAdmin && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Advanced Product Details</h3>
                    <Switch 
                      id="advanced-options-toggle" 
                      checked={showAdvancedOptions} 
                      onChange={setShowAdvancedOptions}
                      label={showAdvancedOptions ? "Advanced Mode" : "Basic Mode"}
                      description={showAdvancedOptions ? "Add detailed features and specifications" : "Standard product information"}
                    />
                  </div>
                  
                  {showAdvancedOptions && (
                    <div className="space-y-6 bg-gray-50 p-3 rounded-md">
                      {/* Key Features Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">Key Features</h4>
                          <button
                            type="button"
                            onClick={() => setKeyFeatures([...keyFeatures, ''])}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add Feature
                          </button>
                        </div>
                        
                        {keyFeatures.map((feature, index) => (
                          <div key={`feature-${index}`} className="flex space-x-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Feature Name"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...keyFeatures];
                                  newFeatures[index] = e.target.value;
                                  setKeyFeatures(newFeatures);
                                }}
                                className="w-full text-sm border text-black border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            {keyFeatures.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newFeatures = [...keyFeatures];
                                  newFeatures.splice(index, 1);
                                  setKeyFeatures(newFeatures);
                                }}
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Specifications Section */}
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">Product Specifications</h4>
                          <button
                            type="button"
                            onClick={() => setSpecifications([...specifications, {key: '', value: ''}])}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add Spec
                          </button>
                        </div>
                        
                        {specifications.map((spec, index) => (
                          <div key={index} className="flex space-x-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Specification Key"
                                value={spec.key}
                                onChange={(e) => {
                                  const newSpecs = [...specifications];
                                  newSpecs[index].key = e.target.value;
                                  setSpecifications(newSpecs);
                                }}
                                className="w-full text-sm border text-black border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Specification Value"
                                value={spec.value}
                                onChange={(e) => {
                                  const newSpecs = [...specifications];
                                  newSpecs[index].value = e.target.value;
                                  setSpecifications(newSpecs);
                                }}
                                className="w-full text-sm border text-black border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            {specifications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSpecs = [...specifications];
                                  newSpecs.splice(index, 1);
                                  setSpecifications(newSpecs);
                                }}
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

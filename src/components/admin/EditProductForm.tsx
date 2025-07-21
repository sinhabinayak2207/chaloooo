"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProducts } from '@/context/ProductContext';
import { logToSystem } from '@/components/SystemLog';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/cloudinary';
import { Switch } from '@/components/ui/Switch';
import { Product } from '@/context/ProductContext';

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

interface EditProductFormProps {
  onClose: () => void;
  productId: string;
  onProductUpdated?: () => void;
}

export default function EditProductForm({ onClose, productId, onProductUpdated }: EditProductFormProps) {
  const { user, isMasterAdmin } = useAuth();
  const productContext = useProducts();
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([{key: '', value: ''}]);
  const [keyFeatures, setKeyFeatures] = useState<string[]>(['']);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category: 'rice',
    imageUrl: '',
    featured: false,
    inStock: true
  });

  useEffect(() => {
    // Load product data when component mounts
    if (productContext && productId) {
      const product = productContext.products.find(p => p.id === productId);
      if (product) {
        setProductForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price ? product.price.toString() : '',
          unit: product.unit || 'kg',
          category: product.category || 'rice',
          imageUrl: product.imageUrl || '',
          featured: product.featured || false,
          inStock: product.inStock !== false // Default to true if undefined
        });
        
        // Set showPricing based on product data
        setShowPricing(product.showPricing || false);

        // Load specifications if they exist
        if (product.specifications) {
          const specs = Object.entries(product.specifications).map(([key, value]) => ({
            key,
            value
          }));
          setSpecifications(specs.length > 0 ? specs : [{key: '', value: ''}]);
          setShowAdvancedOptions(specs.length > 0);
        }

        // Load key features if they exist
        if (product.keyFeatures && product.keyFeatures.length > 0) {
          setKeyFeatures(product.keyFeatures);
          setShowAdvancedOptions(true);
        }
      }
    }
  }, [productContext, productId]);

  if (!productContext) {
    return <div className="p-4 text-red-500">Error: Product context not available</div>;
  }

  // Handle product form changes
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'price' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  // Handle product image upload
  const handleProductFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImageFile(e.target.files[0]);
    }
  };

  // Add a new specification field
  const addSpecification = () => {
    setSpecifications([...specifications, {key: '', value: ''}]);
  };

  // Remove a specification field
  const removeSpecification = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs.length > 0 ? newSpecs : [{key: '', value: ''}]);
  };

  // Update a specification field
  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  // Add a new key feature field
  const addKeyFeature = () => {
    setKeyFeatures([...keyFeatures, '']);
  };

  // Remove a key feature field
  const removeKeyFeature = (index: number) => {
    const newFeatures = [...keyFeatures];
    newFeatures.splice(index, 1);
    setKeyFeatures(newFeatures.length > 0 ? newFeatures : ['']);
  };

  // Update a key feature field
  const updateKeyFeature = (index: number, value: string) => {
    const newFeatures = [...keyFeatures];
    newFeatures[index] = value;
    setKeyFeatures(newFeatures);
  };

  // Handle update product form submission
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!productForm.name || !productForm.description || !productForm.category) {
        logToSystem('Please fill all required fields', 'error');
        return;
      }
      
      // Validate pricing fields if pricing is enabled
      if (showPricing) {
        if (!productForm.price || parseFloat(productForm.price) <= 0) {
          logToSystem('Please enter a valid price when pricing is enabled', 'error');
          return;
        }
        if (!productForm.unit || productForm.unit.trim() === '') {
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
      
      let imageUrl = productForm.imageUrl;
      
      // Upload image to Cloudinary if provided
      if (productImageFile) {
        try {
          logToSystem(`Uploading image for product ${productForm.name}...`, 'info');
          imageUrl = await uploadImage(productImageFile, `products/${productId}`);
          logToSystem(`Image uploaded successfully: ${imageUrl}`, 'success');
        } catch (error) {
          logToSystem(`Error uploading image: ${error instanceof Error ? error.message : String(error)}`, 'error');
          // Continue with existing image if upload fails
        }
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
      
      // Create updated product object
      const updatedProduct: any = {
        id: productId,
        name: productForm.name,
        description: productForm.description,
        imageUrl: imageUrl,
        showPricing: showPricing,
        category: productForm.category,
        featured: productForm.featured,
        inStock: productForm.inStock,
        updatedAt: new Date(),
        updatedBy: user?.email || 'admin',
        keyFeatures: productKeyFeatures,
        specifications: productSpecifications,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
      
      // Only add price and unit if pricing is enabled to avoid Firebase undefined errors
      if (showPricing && productForm.price) {
        updatedProduct.price = parseFloat(productForm.price);
      }
      if (showPricing && productForm.unit) {
        updatedProduct.unit = productForm.unit;
      }
      
      // Update product in database
      await productContext.updateProduct(updatedProduct);
      
      setIsSubmitting(false);
      logToSystem(`Product ${productId} updated successfully`, 'success');
      
      // Call onProductUpdated callback if provided
      if (onProductUpdated) {
        onProductUpdated();
      } else {
        onClose();
      }
      
      // Dispatch a custom event to notify other components
      const eventData = { 
        productId, 
        timestamp: new Date().getTime()
      };
      
      const event = new CustomEvent('productUpdated', { 
        detail: eventData,
        bubbles: true
      });
      
      window.dispatchEvent(event);
      document.dispatchEvent(event);
      
      onClose();
    } catch (error) {
      logToSystem(`Error updating product: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleUpdateProduct} className="p-6">
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
                ) : productForm.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={productForm.imageUrl} 
                      alt="Product preview" 
                      fill
                      className="object-contain" 
                    />
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
                  {productImageFile || productForm.imageUrl ? 'Change Image' : 'Select Image'}
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
                  value={productForm.name}
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
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {productCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
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
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input 
                          type="number" 
                          id="price" 
                          name="price" 
                          step="0.01"
                          min="0"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          className="block w-full text-black pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                      <input
                        type="text"
                        id="unit"
                        name="unit"
                        value={productForm.unit}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., kg, per ton, per piece"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={4} 
                  value={productForm.description}
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
                    checked={productForm.featured}
                    onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">Featured Product</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    id="inStock" 
                    name="inStock" 
                    type="checkbox" 
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">In Stock</label>
                </div>
              </div>
              
              {isMasterAdmin && (
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
                    <Switch 
                      id="show-advanced-options"
                      checked={showAdvancedOptions} 
                      onChange={setShowAdvancedOptions} 
                      label="Show Advanced Options"
                    />
                  </div>
                  
                  {showAdvancedOptions && (
                    <div className="mt-4 space-y-6">
                      {/* Key Features */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
                        {keyFeatures.map((feature, index) => (
                          <div key={`feature-${index}`} className="flex mb-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => updateKeyFeature(index, e.target.value)}
                              className="flex-1 border text-black border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter a key feature"
                            />
                            <button
                              type="button"
                              onClick={() => removeKeyFeature(index)}
                              className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addKeyFeature}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Feature
                        </button>
                      </div>
                      
                      {/* Specifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                        {specifications.map((spec, index) => (
                          <div key={`spec-${index}`} className="flex mb-2">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                              className="flex-1 border text-black border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Specification name"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                              className="flex-1 border text-black border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Specification value"
                            />
                            <button
                              type="button"
                              onClick={() => removeSpecification(index)}
                              className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSpecification}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Specification
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

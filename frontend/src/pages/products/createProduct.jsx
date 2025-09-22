import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar, MapPin, Package, DollarSign, FileText, Tag, Loader2, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Replace this with your actual lib/axios.js import
import api from '../../lib/axios';

const ProductCreationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    unit: '',
    district: '',
    city: '',
    coordinates: { type: 'Point', coordinates: [80.0, 7.0] }, // Default coordinates for Sri Lanka
    category: '',
    qualityScore: 3,
    isOrganic: false,
    harvestDate: '',
    initialQuantity: '',
    availableQuantity: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Sri Lankan districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const units = [
    'kg', 'g', 'lb', 'piece', 'bunch', 'box', 'crate', 'bag'
  ];

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from:', api.defaults.baseURL + '/categories');
      const response = await api.get('/categories/'); // endpoint
      console.log('Categories response:', response.data);
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      console.error('Error details:', error.response?.data);
      setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Render category options recursively
  const renderCategoryOptions = (categoryList, level = 0) => {
    return categoryList.map(category => [
      <option key={category._id} value={category._id}>
        {'  '.repeat(level)} {category.name.en}
      </option>,
      ...(category.children ? renderCategoryOptions(category.children, level + 1) : [])
    ]).flat();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isOrganic') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'qualityScore') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else if (name === 'availableQuantity' || name === 'initialQuantity') {
      const quantity = parseFloat(value) || 0;
      if (name === 'initialQuantity') {
        setFormData(prev => ({ 
          ...prev, 
          [name]: quantity,
          availableQuantity: quantity // Set available quantity to match initial quantity
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: quantity }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    // For demo purposes, we'll use placeholder URLs
    // In a real app, you'd upload these files to a cloud storage service like AWS S3, Cloudinary, etc.
    const newImages = files.map((file, index) => ({
      url: `https://images.unsplash.com/photo-1546470427-227e8e7dfde8?w=400&h=300&fit=crop&t=${Date.now()}_${index}`,
      alt: `${formData.title || 'Product'} - Image ${formData.images.length + index + 1}`,
      isPrimary: formData.images.length === 0 && index === 0,
      file: file, // Keep file for preview
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Product title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.harvestDate) newErrors.harvestDate = 'Harvest date is required';
    if (!formData.initialQuantity || formData.initialQuantity <= 0) {
      newErrors.initialQuantity = 'Valid quantity is required';
    }
    if (!formData.availableQuantity || formData.availableQuantity <= 0) {
      newErrors.availableQuantity = 'Valid available quantity is required';
    }
    if (formData.availableQuantity > formData.initialQuantity) {
      newErrors.availableQuantity = 'Available quantity cannot exceed initial quantity';
    }

    // Check if harvest date is in future
    const today = new Date().toISOString().split('T')[0];
    if (formData.harvestDate > today) {
      newErrors.harvestDate = 'Harvest date cannot be in the future';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Prepare product data for API (JSON, not FormData)
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        district: formData.district,
        city: formData.city,
        coordinates: formData.coordinates,
        category: formData.category,
        qualityScore: parseInt(formData.qualityScore),
        isOrganic: formData.isOrganic,
        harvestDate: formData.harvestDate,
        initialQuantity: parseFloat(formData.initialQuantity),
        availableQuantity: parseFloat(formData.availableQuantity),
        images: formData.images.map(img => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary
        }))
      };

      // API call to create product
      const response = await api.post('/products', productData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: response.data.message || 'Product created successfully!' 
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '', description: '', price: '', unit: '', district: '',
          city: '', coordinates: { type: 'Point', coordinates: [80.0, 7.0] }, 
          category: '', qualityScore: 3, isOrganic: false,
          harvestDate: '', initialQuantity: '', availableQuantity: '', images: []
        });
        setSubmitStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Product creation error:', error);
      
      let errorMessage = 'Failed to create product. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {});
        setErrors(validationErrors);
        errorMessage = 'Please fix the validation errors and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to create products.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You need farmer privileges to create products.';
      }
      
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-green-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="h-6 w-6" />
              List New Product
            </h1>
            <p className="text-green-100 mt-1">Add your farm products to reach more buyers</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Messages */}
            {submitStatus && (
              <div className={`p-4 rounded-md flex items-center gap-3 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {submitStatus.message}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Product Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Fresh Organic Tomatoes"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product quality, farming methods, etc."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Price per Unit (LKR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.unit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.district ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select district</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City/Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter city or town"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category *
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {renderCategoryOptions(categories)}
                  </select>
                )}
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
              </div>
            </div>

            {/* Harvest & Quantity */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Harvest Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date *
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    max={today}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.harvestDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.harvestDate && <p className="text-red-500 text-sm mt-1">{errors.harvestDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    name="initialQuantity"
                    value={formData.initialQuantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.initialQuantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.initialQuantity && <p className="text-red-500 text-sm mt-1">{errors.initialQuantity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    name="availableQuantity"
                    value={formData.availableQuantity}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.initialQuantity || 999999}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.availableQuantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.availableQuantity && <p className="text-red-500 text-sm mt-1">{errors.availableQuantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Score (1-5) *
                  </label>
                  <select
                    name="qualityScore"
                    value={formData.qualityScore}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={1}>1 - Basic</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex items-center gap-1">
                    <Leaf size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">This is an organic product</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product Images
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                        Upload Images
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    PNG, JPG, GIF up to 10MB each (Max 5 images)
                  </p>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 mr-2" />
                    List Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreationForm;
import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar, MapPin, Package, DollarSign, FileText, Tag, Loader2, CheckCircle, AlertCircle, Leaf, CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography';
import { Separator } from '../../components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// Replace this with your actual lib/axios.js import
import api from '../../lib/axios';
import imageService from '../../services/imageService';

const ProductCreationForm = () => {  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
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
    harvestDate: (() => {
      // Default to yesterday to prevent future date issues
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })(),
    initialQuantity: '',
    availableQuantity: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

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
      <SelectItem key={category._id} value={category._id}>
        {'  '.repeat(level)} {category.name.en}
      </SelectItem>,
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

  // Handle Select component changes
  const handleSelectChange = (name, value) => {
    if (name === 'qualityScore') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

    // Shared function for processing image files
  const processImageFiles = async (files) => {
    // Validate files first
    const validation = imageService.validateImages(files);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, images: validation.errors.join(', ') }));
      return;
    }

    // Check total image limit
    if (formData.images.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    // Create temporary preview objects while uploading
    const tempImages = files.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: URL.createObjectURL(file),
      uploading: true,
      isPrimary: formData.images.length === 0 && index === 0,
      alt: `${formData.title || 'Product'} - Image ${formData.images.length + index + 1}`
    }));

    // Add temp images to show previews immediately
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...tempImages]
    }));

    // Upload images to Cloudinary
    try {
      const uploadResult = await imageService.uploadProductImages(files);
      
      if (uploadResult.success) {
        // Replace temp images with real uploaded images
        setFormData(prev => ({
          ...prev,
          images: prev.images.map(img => {
            const tempImg = tempImages.find(temp => temp.id === img.id);
            if (tempImg) {
              const uploadedImg = uploadResult.data[tempImages.indexOf(tempImg)];
              return {
                ...uploadedImg,
                id: img.id,
                preview: img.preview,
                uploading: false,
                uploaded: true
              };
            }
            return img;
          })
        }));
      } else {
        // Remove temp images on upload failure
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => !tempImages.find(temp => temp.id === img.id))
        }));
        setErrors(prev => ({ ...prev, images: uploadResult.error }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      // Remove temp images on error
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => !tempImages.find(temp => temp.id === img.id))
      }));
      setErrors(prev => ({ ...prev, images: 'Failed to upload images' }));
    }
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    processImageFiles(files);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processImageFiles(files);
    }
  };

  const removeImage = async (imageId) => {
    const imageToRemove = formData.images.find(img => img.id === imageId);
    
    if (imageToRemove?.cloudinaryId) {
      try {
        await imageService.deleteProductImage(imageToRemove.cloudinaryId);
        console.log('Image deleted from Cloudinary successfully');
      } catch (error) {
        console.warn('Failed to delete image from Cloudinary:', error);
        // Continue with local removal even if Cloudinary deletion fails
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if any images are still uploading
    const uploadingImages = formData.images.filter(img => img.uploading);
    if (uploadingImages.length > 0) {
      newErrors.images = 'Please wait for all images to finish uploading';
      setErrors(newErrors);
      return false;
    }

    // Basic required field validation
    if (!formData.title?.trim()) newErrors.title = 'Product title is required';
    if (!formData.description?.trim()) newErrors.description = 'Product description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.initialQuantity || formData.initialQuantity <= 0) newErrors.initialQuantity = 'Valid quantity is required';

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
      // Debug: Log authentication status
      console.log('User authentication status:', { 
        isAuthenticated, 
        user: user?.email, 
        role: user?.role,
        hasToken: !!localStorage.getItem('token')
      });

      // Prepare product data for API (JSON, not FormData)
      const productData = {
        title: formData.title || 'Default Product',
        description: formData.description || 'Default description for testing',
        price: parseFloat(formData.price) || 1,
        unit: formData.unit || 'kg',
        district: formData.district || 'Colombo',
        city: formData.city || 'Colombo',
        coordinates: {
          type: 'Point',
          coordinates: formData.coordinates?.coordinates ? [
            parseFloat(formData.coordinates.coordinates[0]),
            parseFloat(formData.coordinates.coordinates[1])
          ] : [79.8612, 6.9271] // Default Colombo coordinates
        },
        category: formData.category || '68d18a7eaf42e017f2d53a86', // Default to vegetables category
        qualityScore: parseInt(formData.qualityScore) || 3,
        isOrganic: Boolean(formData.isOrganic),
        harvestDate: formData.harvestDate || '2025-09-22', // Default to yesterday
        initialQuantity: parseFloat(formData.initialQuantity) || 1,
        availableQuantity: parseFloat(formData.availableQuantity) || 1,
        images: formData.images.length > 0 && formData.images.filter(img => img.url && !img.uploading).length > 0 
          ? formData.images
              .filter(img => img.url && !img.uploading) // Only include successfully uploaded images
              .map(img => ({
                url: img.url,
                alt: img.alt || 'Product image',
                isPrimary: img.isPrimary || false,
                publicId: img.publicId // Include for future deletion
              })) 
          : [{ // Default image if none uploaded successfully
              url: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg',
              alt: 'Default product image',
              isPrimary: true
            }]
      };

      // Debug: Log the data being sent
      console.log('Product data being sent:', productData);

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

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <H2 className="mb-2">Authentication Required</H2>
              <P className="text-gray-600 mb-4">Please log in to create products.</P>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle role restriction (only farmers can create products)
  if (user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <H2 className="mb-2">Access Restricted</H2>
              <P className="text-gray-600 mb-4">Only farmers can create products.</P>
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/farmer-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-emerald-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              List New Product
            </CardTitle>
            <p className="text-emerald-100 mt-1">Add your farm products to reach more buyers</p>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Status Messages */}
            {submitStatus && (
              <Alert className={submitStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {submitStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    className={errors.title ? 'border-red-300' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe your product quality, farming methods, etc."
                    className={errors.description ? 'border-red-300' : ''}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Price per Unit (LKR) *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={errors.price ? 'border-red-300' : ''}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                      <SelectTrigger className={errors.unit ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select value={formData.district} onValueChange={(value) => handleSelectChange('district', value)}>
                      <SelectTrigger className={errors.district ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(district => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city or town"
                      className={errors.city ? 'border-red-300' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="category">Product Category *</Label>
                  {categoriesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-500">Loading categories...</span>
                    </div>
                  ) : (
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger className={errors.category ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderCategoryOptions(categories)}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Harvest Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Harvest Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harvest Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.harvestDate && "text-muted-foreground",
                            errors.harvestDate && "border-red-300"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.harvestDate ? format(new Date(formData.harvestDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={formData.harvestDate ? new Date(formData.harvestDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              // Only allow past dates
                              const today = new Date();
                              const oneYearAgo = new Date();
                              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                              
                              if (date > today) {
                                // Don't select future dates
                                return;
                              }
                              
                              if (date < oneYearAgo) {
                                // Don't select dates more than 1 year ago
                                return;
                              }
                              
                              const formattedDate = date.toISOString().split('T')[0];
                              handleInputChange({ target: { name: 'harvestDate', value: formattedDate } });
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const oneYearAgo = new Date();
                            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                            
                            return date > today || date < oneYearAgo;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.harvestDate && <p className="text-red-500 text-sm mt-1">{errors.harvestDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialQuantity">Total Quantity *</Label>
                    <Input
                      id="initialQuantity"
                      name="initialQuantity"
                      type="number"
                      value={formData.initialQuantity}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className={errors.initialQuantity ? 'border-red-300' : ''}
                    />
                    {errors.initialQuantity && <p className="text-red-500 text-sm mt-1">{errors.initialQuantity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableQuantity">Available Quantity *</Label>
                    <Input
                      id="availableQuantity"
                      name="availableQuantity"
                      type="number"
                      value={formData.availableQuantity}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.initialQuantity || 999999}
                      step="0.01"
                      placeholder="0"
                      className={errors.availableQuantity ? 'border-red-300' : ''}
                    />
                    {errors.availableQuantity && <p className="text-red-500 text-sm mt-1">{errors.availableQuantity}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualityScore">Quality Score (1-5) *</Label>
                    <Select value={formData.qualityScore.toString()} onValueChange={(value) => handleSelectChange('qualityScore', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Basic</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isOrganic"
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="isOrganic" className="flex items-center gap-1 cursor-pointer">
                    <Leaf size={16} className="text-green-600" />
                    <span>This is an organic product</span>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className={`mx-auto h-12 w-12 ${
                      dragActive ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <div className="mt-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images
                      </Button>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {dragActive 
                        ? 'Drop images here to upload' 
                        : 'Drag & drop images here or click to browse'
                      }
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      PNG, JPG, GIF up to 10MB each (Max 5 images)
                    </p>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {formData.images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url || image.preview}
                            alt="Product"
                            className={`w-full h-24 object-cover rounded-lg border ${
                              image.uploading ? 'opacity-50' : ''
                            }`}
                          />
                          {image.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}
                          {image.isPrimary && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                            disabled={image.uploading}
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
              </CardContent>
            </Card>

            {/* Submit Button Card */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
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
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCreationForm;
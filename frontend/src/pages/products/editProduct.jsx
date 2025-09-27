import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from '../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import api from '../../lib/axios';

const EditProduct = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id'); // product ID from query params
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product by ID using direct API call
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('Product ID is required');
        }
        
        console.log('Fetching product with ID:', id);
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          throw new Error('No authentication token found. Please login first.');
        }
        
        // API call to get single product using axios instance
        const response = await api.get(`/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          console.log('Product data received:', response.data.data);
          setProduct(response.data.data);
        } else {
          throw new Error(response.data.message || 'Product not found');
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load product';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ 
      ...product, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Save updates with direct API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login first.');
      }

      // API call to update product using axios instance
      const response = await api.put(`/products/${id}`, {
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        availableQuantity: parseFloat(product.availableQuantity),
        // Add other fields as needed
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        alert("Product updated successfully!");
        navigate("/my-products");
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err) {
      console.error("Update failed:", err);
      console.error("Update error response:", err.response?.data);
      console.error("Update error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      alert(`Update failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Button onClick={() => navigate('/my-products')}>Back to My Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
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
              <BreadcrumbLink href="/my-products">My Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block">Title</label>
          <input
            type="text"
            name="title"
            value={product.title || ''}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
            required
          />
        </div>
        
        <div>
          <label className="block">Description</label>
          <textarea
            name="description"
            value={product.description || ''}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block">Price (Rs.)</label>
          <input
            type="number"
            name="price"
            value={product.price || ''}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label className="block">Available Quantity</label>
          <input
            type="number"
            name="availableQuantity"
            value={product.availableQuantity || ''}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block">Unit</label>
          <select
            name="unit"
            value={product.unit || 'kg'}
            onChange={handleChange}
            className="border px-3 py-2 w-full"
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="piece">Piece</option>
            <option value="bunch">Bunch</option>
            <option value="box">Box</option>
            <option value="bag">Bag</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/my-products")}
          >
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default EditProduct;
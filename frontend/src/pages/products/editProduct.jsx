import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams(); // product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product by ID using direct API call
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Direct API call to get single product
        const response = await fetch(`/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          throw new Error(data.message || 'Product not found');
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(err.message);
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

      // Direct API call to update product
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          price: parseFloat(product.price),
          availableQuantity: parseFloat(product.availableQuantity),
          // Add other fields as needed
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert("Product updated successfully!");
        navigate("/farmer-dashboard");
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
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
        
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button
          type="button"
          onClick={() => navigate("/farmer-dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
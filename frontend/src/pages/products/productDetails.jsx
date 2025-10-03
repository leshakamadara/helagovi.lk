import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatDate, getStatusColor, getFreshnessColor } from '../../lib/utils';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import LoginModal from '../../components/LoginModal';
import ReviewsSection from '../../components/ReviewsSection';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  MapPin, 
  Calendar, 
  Package, 
  Star, 
  Leaf, 
  Phone, 
  Mail, 
  User,
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  ShoppingCart,
  Plus,
  Minus,
  BadgeCheck,
  X,
  Download,
  ZoomIn
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';

const ProductDetails = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  console.log('ProductDetails component loaded with productId:', productId);
  console.log('Search params:', Object.fromEntries(searchParams));
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificatePdfUrl, setCertificatePdfUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Helper function to safely render multilingual text
  const renderText = (text, defaultValue = '') => {
    if (!text) return defaultValue;
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text.en) return text.en;
    return defaultValue;
  };

  // API integration function
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'API request failed');
    }
  };

  useEffect(() => {
    // Prevent browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    fetchProduct();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [productId]);

  // Scroll to top after product loads
  useEffect(() => {
    if (product && !loading) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 100);
    }
  }, [product, loading]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching product with ID:', productId);
      
      // Validate product ID
      if (!productId || productId === "507f1f77bcf86cd799439011") {
        setError('Invalid product ID');
        setProduct(null);
        return;
      }
      
      // Try to fetch from API
      const response = await api.get(`/products/${productId}`);
      
      console.log('API Response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        console.log('Successfully fetched product from API:', response.data.data);
        setProduct(response.data.data);
      } else {
        console.error('Invalid API response structure:', response.data);
        setError('Invalid product data received');
        setProduct(null);
      }
      
    } catch (err) {
      console.error('Error fetching product:', err);
      
      // More specific error handling
      if (err.response?.status === 404) {
        setError('Product not found');
      } else if (err.response?.status === 400) {
        setError('Invalid product ID');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch product');
      }
      
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (buyNow = false) => {
    console.log('handleAddToCart called with buyNow:', buyNow);
    
    if (!user) {
      // Set pending action and show login modal
      setPendingAction(buyNow ? 'buyNow' : 'addToCart');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'buyer') {
      toast.error('Access Denied', {
        description: 'Only buyers can add items to cart'
      });
      return;
    }
    
    try {
      setAddingToCart(true);
      
      if (buyNow) {
        console.log('Buy Now: Navigating to checkout/delivery');
        // For buy now, navigate directly to delivery page with product data
        navigate('/checkout/delivery', {
          state: {
            product: product,
            quantity: quantity
          }
        });
      } else {
        console.log('Add to Cart: Adding product to cart');
        // Add to cart using cart context
        const result = await addToCart(product, quantity);
        console.log('Cart addition result:', result);
        // Show success toast
        toast.success(result.message || 'Item added to cart successfully!', {
          description: `${product.title} (${quantity} ${product.unit}) added to your cart`
        });
        setQuantity(1);
      }
    } catch (err) {
      // Show error toast
      toast.error('Failed to add to cart', {
        description: err.message || 'Something went wrong'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, execute the pending action
    if (pendingAction === 'addToCart') {
      handleAddToCart(false);
    } else if (pendingAction === 'buyNow') {
      handleAddToCart(true);
    } else if (pendingAction === 'favorite') {
      handleToggleFavorite();
    }
    // Clear pending action
    setPendingAction(null);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      // Set pending action and show login modal
      setPendingAction('favorite');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'buyer') {
      alert('Only buyers can add favorites');
      return;
    }
    
    try {
      // TODO: Implement favorites API
      // const method = isFavorite ? 'DELETE' : 'POST';
      // await apiCall(`/api/favorites/${product._id}`, {
      //   method,
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getToken()}`
      //   }
      // });
      
      setIsFavorite(!isFavorite);
      alert(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      alert(err.message || 'Failed to update favorites');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFreshnessColor = (days) => {
    if (days <= 3) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateCertificatePDF = async () => {
    setGeneratingPdf(true);
    try {
      // Detect mobile for responsive PDF generation
      const isMobile = window.innerWidth <= 768;
      const scaleFactor = isMobile ? 1.2 : 1; // Increase sizes on mobile
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // shadcn UI inspired colors
      const primaryColor = '#059669'; // emerald-600
      const backgroundColor = '#f8fafc'; // slate-50
      const cardBg = '#ffffff'; // white
      const borderColor = '#e2e8f0'; // slate-200
      const textPrimary = '#0f172a'; // slate-900
      const textSecondary = '#64748b'; // slate-500
      const accentColor = '#10b981'; // emerald-500
      
      // Load and add background image
      try {
        const loadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        };
        
        const backgroundImg = await loadImage('https://res.cloudinary.com/dckoipgrs/image/upload/v1759465993/pdfCanavs_ngdyem.jpg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = backgroundImg.width;
        canvas.height = backgroundImg.height;
        ctx.drawImage(backgroundImg, 0, 0);
        const bgData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Add background image to cover full page
        pdf.addImage(bgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      } catch (error) {
        console.warn('Could not load background image:', error);
        // Fallback to solid background
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      
      // Add company logo
      try {
        const loadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        };
        
        const logoImg = await loadImage('https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png', 1.0);
        
        // Add logo (160x160 pixels converted to mm - approximately 42x42mm)
        const logoSize = 25; // 25mm for better proportion
        pdf.addImage(logoData, 'PNG', 15, 15, logoSize, logoSize);
        
      // Company name and slogan next to logo
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Helagovi.lk', 50, 28);
      
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Ceylon's Farming Network", 50, 36);
      
      // Certificate generation timestamp in top right corner
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Certificate Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth - 15, 20, { align: 'right' });      } catch (error) {
        console.warn('Could not load logo:', error);
        // Fallback text logo
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Helagovi.lk', 15, 28);
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(12);
        pdf.text("Ceylon's Farming Network", 15, 36);
      }
      
      // Function to create gradient text
      const createGradientText = (text, fontSize = 36, canvasWidth = 600, canvasHeight = 80, align = 'center') => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Create radial gradient
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
          );
          gradient.addColorStop(0, '#34E89E'); // 0%
          gradient.addColorStop(0.5, '#45A21A'); // 50%
          gradient.addColorStop(1, '#005B26'); // 100%
          
          // Set font and text properties
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = align;
          ctx.textBaseline = 'middle';
          
          // Apply gradient to text
          ctx.fillStyle = gradient;
          
          // Position text based on alignment
          const xPos = align === 'left' ? 10 : canvas.width / 2;
          ctx.fillText(text, xPos, canvas.height / 2);
          
          return canvas.toDataURL('image/png', 1.0);
        } catch (error) {
          console.warn('Could not create gradient text:', error);
          return null;
        }
      };

      // Function to create gold gradient stars
      const createGoldStars = (starCount, fontSize = 56, canvasWidth = 800, canvasHeight = 130) => {
        try {
          // Mobile-responsive sizing
          const mobileFontSize = Math.round(fontSize * scaleFactor);
          const mobileCanvasWidth = Math.round(canvasWidth * scaleFactor);
          const mobileCanvasHeight = Math.round(canvasHeight * scaleFactor);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = mobileCanvasWidth;
          canvas.height = mobileCanvasHeight;
          
          // Create gold radial gradient
          const goldGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
          );
          goldGradient.addColorStop(0, '#FFD700'); // Bright gold
          goldGradient.addColorStop(0.5, '#FFA500'); // Orange gold
          goldGradient.addColorStop(1, '#B8860B'); // Dark gold
          
          // Set font and text properties for stars
          ctx.font = `${mobileFontSize}px Arial, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          
          // Apply gold gradient to stars
          ctx.fillStyle = goldGradient;
          
          // Generate star symbols
          const starSymbol = '★';
          const starSpacing = mobileFontSize * 0.9; // Proportional spacing
          const startX = Math.round(20 * scaleFactor);
          const centerY = (canvas.height / 2) - Math.round(6 * scaleFactor); // Move stars up slightly
          
          for (let i = 0; i < starCount; i++) {
            ctx.fillText(starSymbol, startX + (i * starSpacing), centerY);
          }
          
          return canvas.toDataURL('image/png', 1.0);
        } catch (error) {
          console.warn('Could not create gold stars:', error);
          return null;
        }
      };

      // Certificate title with gradient effect
      try {
        const titleImageData = createGradientText('PRODUCT QUALITY CERTIFICATE', 61, 1000, 120);
        
        if (titleImageData) {
          // Add gradient title image to PDF
          const titleWidth = 150; // Width in mm (increased from 120)
          const titleHeight = 18; // Height in mm (increased from 15)
          const titleX = (pageWidth - titleWidth) / 2;
          pdf.addImage(titleImageData, 'PNG', titleX, 50, titleWidth, titleHeight);
        } else {
          // Fallback to regular text
          pdf.setTextColor(15, 23, 42); // slate-900
          pdf.setFontSize(24); // Increased from 20
          pdf.setFont('helvetica', 'bold');
          pdf.text('PRODUCT QUALITY CERTIFICATE', pageWidth/2, 65, { align: 'center' });
        }
        
      } catch (error) {
        console.warn('Could not create gradient title, using fallback:', error);
        // Fallback to regular text
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFontSize(24); // Increased from 20
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRODUCT QUALITY CERTIFICATE', pageWidth/2, 65, { align: 'center' });
      }
      
      // Product section starts
      let yPosition = 80;
      
      // Product Information heading with gradient
      try {
        const headingImageData = createGradientText('Product Information', 32, 450, 65, 'left');
        
        if (headingImageData) {
          const headingWidth = 65; // Width in mm (increased)
          const headingHeight = 9; // Height in mm (increased)
          pdf.addImage(headingImageData, 'PNG', 25, yPosition - 5, headingWidth, headingHeight);
        } else {
          // Fallback to regular text
          pdf.setTextColor(16, 185, 129); // emerald-500
          pdf.setFontSize(18); // Increased from 16
          pdf.setFont('helvetica', 'bold');
          pdf.text('Product Information', 25, yPosition);
        }
      } catch (error) {
        // Fallback to regular text
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.setFontSize(18); // Increased from 16
        pdf.setFont('helvetica', 'bold');
        pdf.text('Product Information', 25, yPosition);
      }
      yPosition += 15;
      
      // Add product image on the right side first
      let imageHeight = 0;
      try {
        const imageUrl = product.images[0]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg';
        
        // Create a promise to load the image
        const loadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
          });
        };
        
        const img = await loadImage(imageUrl);
        
        // Calculate aspect ratio and determine dimensions
        const originalAspectRatio = img.width / img.height;
        const maxWidth = 45; // Maximum width in mm
        const maxHeight = 40; // Maximum height in mm
        
        let imgWidth, imgHeight;
        
        // Calculate dimensions while maintaining aspect ratio
        if (originalAspectRatio > 1) {
          // Landscape image - width is larger
          imgWidth = Math.min(maxWidth, maxHeight * originalAspectRatio);
          imgHeight = imgWidth / originalAspectRatio;
        } else {
          // Portrait or square image - height is larger or equal
          imgHeight = Math.min(maxHeight, maxWidth / originalAspectRatio);
          imgWidth = imgHeight * originalAspectRatio;
        }
        
        // Ensure we don't exceed maximum dimensions
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = maxWidth / originalAspectRatio;
        }
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * originalAspectRatio;
        }
        
        // Create canvas to convert image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Convert to base64
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Calculate vertical centering within the Product Information section
        // Estimate the content section height (approximately 35mm for the details)
        const contentSectionHeight = 35;
        const imageVerticalOffset = (contentSectionHeight - imgHeight) / 2;
        
        // Position image on right side with proper spacing and vertical centering
        const imageX = pageWidth - imgWidth - 25;
        const imageY = yPosition + Math.max(0, imageVerticalOffset);
        pdf.addImage(imgData, 'JPEG', imageX, imageY, imgWidth, imgHeight);
        imageHeight = imgHeight + 10; // Add some padding
        
      } catch (error) {
        console.warn('Could not load product image for PDF:', error);
        // Continue without image
      }
      
      // Product details directly on background - adjust layout to accommodate image
      pdf.setFontSize(11);
      
      // Calculate available width for content (excluding image area)
      const contentWidth = pageWidth - 100; // Leave space for image and margins
      
      const details = [
        ['Product Title:', product.title],
        ['', 'STARS'], // Just stars without label
        ['Days Since Harvest:', `${product.freshnessDays} days`],
        ['Available Quantity:', `${product.availableQuantity} ${product.unit}`],
        ['Sold Percentage:', `${product.soldPercentage}%`],
        ['Price:', `Rs. ${product.price.toLocaleString()} per ${product.unit}`],
      ];
      
      // Calculate content height for vertical centering
      const contentHeight = Math.ceil(details.length / 2) * 10;
      const sectionStartY = yPosition;
      
      // Organize in two columns to accommodate image
      const colWidth = contentWidth / 2;
      details.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = 25 + (col * colWidth);
        const yPos = yPosition + (row * 10);
        
        // Only show label if it exists (skip empty labels for stars)
        if (label) {
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.setFont('helvetica', 'normal');
          pdf.text(label, xPos, yPos);
        }
        
        // Special handling for stars (no label)
        if (value === 'STARS') {
          try {
            const starsImageData = createGoldStars(product.qualityScore, 56, 800, 130);
            if (starsImageData) {
              // Calculate proper dimensions maintaining aspect ratio (800:130 = 6.15:1)
              const baseCanvasWidth = 800 * scaleFactor;
              const baseCanvasHeight = 130 * scaleFactor;
              const originalAspectRatio = baseCanvasWidth / baseCanvasHeight; // 6.15:1
              const starsWidth = product.qualityScore * (14 * scaleFactor); // Mobile-responsive width per star
              const starsHeight = starsWidth / originalAspectRatio; // Maintain aspect ratio
              pdf.addImage(starsImageData, 'PNG', xPos, yPos - (4 * scaleFactor), starsWidth, starsHeight);
            } else {
              // Fallback to text
              pdf.setTextColor(15, 23, 42); // slate-900
              pdf.setFont('helvetica', 'bold');
              pdf.text(`${product.qualityScore}/5 Stars`, xPos, yPos + 5);
            }
          } catch (error) {
            // Fallback to text
            pdf.setTextColor(15, 23, 42); // slate-900
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${product.qualityScore}/5 Stars`, xPos, yPos + 5);
          }
        } else {
          // Regular text handling
          pdf.setTextColor(15, 23, 42); // slate-900
          pdf.setFont('helvetica', 'bold');
          const wrappedValue = pdf.splitTextToSize(String(value), colWidth - 10);
          pdf.text(wrappedValue, xPos, yPos + 5);
        }
      });
      
      // Ensure we move past both content and image
      yPosition += Math.max(35, imageHeight);
      
      // Additional Details heading with gradient
      try {
        const headingImageData = createGradientText('Additional Details', 30, 420, 60, 'left');
        
        if (headingImageData) {
          const headingWidth = 60; // Width in mm (increased)
          const headingHeight = 8; // Height in mm (increased)
          pdf.addImage(headingImageData, 'PNG', 25, yPosition - 4, headingWidth, headingHeight);
        } else {
          // Fallback to regular text
          pdf.setTextColor(16, 185, 129); // emerald-500
          pdf.setFontSize(16); // Increased from 14
          pdf.setFont('helvetica', 'bold');
          pdf.text('Additional Details', 25, yPosition);
        }
      } catch (error) {
        // Fallback to regular text
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.setFontSize(16); // Increased from 14
        pdf.setFont('helvetica', 'bold');
        pdf.text('Additional Details', 25, yPosition);
      }
      yPosition += 12;
      
      const additionalDetails = [
        ['Harvest Date:', formatDate(product.harvestDate)],
        ['Category:', renderText(product.category.name, 'N/A')],
        ['Location:', `${product.city}, ${product.district}`],
        ['Organic Status:', product.isOrganic ? 'Certified Organic' : 'Conventional'],
      ];
      
      // Two columns layout
      additionalDetails.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = col === 0 ? 25 : (pageWidth / 2) + 10;
        const yPos = yPosition + (row * 10);
        
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(label, xPos, yPos);
        
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFont('helvetica', 'bold');
        const wrappedValue = pdf.splitTextToSize(String(value), (pageWidth / 2) - 30);
        pdf.text(wrappedValue, xPos, yPos + 5);
      });
      
      yPosition += 30;
      
      // Description section
      if (product.description) {
        // Product Description heading with gradient
        try {
          const headingImageData = createGradientText('Product Description', 30, 430, 60, 'left');
          
          if (headingImageData) {
            const headingWidth = 62; // Width in mm (increased)
            const headingHeight = 8; // Height in mm (increased)
            pdf.addImage(headingImageData, 'PNG', 25, yPosition - 4, headingWidth, headingHeight);
          } else {
            // Fallback to regular text
            pdf.setTextColor(16, 185, 129); // emerald-500
            pdf.setFontSize(16); // Increased from 14
            pdf.setFont('helvetica', 'bold');
            pdf.text('Product Description', 25, yPosition);
          }
        } catch (error) {
          // Fallback to regular text
          pdf.setTextColor(16, 185, 129); // emerald-500
          pdf.setFontSize(16); // Increased from 14
          pdf.setFont('helvetica', 'bold');
          pdf.text('Product Description', 25, yPosition);
        }
        yPosition += 10;
        
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const description = product.description || 'No description available';
        const splitDescription = pdf.splitTextToSize(description, pageWidth - 50);
        pdf.text(splitDescription, 25, yPosition);
        yPosition += (splitDescription.length * 4) + 15;
      }
      
      // Farmer Information heading with gradient
      try {
        const headingImageData = createGradientText('Farmer Information', 30, 420, 60, 'left');
        
        if (headingImageData) {
          const headingWidth = 60; // Width in mm (increased)
          const headingHeight = 8; // Height in mm (increased)
          pdf.addImage(headingImageData, 'PNG', 25, yPosition - 4, headingWidth, headingHeight);
        } else {
          // Fallback to regular text
          pdf.setTextColor(16, 185, 129); // emerald-500
          pdf.setFontSize(16); // Increased from 14
          pdf.setFont('helvetica', 'bold');
          pdf.text('Farmer Information', 25, yPosition);
        }
      } catch (error) {
        // Fallback to regular text
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.setFontSize(16); // Increased from 14
        pdf.setFont('helvetica', 'bold');
        pdf.text('Farmer Information', 25, yPosition);
      }
      yPosition += 12;
      
      const farmerDetails = [
        ['Farmer Name:', `${product.farmer.firstName || ''} ${product.farmer.lastName || ''}`.trim() || 'N/A'],
        ['Contact Email:', product.farmer.email || 'N/A'],
        ['Phone Number:', product.farmer.phone || 'N/A'],
      ];
      
      farmerDetails.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = col === 0 ? 25 : (pageWidth / 2) + 10;
        const yPos = yPosition + (row * 10);
        
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(label, xPos, yPos);
        
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFont('helvetica', 'bold');
        const wrappedValue = pdf.splitTextToSize(String(value), (pageWidth / 2) - 30);
        pdf.text(wrappedValue, xPos, yPos + 5);
      });
      
      yPosition += 25;
      
      // Quality certification section - directly on background
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This certificate verifies the quality and authenticity of the above product.', pageWidth/2, yPosition + 10, { align: 'center' });
      
      // Footer information directly on background
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Helagovi.lk - Ceylon\'s Farming Network', pageWidth/2, pageHeight - 12, { align: 'center' });
      
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Connecting Farmers • Empowering Communities • Quality Assured', pageWidth/2, pageHeight - 6, { align: 'center' });
      
      // Create blob URL for the PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setCertificatePdfUrl(pdfUrl);
      setShowCertificateModal(true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate', {
        description: 'Please try again later'
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadCertificate = () => {
    if (certificatePdfUrl) {
      const link = document.createElement('a');
      link.href = certificatePdfUrl;
      link.download = `${product.title}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const closeCertificateModal = () => {
    setShowCertificateModal(false);
    setPdfLoadError(false);
    if (certificatePdfUrl) {
      URL.revokeObjectURL(certificatePdfUrl);
      setCertificatePdfUrl(null);
    }
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <H2 className="text-gray-900 mb-2">Product Not Found</H2>
          <P className="text-gray-600 mb-4">{error || 'Product data not available'}</P>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Product Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.images[selectedImage]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                  alt={product.images[selectedImage]?.alt || 'Product image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg';
                  }}
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                        alt={image.alt || 'Product thumbnail'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <H1>{product.title}</H1>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleToggleFavorite}
                      variant="ghost"
                      size="icon"
                      className={`rounded-full transition-all duration-200 ${
                        isFavorite 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110' 
                          : 'hover:bg-muted hover:scale-110'
                      }`}
                    >
                      <Heart className={`h-5 w-5 transition-all duration-200 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted hover:scale-110 transition-all duration-200">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
                  <div className="space-y-1">
                    <span className="text-4xl font-bold text-primary">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      per {product.unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={product.status === 'active' ? 'default' : 'secondary'}
                      className={`${product.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''} text-white`}
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                    {product.isOrganic && (
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200"
                      onClick={generateCertificatePDF}
                      disabled={generatingPdf}
                    >
                      {generatingPdf ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-1"></div>
                      ) : (
                        <BadgeCheck className="h-4 w-4 mr-1" />
                      )}
                      {generatingPdf ? 'Generating...' : 'Certificate'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {product.isOrganic && (
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 text-green-600 mr-1" />
                      <span>Organic</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Quality: {product.qualityScore}/5</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className={`h-4 w-4 mr-1 ${getFreshnessColor(product.freshnessDays)}`} />
                    <span className={getFreshnessColor(product.freshnessDays)}>
                      {product.freshnessDays} days since harvest
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <H3 className="mb-2">Description</H3>
                <P className="text-gray-700 leading-relaxed">{product.description}</P>
              </div>

              {/* Availability */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <H3>Availability</H3>
                    <Muted>
                      {product.availableQuantity} {product.unit} available
                    </Muted>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {product.soldPercentage}% sold
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${product.soldPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Purchase Section - Show for all users when product is active and available */}
                {product.status === 'active' && product.availableQuantity > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity ({product.unit})
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.availableQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(product.availableQuantity, Number(e.target.value))))}
                            className="w-16 border-0 text-center focus:outline-none focus:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={quantity >= product.availableQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Total Price</div>
                        <div className="text-2xl font-bold text-emerald-600">
                          Rs. {(product.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          console.log('Add to Cart button clicked');
                          handleAddToCart();
                        }}
                        disabled={addingToCart}
                        variant="outline"
                        size="lg"
                        className="h-12 text-base font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {addingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          'Add to Cart'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          console.log('Buy Now button clicked');
                          handleAddToCart(true);
                        }}
                        disabled={addingToCart}
                        size="lg"
                        className="h-12 text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {addingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowLeft className="h-5 w-5 mr-2 rotate-180" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Show role-specific messages below buttons */}
                    {user && user.role !== 'buyer' && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <User className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          Only registered buyers can purchase products.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!user && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <User className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <span className="font-medium">Ready to purchase?</span> Click "Add to Cart" or "Buy Now" to sign in.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Harvested:</span>
                    <span className="ml-2 font-medium">{formatDate(product.harvestDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">
                      {renderText(product.category.name, 'Category')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{product.city}, {product.district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Information */}
          <div className="border-t bg-gray-50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
            
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Farmer Avatar and Info */}
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                  <AvatarImage src={product.farmer.profilePicture} alt={`${product.farmer.firstName} ${product.farmer.lastName}`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm sm:text-lg font-semibold">
                    {product.farmer.firstName && product.farmer.lastName 
                      ? `${product.farmer.firstName[0]}${product.farmer.lastName[0]}`.toUpperCase()
                      : product.farmer.firstName 
                        ? product.farmer.firstName[0].toUpperCase()
                        : product.farmer.lastName 
                          ? product.farmer.lastName[0].toUpperCase()
                          : 'F'
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                    {product.farmer.firstName && product.farmer.lastName 
                      ? `${product.farmer.firstName} ${product.farmer.lastName}`
                      : product.farmer.firstName 
                        ? product.farmer.firstName
                        : product.farmer.lastName 
                          ? product.farmer.lastName
                          : 'Farmer Profile'
                    }
                  </h4>
                
                  <div className="mt-2 space-y-2">
                    {product.farmer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`tel:${product.farmer.phone}`} 
                          className="hover:text-green-600 transition-colors truncate"
                        >
                          {product.farmer.phone}
                        </a>
                      </div>
                    )}
                    {product.farmer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`mailto:${product.farmer.email}`} 
                          className="hover:text-green-600 transition-colors truncate"
                        >
                          {product.farmer.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-row space-x-3 w-full sm:w-auto">
                <Button 
                  className="flex-1 sm:flex-none sm:w-36 text-sm sm:text-base h-9 sm:h-10"
                  size="sm"
                >
                  Contact Farmer
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none sm:w-36 text-sm sm:text-base h-9 sm:h-10"
                  size="sm"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReviewsSection productId={productId} />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccessCallback={handleLoginSuccess}
        title="Login Required"
        description="Please sign in to add items to your cart or favorites."
      />

      {/* Certificate PDF Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with 90% transparency */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-90"
            onClick={closeCertificateModal}
          ></div>
          
          {/* Modal Content - Mobile Responsive */}
          <div className="relative z-10 w-full h-full max-w-4xl max-h-screen p-2 sm:p-4">
            {/* Header with controls - Mobile Optimized */}
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-white text-sm sm:text-lg font-semibold truncate mr-2">
                Product Quality Certificate
              </h3>
              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadCertificate}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(certificatePdfUrl, '_blank')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Full Screen</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeCertificateModal}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-2 sm:px-3"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            
            {/* PDF Viewer - Mobile Responsive */}
            <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl relative">
              {certificatePdfUrl && (
                <>
                  {/* Desktop PDF Viewer */}
                  {!isMobileDevice() && (
                    <iframe
                      src={`${certificatePdfUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=FitH`}
                      className="w-full h-full"
                      title="Product Certificate PDF"
                      style={{ minHeight: '400px' }}
                      onLoad={() => setPdfLoadError(false)}
                      onError={() => setPdfLoadError(true)}
                    />
                  )}
                  
                  {/* Mobile PDF Handler */}
                  {isMobileDevice() && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
                      <div className="text-center max-w-sm">
                        <div className="text-gray-600 mb-6">
                          <BadgeCheck className="w-20 h-20 mx-auto mb-4 text-emerald-500" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Certificate Ready
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Your PDF certificate has been generated successfully. 
                            Tap below to view or download it.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Button
                            onClick={() => window.open(certificatePdfUrl, '_blank')}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3"
                            size="lg"
                          >
                            <ZoomIn className="w-5 h-5 mr-2" />
                            View Certificate
                          </Button>
                          
                          <Button
                            onClick={downloadCertificate}
                            variant="outline"
                            className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3"
                            size="lg"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error fallback for desktop */}
                  {!isMobileDevice() && pdfLoadError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="text-center p-4">
                        <div className="text-gray-600 mb-4">
                          <svg className="w-16 h-16 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-sm mb-4">PDF viewer not supported in this browser</p>
                        </div>
                        <Button
                          onClick={() => window.open(certificatePdfUrl, '_blank')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          size="sm"
                        >
                          Open PDF in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Mobile Instructions */}
            <div className="block sm:hidden mt-2 text-center">
              <p className="text-white text-xs opacity-75">
                💡 Pinch to zoom • Tap "FS" for better mobile viewing
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

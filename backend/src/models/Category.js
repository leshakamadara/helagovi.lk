import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema, model } = mongoose;

const categorySchema = new Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English name is required'],
      trim: true,
      maxLength: [50, 'English name cannot exceed 50 characters'],
      index: true
    },
    si: {
      type: String,
      required: [true, 'Sinhala name is required'],
      trim: true,
      maxLength: [50, 'Sinhala name cannot exceed 50 characters'],
      index: true
    }
  },
  slug: {
    type: String,
    unique: true,
    index: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  level: {
    type: Number,
    min: [0, 'Level cannot be negative'],
    max: [3, 'Maximum category depth is 3 levels'],
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    en: {
      type: String,
      trim: true,
      maxLength: [200, 'English description cannot exceed 200 characters']
    },
    si: {
      type: String,
      trim: true,
      maxLength: [200, 'Sinhala description cannot exceed 200 characters']
    }
  },
  image: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ 'name.en': 'text', 'name.si': 'text' });
categorySchema.index({ parent: 1, level: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ slug: 1 }, { unique: true });

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  // This would need to be populated in a query to show the full hierarchy
  return this.populated('parent') ? `${this.parent.name.en} > ${this.name.en}` : this.name.en;
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  count: true
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', async function(next) {
  if (this.isModified('name.en') || this.isNew) {
    let baseSlug = slugify(this.name.en, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.constructor.findOne({ 
      slug, 
      _id: { $ne: this._id } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

// Pre-save middleware to calculate level
categorySchema.pre('save', async function(next) {
  if (this.parent) {
    const parentCategory = await this.constructor.findById(this.parent);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else {
    this.level = 0;
  }
  
  next();
});

// Pre-remove middleware to handle children
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Check if category has children
  const childrenCount = await this.constructor.countDocuments({ parent: this._id });
  if (childrenCount > 0) {
    const error = new Error('Cannot delete category with subcategories');
    error.code = 'CATEGORY_HAS_CHILDREN';
    return next(error);
  }
  
  // Check if category has products
  const Product = mongoose.model('Product');
  const productsCount = await Product.countDocuments({ category: this._id });
  if (productsCount > 0) {
    const error = new Error('Cannot delete category with products');
    error.code = 'CATEGORY_HAS_PRODUCTS';
    return next(error);
  }
  
  next();
});

// Static methods
categorySchema.statics.getRootCategories = function() {
  return this.find({ 
    parent: null, 
    isActive: true 
  }).sort({ sortOrder: 1, 'name.en': 1 });
};

categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ level: 1, sortOrder: 1, 'name.en': 1 })
    .lean();
  
  const categoryMap = new Map();
  const tree = [];
  
  // Create category map
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), { ...cat, children: [] });
  });
  
  // Build tree structure
  categories.forEach(cat => {
    if (cat.parent) {
      const parent = categoryMap.get(cat.parent.toString());
      if (parent) {
        parent.children.push(categoryMap.get(cat._id.toString()));
      }
    } else {
      tree.push(categoryMap.get(cat._id.toString()));
    }
  });
  
  return tree;
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true }).populate('parent');
};

categorySchema.statics.searchCategories = function(searchTerm, lang = 'en') {
  const searchField = lang === 'si' ? 'name.si' : 'name.en';
  return this.find({
    [searchField]: new RegExp(searchTerm, 'i'),
    isActive: true
  }).sort({ level: 1, 'name.en': 1 });
};

// Instance methods
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }
  
  return ancestors;
};

categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const getChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId, isActive: true });
    for (const child of children) {
      descendants.push(child);
      await getChildren(child._id);
    }
  };
  
  await getChildren(this._id);
  return descendants;
};

const Category = model('Category', categorySchema);

// Sample data for Sri Lankan vegetables and fruits
const sampleCategories = [
  // Root categories
  {
    name: { en: 'Vegetables', si: 'එළවළු' },
    description: { 
      en: 'Fresh vegetables grown in Sri Lanka', 
      si: 'ශ්‍රී ලංකාවේ වගා කරන නැවුම් එළවළු' 
    },
    level: 0,
    sortOrder: 1
  },
  {
    name: { en: 'Fruits', si: 'පලතුරු' },
    description: { 
      en: 'Fresh tropical and local fruits', 
      si: 'නැවුම් නිවර්තන සහ දේශීය පලතුරු' 
    },
    level: 0,
    sortOrder: 2
  },
  {
    name: { en: 'Grains & Cereals', si: 'ධාන්‍ය වර්ග' },
    description: { 
      en: 'Rice, millet and other grain varieties', 
      si: 'සහල්, කුරක්කන් සහ අනෙකුත් ධාන්‍ය වර්ග' 
    },
    level: 0,
    sortOrder: 3
  },
  {
    name: { en: 'Spices & Herbs', si: 'කුළුබඩු සහ ඖෂධ පැළෑටි' },
    description: { 
      en: 'Traditional Sri Lankan spices and herbs', 
      si: 'සාම්ප්‍රදායික ශ්‍රී ලාංකික කුළුබඩු සහ ඖෂධ පැළෑටි' 
    },
    level: 0,
    sortOrder: 4
  },
  
  // Vegetable subcategories
  {
    name: { en: 'Leafy Greens', si: 'කොළ එළවළු' },
    parentSlug: 'vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Root Vegetables', si: 'මූල එළවළු' },
    parentSlug: 'vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Gourds & Squashes', si: 'වට්ටක්කා වර්ග' },
    parentSlug: 'vegetables',
    sortOrder: 3
  },
  {
    name: { en: 'Beans & Pods', si: 'බෝංචි වර්ග' },
    parentSlug: 'vegetables',
    sortOrder: 4
  },
  
  // Specific vegetables
  {
    name: { en: 'Gotukola', si: 'ගොටුකොළ' },
    parentSlug: 'leafy-greens',
    sortOrder: 1
  },
  {
    name: { en: 'Mukunuwenna', si: 'මුකුණුවැන්න' },
    parentSlug: 'leafy-greens',
    sortOrder: 2
  },
  {
    name: { en: 'Kangkung', si: 'කංකුං' },
    parentSlug: 'leafy-greens',
    sortOrder: 3
  },
  {
    name: { en: 'Sweet Potato', si: 'බතල' },
    parentSlug: 'root-vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Carrot', si: 'කැරට්' },
    parentSlug: 'root-vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Beetroot', si: 'බීට්රූට්' },
    parentSlug: 'root-vegetables',
    sortOrder: 3
  },
  {
    name: { en: 'Pumpkin', si: 'වට්ටක්කා' },
    parentSlug: 'gourds-squashes',
    sortOrder: 1
  },
  {
    name: { en: 'Bottle Gourd', si: 'ලබු' },
    parentSlug: 'gourds-squashes',
    sortOrder: 2
  },
  {
    name: { en: 'Ridge Gourd', si: 'පතෝල' },
    parentSlug: 'gourds-squashes',
    sortOrder: 3
  },
  {
    name: { en: 'Long Beans', si: 'දොළ' },
    parentSlug: 'beans-pods',
    sortOrder: 1
  },
  {
    name: { en: 'Green Beans', si: 'බෝංචි' },
    parentSlug: 'beans-pods',
    sortOrder: 2
  },
  
  // Fruit subcategories
  {
    name: { en: 'Tropical Fruits', si: 'නිවර්තන පලතුරු' },
    parentSlug: 'fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Citrus Fruits', si: 'දෙහි වර්ග' },
    parentSlug: 'fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Stone Fruits', si: 'ගල් පලතුරු' },
    parentSlug: 'fruits',
    sortOrder: 3
  },
  
  // Specific fruits
  {
    name: { en: 'Mango', si: 'අඹ' },
    parentSlug: 'tropical-fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Pineapple', si: 'අන්නාසි' },
    parentSlug: 'tropical-fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Papaya', si: 'පැපොල්' },
    parentSlug: 'tropical-fruits',
    sortOrder: 3
  },
  {
    name: { en: 'Coconut', si: 'පොල්' },
    parentSlug: 'tropical-fruits',
    sortOrder: 4
  },
  {
    name: { en: 'Jackfruit', si: 'කෝස්' },
    parentSlug: 'tropical-fruits',
    sortOrder: 5
  },
  {
    name: { en: 'Lime', si: 'දෙහි' },
    parentSlug: 'citrus-fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Orange', si: 'දොඩම්' },
    parentSlug: 'citrus-fruits',
    sortOrder: 2
  },
  
  // Spices
  {
    name: { en: 'Cinnamon', si: 'කුරුඳු' },
    parentSlug: 'spices-herbs',
    sortOrder: 1
  },
  {
    name: { en: 'Cardamom', si: 'එනසාල්' },
    parentSlug: 'spices-herbs',
    sortOrder: 2
  },
  {
    name: { en: 'Black Pepper', si: 'ගම්මිරිස්' },
    parentSlug: 'spices-herbs',
    sortOrder: 3
  },
  {
    name: { en: 'Turmeric', si: 'කහ' },
    parentSlug: 'spices-herbs',
    sortOrder: 4
  },
  {
    name: { en: 'Ginger', si: 'ඉඟුරු' },
    parentSlug: 'spices-herbs',
    sortOrder: 5
  }
];

export { sampleCategories };
export default Category;
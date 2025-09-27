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
// Note: slug index already defined at field level with unique: true

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

// Comprehensive Sri Lankan Agricultural Categories
const sampleCategories = [
  // Root categories
  {
    name: { en: 'Vegetables', si: 'එළවළු' },
    description: { 
      en: 'Fresh vegetables grown in Sri Lanka including traditional and modern varieties', 
      si: 'ශ්‍රී ලංකාවේ වගා කරන සාම්ප්‍රදායික සහ නවීන එළවළු වර්ග' 
    },
    level: 0,
    sortOrder: 1
  },
  {
    name: { en: 'Fruits', si: 'පලතුරු' },
    description: { 
      en: 'Fresh tropical and seasonal fruits native to Sri Lanka and imported varieties', 
      si: 'ශ්‍රී ලංකාවට ආවේණික සහ ආනයන කරන ලද නිවර්තන සහ කාලීන පලතුරු' 
    },
    level: 0,
    sortOrder: 2
  },
  {
    name: { en: 'Grains & Cereals', si: 'ධාන්‍ය වර්ග' },
    description: { 
      en: 'Traditional rice varieties, millets, and other cereal crops', 
      si: 'සාම්ප්‍රදායික සහල් වර්ග, කුරක්කන් සහ අනෙකුත් ධාන්‍ය වර්ග' 
    },
    level: 0,
    sortOrder: 3
  },
  {
    name: { en: 'Spices & Herbs', si: 'කුළුබඩු සහ ඖෂධ පැළෑටි' },
    description: { 
      en: 'Authentic Sri Lankan spices and medicinal herbs', 
      si: 'සත්‍ය ශ්‍රී ලාංකික කුළුබඩු සහ ඖෂධීය ගස්' 
    },
    level: 0,
    sortOrder: 4
  },
  {
    name: { en: 'Legumes & Pulses', si: 'කඩල වර්ග' },
    description: { 
      en: 'Nutritious beans, lentils, and pulse varieties', 
      si: 'පෝෂ්‍යදායක කඩල, පරිප්පු සහ ධාන්‍ය වර්ග' 
    },
    level: 0,
    sortOrder: 5
  },
  {
    name: { en: 'Coconut Products', si: 'පොල් නිෂ්පාදන' },
    description: { 
      en: 'Fresh coconuts and coconut-based products', 
      si: 'නැවුම් පොල් සහ පොල් මත පදනම් වූ නිෂ්පාදන' 
    },
    level: 0,
    sortOrder: 6
  },
  
  // === VEGETABLE SUBCATEGORIES ===
  {
    name: { en: 'Leafy Greens', si: 'කොළ එළවළු' },
    description: { 
      en: 'Nutritious leafy vegetables rich in vitamins and minerals', 
      si: 'විටමින් සහ ඛනිජ පදාර්ථවලින් සම්පන්න කොළ එළවළු' 
    },
    parentSlug: 'vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Root Vegetables', si: 'මූල එළවළු' },
    description: { 
      en: 'Underground tubers and root crops', 
      si: 'භූගත අල සහ මූල වර්ග' 
    },
    parentSlug: 'vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Gourds & Squashes', si: 'වට්ටක්කා වර්ග' },
    description: { 
      en: 'Large fruit vegetables including pumpkins and gourds', 
      si: 'වට්ටක්කා සහ ලබු වර්ග ඇතුළු විශාල පළතුරු එළවළු' 
    },
    parentSlug: 'vegetables',
    sortOrder: 3
  },
  {
    name: { en: 'Pod Vegetables', si: 'කරල් වර්ගීය එළවළු' },
    description: { 
      en: 'Bean pods, okra, and similar vegetables', 
      si: 'බෝංචි, බණ්ඩක්කා සහ සමාන එළවළු' 
    },
    parentSlug: 'vegetables',
    sortOrder: 4
  },
  {
    name: { en: 'Stem & Bulb Vegetables', si: 'කඳ සහ බල්බ එළවළු' },
    description: { 
      en: 'Onions, garlic, and stem vegetables', 
      si: 'ලූණු, සුදුළූණු සහ කඳ එළවළු' 
    },
    parentSlug: 'vegetables',
    sortOrder: 5
  },
  {
    name: { en: 'Exotic Vegetables', si: 'විදේශීය එළවළු' },
    description: { 
      en: 'Imported and less common vegetable varieties', 
      si: 'ආනයනික සහ අඩු දක්නට ලැබෙන එළවළු වර්ග' 
    },
    parentSlug: 'vegetables',
    sortOrder: 6
  },

  // === LEAFY GREENS ===
  {
    name: { en: 'Gotukola', si: 'ගොටුකොළ' },
    description: { en: 'Centella asiatica - Brain tonic herb', si: 'මොළයේ ශක්තිය වර්ධනය කරන ඖෂධීය කොළ' },
    parentSlug: 'leafy-greens',
    sortOrder: 1
  },
  {
    name: { en: 'Mukunuwenna', si: 'මුකුණුවැන්න' },
    description: { en: 'Alternanthera sessilis - Nutritious green', si: 'පෝෂණදායක කොළ වර්ගයක්' },
    parentSlug: 'leafy-greens',
    sortOrder: 2
  },
  {
    name: { en: 'Kangkung', si: 'කංකුං' },
    description: { en: 'Water spinach - Popular stir-fry green', si: 'ජනප්‍රිය කරල් කොළ වර්ගයක්' },
    parentSlug: 'leafy-greens',
    sortOrder: 3
  },
  {
    name: { en: 'Spinach', si: 'නිවිති' },
    description: { en: 'Iron-rich leafy vegetable', si: 'යකඩ පදාර්ථ සම්පන්න කොළ එළවළු' },
    parentSlug: 'leafy-greens',
    sortOrder: 4
  },
  {
    name: { en: 'Kankun', si: 'කංකුන්' },
    description: { en: 'Water morning glory', si: 'ජල උදෑසන වර්ධන කොළ' },
    parentSlug: 'leafy-greens',
    sortOrder: 5
  },
  {
    name: { en: 'Hathawariya', si: 'හතවරිය' },
    description: { en: 'Asparagus racemosus - Medicinal herb', si: 'ඖෂධීය වටිනාකමක් සහිත කොළ' },
    parentSlug: 'leafy-greens',
    sortOrder: 6
  },

  // === ROOT VEGETABLES ===
  {
    name: { en: 'Sweet Potato', si: 'බතල' },
    description: { en: 'Nutritious orange and white varieties', si: 'පෝෂණීය තැබිලි සහ සුදු වර්ග' },
    parentSlug: 'root-vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Cassava', si: 'මඤ්ඤොක්කා' },
    description: { en: 'Tapioca root - Staple carbohydrate source', si: 'ප්‍රධාන කාබෝහයිඩ්‍රේට් මූලාශ්‍රය' },
    parentSlug: 'root-vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Yam', si: 'රාජඅල' },
    description: { en: 'Traditional starchy tuber', si: 'සාම්ප්‍රදායික පිෂ්ඨමය අල වර්ගය' },
    parentSlug: 'root-vegetables',
    sortOrder: 3
  },
  {
    name: { en: 'Carrot', si: 'කැරට්' },
    description: { en: 'Beta-carotene rich orange vegetable', si: 'බීටා කැරොටින් සම්පන්න තැඹිලි එළවළු' },
    parentSlug: 'root-vegetables',
    sortOrder: 4
  },
  {
    name: { en: 'Beetroot', si: 'බීට්රූට්' },
    description: { en: 'Red root vegetable rich in iron', si: 'යකඩ පදාර්ථවලින් සම්පන්න රතු මූල එළවළු' },
    parentSlug: 'root-vegetables',
    sortOrder: 5
  },
  {
    name: { en: 'Radish', si: 'රාබු' },
    description: { en: 'White and red radish varieties', si: 'සුදු සහ රතු රාබු වර්ග' },
    parentSlug: 'root-vegetables',
    sortOrder: 6
  },

  // === GOURDS & SQUASHES ===
  {
    name: { en: 'Pumpkin', si: 'වට්ටක්කා' },
    description: { en: 'Large orange squash variety', si: 'විශාල තැඹිලි වට්ටක්කා වර්ගය' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 1
  },
  {
    name: { en: 'Bottle Gourd', si: 'ලබු' },
    description: { en: 'Light green bottle-shaped gourd', si: 'ලා කොළ පාට බෝතල් හැඩැති ලබු' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 2
  },
  {
    name: { en: 'Ridge Gourd', si: 'පතෝල' },
    description: { en: 'Ribbed cylindrical gourd', si: 'කොටු සහිත සිලින්ඩරාකාර ලබු' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 3
  },
  {
    name: { en: 'Snake Gourd', si: 'පතෝල' },
    description: { en: 'Long twisted gourd variety', si: 'දිගු වක්‍ර ලබු වර්ගය' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 4
  },
  {
    name: { en: 'Ash Gourd', si: 'කොහිළ' },
    description: { en: 'Large white winter melon', si: 'විශාල සුදු ශීත කොහිළ' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 5
  },
  {
    name: { en: 'Bitter Gourd', si: 'කරවිල' },
    description: { en: 'Medicinal bitter vegetable', si: 'ඖෂධීය කහට එළවළු' },
    parentSlug: 'gourds-and-squashes',
    sortOrder: 6
  },

  // === POD VEGETABLES ===
  {
    name: { en: 'Long Beans', si: 'දොළ' },
    description: { en: 'Yard-long beans', si: 'දිගු බෝංචි වර්ගය' },
    parentSlug: 'pod-vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Green Beans', si: 'බෝංචි' },
    description: { en: 'French beans', si: 'ප්‍රංශ බෝංචි' },
    parentSlug: 'pod-vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Okra', si: 'බණ්ඩක්කා' },
    description: { en: 'Ladies finger - Mucilaginous pod', si: 'ස්ත්‍රී ඇඟිල්ල - ලිස්සන කරල්' },
    parentSlug: 'pod-vegetables',
    sortOrder: 3
  },
  {
    name: { en: 'Drumstick', si: 'මුරුංගා' },
    description: { en: 'Moringa pods - Superfood vegetable', si: 'මුරුංගා කරල් - සුපර් ආහාර එළවළු' },
    parentSlug: 'pod-vegetables',
    sortOrder: 4
  },

  // === STEM & BULB VEGETABLES ===
  {
    name: { en: 'Onion', si: 'ලූණු' },
    description: { en: 'Common cooking onion', si: 'සාමාන්‍ය ආහාර පිසීමේ ලූණු' },
    parentSlug: 'stem-and-bulb-vegetables',
    sortOrder: 1
  },
  {
    name: { en: 'Garlic', si: 'සුදුළූණු' },
    description: { en: 'Aromatic bulb spice', si: 'සුවඳ බල්බ කුළුබඩු' },
    parentSlug: 'stem-and-bulb-vegetables',
    sortOrder: 2
  },
  {
    name: { en: 'Leeks', si: 'ලීක්ස්' },
    description: { en: 'Long green onion variety', si: 'දිගු හරිත ලූණු වර්ගය' },
    parentSlug: 'stem-and-bulb-vegetables',
    sortOrder: 3
  },

  // === FRUIT SUBCATEGORIES ===
  {
    name: { en: 'Tropical Fruits', si: 'නිවර්තන පලතුරු' },
    description: { 
      en: 'Exotic tropical fruits native to Sri Lanka', 
      si: 'ශ්‍රී ලංකාවට ආවේණික නිවර්තන පලතුරු' 
    },
    parentSlug: 'fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Citrus Fruits', si: 'දෙහි වර්ග' },
    description: { 
      en: 'Vitamin C rich citrus varieties', 
      si: 'විටමින් C සම්පන්න දෙහි වර්ග' 
    },
    parentSlug: 'fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Stone Fruits', si: 'ගල් පලතුරු' },
    description: { 
      en: 'Fruits with hard stones or pits', 
      si: 'ගල් සහිත පලතුරු වර්ග' 
    },
    parentSlug: 'fruits',
    sortOrder: 3
  },
  {
    name: { en: 'Seasonal Fruits', si: 'කාලීන පලතුරු' },
    description: { 
      en: 'Fruits available during specific seasons', 
      si: 'විශේෂ සෘතුවන්හි ලැබෙන පලතුරු' 
    },
    parentSlug: 'fruits',
    sortOrder: 4
  },

  // === TROPICAL FRUITS ===
  {
    name: { en: 'Mango', si: 'අඹ' },
    description: { en: 'King of fruits - Multiple varieties', si: 'පලතුරුන්ගේ රජා - වර්ග ගණනාවක්' },
    parentSlug: 'tropical-fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Pineapple', si: 'අන්නාසි' },
    description: { en: 'Sweet and tangy tropical fruit', si: 'මිහිරි සහ ඇම්බර රසයක් සහිත නිවර්තන පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Papaya', si: 'පැපොල්' },
    description: { en: 'Enzyme-rich orange fruit', si: 'එන්සයිම සම්පන්න තැඹිලි පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 3
  },
  {
    name: { en: 'Jackfruit', si: 'කෝස්' },
    description: { en: 'Largest tree fruit in the world', si: 'ලෝකයේ විශාලතම ගස් පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 4
  },
  {
    name: { en: 'Breadfruit', si: 'දෙල්' },
    description: { en: 'Starchy tropical fruit', si: 'පිෂ්ඨමය නිවර්තන පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 5
  },
  {
    name: { en: 'Rambutan', si: 'රම්බුතන්' },
    description: { en: 'Hairy sweet tropical fruit', si: 'හිසකෙස් සහිත මිහිරි නිවර්තන පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 6
  },
  {
    name: { en: 'Dragon Fruit', si: 'ඩ්‍රැගන් ෆ්‍රූට්' },
    description: { en: 'Exotic cactus fruit', si: 'අපූර්ව කැක්ටස් පලතුරු' },
    parentSlug: 'tropical-fruits',
    sortOrder: 7
  },

  // === CITRUS FRUITS ===
  {
    name: { en: 'Lime', si: 'දෙහි' },
    description: { en: 'Small green citrus fruit', si: 'කුඩා කොළ දෙහි පලතුරු' },
    parentSlug: 'citrus-fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Orange', si: 'දොඩම්' },
    description: { en: 'Sweet orange varieties', si: 'මිහිරි දොඩම් වර්ග' },
    parentSlug: 'citrus-fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Sweet Orange', si: 'මිහිරි දොඩම්' },
    description: { en: 'Juicy sweet oranges', si: 'යුෂ සම්පන්න මිහිරි දොඩම්' },
    parentSlug: 'citrus-fruits',
    sortOrder: 3
  },
  {
    name: { en: 'Pomelo', si: 'ජම්බෝල' },
    description: { en: 'Large citrus fruit', si: 'විශාල දෙහි පලතුරු' },
    parentSlug: 'citrus-fruits',
    sortOrder: 4
  },

  // === SEASONAL FRUITS ===
  {
    name: { en: 'Durian', si: 'ඩුරියන්' },
    description: { en: 'King of fruits with strong aroma', si: 'තද සුවඳක් සහිත පලතුරුන්ගේ රජා' },
    parentSlug: 'seasonal-fruits',
    sortOrder: 1
  },
  {
    name: { en: 'Mangosteen', si: 'මන්ගස්ටීන්' },
    description: { en: 'Purple exotic fruit', si: 'දම් පාට අපූර්ව පලතුරු' },
    parentSlug: 'seasonal-fruits',
    sortOrder: 2
  },
  {
    name: { en: 'Wood Apple', si: 'දිවුල්' },
    description: { en: 'Hard shell nutritious fruit', si: 'දෘඪ කවචයක් සහිත පෝෂණීය පලතුරු' },
    parentSlug: 'seasonal-fruits',
    sortOrder: 3
  },
  {
    name: { en: 'Passion Fruit', si: 'පැෂන් ෆ්‍රූට්' },
    description: { en: 'Aromatic purple passion fruit', si: 'සුවඳ සහිත දම් පැෂන් ෆ්‍රූට්' },
    parentSlug: 'seasonal-fruits',
    sortOrder: 4
  },

  // === GRAINS & CEREALS SUBCATEGORIES ===
  {
    name: { en: 'Rice Varieties', si: 'සහල් වර්ග' },
    description: { 
      en: 'Traditional and modern rice varieties', 
      si: 'සාම්ප්‍රදායික සහ නවීන සහල් වර්ග' 
    },
    parentSlug: 'grains-and-cereals',
    sortOrder: 1
  },
  {
    name: { en: 'Millets', si: 'කුරක්කන් වර්ග' },
    description: { 
      en: 'Nutritious ancient grains', 
      si: 'පෝෂණීය පුරාණ ධාන්‍ය' 
    },
    parentSlug: 'grains-and-cereals',
    sortOrder: 2
  },
  {
    name: { en: 'Other Grains', si: 'වෙනත් ධාන්‍ය' },
    description: { 
      en: 'Other cereal and grain varieties', 
      si: 'අනෙකුත් ධාන්‍ය සහ ධාන්‍ය වර්ග' 
    },
    parentSlug: 'grains-and-cereals',
    sortOrder: 3
  },

  // === RICE VARIETIES ===
  {
    name: { en: 'Red Rice', si: 'රතු හාල්' },
    description: { en: 'Traditional unpolished red rice', si: 'සාම්ප්‍රදායික නොකෙටූ රතු සහල්' },
    parentSlug: 'rice-varieties',
    sortOrder: 1
  },
  {
    name: { en: 'White Rice', si: 'සුදු හාල්' },
    description: { en: 'Polished white rice varieties', si: 'කෙටූ සුදු සහල් වර්ග' },
    parentSlug: 'rice-varieties',
    sortOrder: 2
  },
  {
    name: { en: 'Basmati Rice', si: 'බාස්මති සහල්' },
    description: { en: 'Aromatic long grain rice', si: 'සුවඳ සහිත දිගු ධාන්‍ය සහල්' },
    parentSlug: 'rice-varieties',
    sortOrder: 3
  },
  {
    name: { en: 'Samba Rice', si: 'සම්බා සහල්' },
    description: { en: 'Traditional Sri Lankan rice variety', si: 'සාම්ප්‍රදායික ශ්‍රී ලාංකික සහල් වර්ගය' },
    parentSlug: 'rice-varieties',
    sortOrder: 4
  },

  // === SPICES & HERBS SUBCATEGORIES ===
  {
    name: { en: 'Whole Spices', si: 'සම්පූර්ණ කුළුබඩු' },
    description: { 
      en: 'Whole form traditional spices', 
      si: 'සම්පූර්ණ ස්වරූපයේ සාම්ප්‍රදායික කුළුබඩු' 
    },
    parentSlug: 'spices-and-herbs',
    sortOrder: 1
  },
  {
    name: { en: 'Fresh Herbs', si: 'නැවුම් ඖෂධ පැළෑටි' },
    description: { 
      en: 'Fresh aromatic and medicinal herbs', 
      si: 'නැවුම් සුවඳ සහ ඖෂධීය ගස්' 
    },
    parentSlug: 'spices-and-herbs',
    sortOrder: 2
  },
  {
    name: { en: 'Dried Herbs', si: 'වියළූ ඖෂධ පැළෑටි' },
    description: { 
      en: 'Dried medicinal and culinary herbs', 
      si: 'වියළූ ඖෂධීය සහ ආහාර පිසීමේ ගස්' 
    },
    parentSlug: 'spices-and-herbs',
    sortOrder: 3
  },
  {
    name: { en: 'Curry Leaves & Aromatics', si: 'කරපිංචා සහ සුවඳ දෙවැනි' },
    description: { 
      en: 'Essential curry leaves and aromatic herbs', 
      si: 'අත්‍යවශ්‍ය කරපිංචා සහ සුවඳ ඖෂධ පැළෑටි' 
    },
    parentSlug: 'spices-and-herbs',
    sortOrder: 4
  },

  // === WHOLE SPICES ===
  {
    name: { en: 'Cinnamon', si: 'කුරුඳු' },
    description: { en: 'Ceylon cinnamon - World\'s finest', si: 'ලංකා කුරුඳු - ලෝකයේ හොඳම' },
    parentSlug: 'whole-spices',
    sortOrder: 1
  },
  {
    name: { en: 'Black Pepper', si: 'ගම්මිරිස්' },
    description: { en: 'King of spices', si: 'කුළුබඩුවල රජා' },
    parentSlug: 'whole-spices',
    sortOrder: 2
  },
  {
    name: { en: 'Cardamom', si: 'එනසාල්' },
    description: { en: 'Queen of spices', si: 'කුළුබඩුවල ක්වීන්' },
    parentSlug: 'whole-spices',
    sortOrder: 3
  },
  {
    name: { en: 'Cloves', si: 'කරාබු නැටි' },
    description: { en: 'Aromatic flower buds', si: 'සුවඳ සහිත මල් පොහොට්ටු' },
    parentSlug: 'whole-spices',
    sortOrder: 4
  },
  {
    name: { en: 'Nutmeg', si: 'සාදික්කා' },
    description: { en: 'Fragrant seed spice', si: 'සුවඳ සහිත බීජ කුළුබඩුව' },
    parentSlug: 'whole-spices',
    sortOrder: 5
  },

  // === FRESH HERBS ===
  {
    name: { en: 'Ginger', si: 'ඉඟුරු' },
    description: { en: 'Fresh ginger root', si: 'නැවුම් ඉඟුරු මුල' },
    parentSlug: 'fresh-herbs',
    sortOrder: 1
  },
  {
    name: { en: 'Turmeric', si: 'කහ' },
    description: { en: 'Fresh turmeric root', si: 'නැවුම් කහ මුල' },
    parentSlug: 'fresh-herbs',
    sortOrder: 2
  },
  {
    name: { en: 'Lemongrass', si: 'සේර' },
    description: { en: 'Citrusy aromatic grass', si: 'දෙහි සුවඳක් සහිත තෘණ' },
    parentSlug: 'fresh-herbs',
    sortOrder: 3
  },
  {
    name: { en: 'Pandan Leaves', si: 'රම්පෙ' },
    description: { en: 'Fragrant cooking leaves', si: 'සුවඳ සහිත ආහාර පිසීමේ කොළ' },
    parentSlug: 'fresh-herbs',
    sortOrder: 4
  },
  {
    name: { en: 'Curry Leaves', si: 'කරපිංචා' },
    description: { en: 'Essential Sri Lankan cooking herb', si: 'අත්‍යවශ්‍ය ශ්‍රී ලාංකික ආහාර පිසීමේ ගස්' },
    parentSlug: 'curry-leaves-and-aromatics',
    sortOrder: 1
  }
];

export { sampleCategories };
export default Category;
// backend/src/models/User.js
import mongoose from 'mongoose';

// Address সাব-স্কিমা (একাধিক অ্যাড্রেস রাখার জন্য)
const addressSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Home', 'Office', 'Other'],
    default: 'Home'
  },
  recipientName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  division: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  upazila: { 
    type: String, 
    required: true 
  },
  area: { 
    type: String, 
    required: true 
  },
  landmark: String,
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'user' 
  },
  profilePic: String,
  phone: String,
  
  // ✅ পুরনো সিঙ্গেল অ্যাড্রেস (optional - backward compatibility)
  address: String,
  
  // ✅ নতুন: একাধিক অ্যাড্রেস রাখার জন্য array
  addresses: [addressSchema],
  
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  cart: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    },
    size: String,
    quantity: Number,
    price: Number
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

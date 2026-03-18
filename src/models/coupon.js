import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ["percentage","fixed"], required: true },
  discountValue: { type: Number, required: true, min:0 },
  minimumOrderAmount: { type: Number, default:0 },
  maximumDiscountAmount: { type: Number, default:null },
  validFrom: { type: Date, required:true },
  validUntil: { type: Date, required:true },
  usageLimit: { type:Number, default:null },
  usedCount: { type:Number, default:0 },
  perUserLimit: { type:Number, default:1 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref:"Product" }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref:"Category" }],
  excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref:"Product" }],
  userEligibility: { type: String, enum:["all","new","existing"], default:"all" },
  isActive: { type:Boolean, default:true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:"User" }
},{ timestamps:true });

// Methods
couponSchema.methods.isValid = function(){
  const now = new Date();
  return this.isActive && now >= this.validFrom && now <= this.validUntil && (!this.usageLimit || this.usedCount < this.usageLimit);
};

couponSchema.methods.canUserUse = async function(userId){
  const Order = mongoose.model("Order");
  if(this.perUserLimit){
    const userUsage = await Order.countDocuments({ user:userId, couponCode:this.code });
    if(userUsage >= this.perUserLimit) return false;
  }
  if(this.userEligibility === "new"){
    const userOrders = await Order.countDocuments({ user:userId });
    if(userOrders>0) return false;
  }
  return true;
};

couponSchema.methods.calculateDiscount = function(orderAmount){
  if(orderAmount < this.minimumOrderAmount) return 0;
  let discount = this.discountType === "percentage" ? (orderAmount*this.discountValue)/100 : this.discountValue;
  if(this.maximumDiscountAmount && discount>this.maximumDiscountAmount) discount = this.maximumDiscountAmount;
  return Math.min(discount, orderAmount);
};

export default mongoose.model("Coupon", couponSchema);

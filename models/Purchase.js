import mongoose from "mongoose";

let purchaseSchema = new mongoose.Schema({
  customerId: String,
  productName: String,
  quantity: Number,
  pricing: Number,
  mrp: Number,
});

let purchaseModel = mongoose.model("Purchase", purchaseSchema);
export { purchaseModel };

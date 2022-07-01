import mongoose from "mongoose";

let shipSchema = new mongoose.Schema({
  customerId: String,
  purchaseId: String,
  address: String,
  city: String,
  pinCode: Number,
});

let shippingModel = mongoose.model("Shipping", shipSchema);
export { shippingModel };

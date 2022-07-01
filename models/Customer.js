import mongoose from "mongoose";

let customerSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  city: String,
});

export const customerModel = mongoose.model("Customer", customerSchema);

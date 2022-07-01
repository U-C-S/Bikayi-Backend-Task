import mongoose from "mongoose";
import connection from "../util/connection.js";
connection;

let customerSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  city: String,
});

export const customerModel = mongoose.model("Customer", customerSchema);
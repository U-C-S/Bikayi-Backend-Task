import { Router } from "express";
import { customerModel } from "../models/index.js";

const router = Router();

/**
 * Statment 1
 * add customers and their details
 */
router.post("/add", async (req, res) => {
  let { customerName, email, phone, city } = req.body;

  if (!customerName || !email || !phone || !city) {
    return res.status(400).send({ message: "Please fill all fields" });
  }

  let customer = new customerModel(req.body);

  let customerData = await customer.save();
  res.json(customerData);
});

export { router as customersRouter };

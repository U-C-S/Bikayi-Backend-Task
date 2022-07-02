import { Router } from "express";
import { customerModel } from "../models/index.js";

const router = Router();

/**
 * Statment 1
 * add customers and their details
 * /customer
 */
router.post("/add", async (req, res) => {
  let customer = new customerModel(req.body);

  let customerData = await customer.save();
  res.json(customerData);
});

export { router as customersRouter };

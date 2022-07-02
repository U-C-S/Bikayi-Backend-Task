import { Router } from "express";
import { purchaseModel, shippingModel } from "../models/index.js";

const router = Router();

/**
 * Statment 2
 * Purchase Order
 */
router.post("/purchase", async (req, res) => {
  let purchase = new purchaseModel(req.body);

  if (req.body.mrp < req.body.pricing) {
    return res
      .status(400)
      .send({ message: "Pricing cannot be greater than MRP" });
  } else {
    let purchaseInfo = await purchase.save();
    res.json(purchaseInfo);
  }
});

/**
 * Statment 3
 * Shipping Details
 * /ship
 */
router.post("/shipping", async (req, res) => {
  let ship = new shippingModel(req.body);

  let shipmentInfo = await ship.save();
  res.json(shipmentInfo);
});

export { router as itemsRouter };

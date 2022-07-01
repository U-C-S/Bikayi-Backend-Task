import { Router } from "express";
import {
  customerModel,
  purchaseModel,
  shippingModel,
} from "../models/index.js";
const router = Router();

/**
 * Statment 1
 * /customer
 */
router.post("/addcustomer", async (req, res) => {
  let customer = new customerModel(req.body);

  let customerData = await customer.save();
  res.json(customerData);
});

/**
 * Statment 2
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
 * /ship
 */
router.post("/shipping", async (req, res) => {
  let ship = new shippingModel(req.body);

  let shipmentInfo = await ship.save();
  res.json(shipmentInfo);
});

/**
 * Statment 4, 5
 * /orders
 */
router.get("/allorders", (req, res) => {
  let { city } = req.query;

  /**
   * @type {import("mongoose").PipelineStage[]}
   */
  let commonPipelineStages = [
    { $addFields: { customerId: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "purchases",
        localField: "customerId",
        foreignField: "customerId",
        as: "purchases",
      },
    },
    { $unwind: "$purchases" },
    {
      $group: {
        _id: "$_id",
        customerName: { $first: "$customerName" },
        email: { $first: "$email" },
        phone: { $first: "$phone" },
        city: { $first: "$city" },
        purchaseOrders: { $push: "$purchases" },
      },
    },
  ];

  if (city) {
    customerModel
      .aggregate([
        {
          $match: {
            city,
          },
        },
        ...commonPipelineStages,
      ])
      .then((data) => res.json(data));
  } else {
    customerModel
      .aggregate(commonPipelineStages)
      .then((data) => res.json(data));
  }
});

router.get("/shipping", async (req, res) => {
  let x = await customerModel.aggregate([
    {
      $addFields: {
        customerId: { $toString: "$_id" },
      },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "customerId",
        foreignField: "customerId",
        as: "purchaseOrder",
      },
    },
    { $unwind: "$purchaseOrder" },
    {
      $addFields: {
        purchaseId_temp: { $toString: "$purchaseOrder._id" },
      },
    },
    {
      $lookup: {
        from: "shippings",
        localField: "purchaseId_temp",
        foreignField: "purchaseId",
        as: "purchaseOrder.shipmentDetail",
      },
    },
    {
      $group: {
        _id: "$customerId",
        customerName: { $first: "$customerName" },
        email: { $first: "$email" },
        phone: { $first: "$phone" },
        city: { $first: "$city" },
        purchaseOrder: { $push: "$purchaseOrder" },
      },
    },
  ]);

  res.json(x);
});

export default router;

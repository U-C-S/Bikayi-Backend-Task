import { Router } from "express";
import {
  customerModel,
  purchaseModel,
  shippingModel,
} from "../models/index.js";

const router = Router();

/**
 * Statment 1
 * add customers and their details
 * /customer
 */
router.post("/addcustomer", async (req, res) => {
  let customer = new customerModel(req.body);

  let customerData = await customer.save();
  res.json(customerData);
});

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

/**
 * Statment 4, 5
 * get customers which have shipment with city filter
 * get customers with all purchase order
 * /orders
 */
router.get("/allorders", async (req, res) => {
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

  // $cond is not allowed in free-tier of Atlas, manually add the condition
  if (city) {
    let data = await customerModel.aggregate([
      {
        $match: {
          city: city,
        },
      },
      ...commonPipelineStages,
    ]);

    res.json(data);
  } else {
    let data = await customerModel.aggregate(commonPipelineStages);
    res.json(data);
  }
});

/**
 * Statment 6
 * Get customer with all purchase order and shipment details
 */
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

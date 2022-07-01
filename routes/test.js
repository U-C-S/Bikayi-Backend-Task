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

router.get("/shipping", (req, res) => {
  shippingModel
    .aggregate([
      {
        $addFields: {
          purchaseId: { $toObjectId: "$purchaseId" },
          customerId: { $toObjectId: "$customerId" },
        },
      },
      {
        $lookup: {
          from: "purchases",
          localField: "purchaseId",
          foreignField: "_id",
          as: "purchases",
        },
      },
      { $unwind: "$purchases" },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customers",
        },
      },
      { $unwind: "$customers" },
      {
        $project: {
          customer: {
            customerName: "$customers.customerName",
            email: "$customers.email",
            phone: "$customers.phone",
            city: "$customers.city",
            purchaseOrder: {
              purchaseId: "$purchases._id",
              customerId: "$customers._id",
              productName: "$purchases.productName",
              pricing: "$purchases.pricing",
              mrp: "$purchases.mrp",
              quantity: "$purchases.quantity",
              shipmentDetails: {
                shipmentId: "$_id",
                address: "$address",
                city: "$city",
                state: "$state",
              },
            },
          },
        },
      },
    ])
    .then((data) => res.json(data));
});

export default router;

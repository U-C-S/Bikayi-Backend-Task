import { Router } from "express";
import { customerModel, shippingModel } from "../models/index.js";

const router = Router();

/**
 * Statment 4
 * get customers which have shipment with city filter
 */
router.get("/shipments/city", async (req, res) => {
  let { name } = req.query;

  let shipmentData = await shippingModel.aggregate([
    {
      $match: {
        city: name,
      },
    },
    {
      $addFields: {
        customerId: { $toObjectId: "$customerId" },
        purchaseId: { $toObjectId: "$purchaseId" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "purchaseId",
        foreignField: "_id",
        as: "purchaseInfo",
      },
    },
    {
      $unset: ["customerId", "purchaseId", "__v"],
    },
  ]);

  res.json(shipmentData);
});

/**
 * Statment 5
 * get customers with all purchase order
 * /orders
 */
router.get("/allpurchases", async (req, res) => {
  /**
   * @type {import("mongoose").PipelineStage[]}
   */
  let PipelineStages = [
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

  let data = await customerModel.aggregate(PipelineStages);
  res.json(data);
});

/**
 * Statment 6
 * Get customer with all purchase order and shipment details
 */
router.get("/all", async (req, res) => {
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

export { router as ordersRouter };

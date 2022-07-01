import { Router } from "express";
import testRouter from "./test.js";

const router = Router();

router.use("/", testRouter);

export default router;

import express, { json } from "express";

import "./util/connection.js";
import { ordersRouter } from "./routes/orders.js";
import { customersRouter } from "./routes/customers.js";
import { itemsRouter } from "./routes/items.js";

const app = express();

app.use(json());
// app.use("/api", justOneRouter);

app.use("/customers", customersRouter);
app.use("/items", itemsRouter);
app.use("/orders", ordersRouter);

export default app;

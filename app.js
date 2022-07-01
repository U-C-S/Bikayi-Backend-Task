import "./util/connection.js";
import express, { json } from "express";
import justOneRouter from "./routes/allroutes.js";

const app = express();

app.use(json());
app.use("/api", justOneRouter);

export default app;

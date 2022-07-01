import "./util/connection.js";
import express, { json } from "express";
import oldRouter from "./routes/index.js";
// import cors from "cors";

const app = express();

app.use(json());
app.use("/api", oldRouter);

export default app;

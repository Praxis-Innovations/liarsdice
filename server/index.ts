import "dotenv/config";
import cors from "cors";
import express from "express";
import { getServerRuntimeEnv } from "./config/env";
import { healthRouter } from "./routes/health";
import { meRouter } from "./routes/me";

const { port, corsOrigins } = getServerRuntimeEnv();

const app = express();
app.use(
  cors({
    origin: corsOrigins ? corsOrigins.split(",").map((origin) => origin.trim()) : true,
  })
);
app.use(express.json());

app.use(healthRouter);
app.use(meRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

import express from "express"
import cors from "cors"
import "dotenv/config"
import { routerforDepth } from "./routes/depth";
import { routerforOrders } from "./routes/orders";
import { routerforBalance } from "./routes/balance";
// import { startdbserver } from "./db";
import { routerforauth } from "./routes/auth";
import { routerfortrades } from "./routes/trades";
import { routerforkline } from "./routes/kline";
import { routerforticker } from "./routes/ticker";

const app = express()
app.use(cors());
app.use(express.json());
// startdbserver()

app.use("/api/v1/orders",routerforOrders);
app.use("/api/v1/depth", routerforDepth);
app.use("/api/v1/getbalance", routerforBalance);
app.use("/api/v1/auth", routerforauth);
app.use("/api/v1/trades", routerfortrades);
app.use("/api/v1/kline",routerforkline);
app.use("/api/v1/ticker",routerforticker);
 

app.listen(3001, () => console.log("server is running on port 3001"))
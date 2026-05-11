import { response, Router } from "express";
import { apiRedisManager } from "../redismanager";
import { CREATE_ORDER } from "../types/types";
import { MessageFromApi } from "../../engine/types";
import { MessageFromOrderbook } from "../types";
import { pgClient } from "../db";
import { authmiddleware } from "../middleware";
export const routerforOrders = Router()



routerforOrders.post("/createOrder", authmiddleware,async(req,res)=>{
    const { market , price , quantity, side  } = req.body as any;
    try{
    if (!market ||  !price  || !quantity ||  !side || !(Number(price)>0) || !(Number(quantity)>0)) {
        throw new Error ("provide valid intputs")
    }
    const scaledprice = Math.round(Number(price)*1000) 
    const scaledquantity = Math.round(Number(quantity)*1000) 
    const userId = (req as any).userId
    const response : MessageFromOrderbook  = await apiRedisManager.getinstance().sendAndAwait({
        type : CREATE_ORDER,
        data : {
            market ,
            price : scaledprice.toString() ,
            quantity :scaledquantity.toString(),
            side ,
            userId
        }
     })
     res.json(response.payload)
    }catch(err:any){
        console.log("erre aaya nhai ordercreate me",market)
       res.status(400).json({
        error : err.message
       })
    }
})

routerforOrders.delete("/cancleOrder", async (req, res) => {
  const { orderId, market, userId } = req.body;
  try {

    const response: MessageFromOrderbook =
      await apiRedisManager.getinstance().sendAndAwait({
        type: "CANCEL_ORDER",
        data: {
          orderId,
          market,
          userId,
        },
      });

    res.json(response.payload);
  } catch (err: any) {
        console.log("erre aaya nhai cancleOrder     --create me",market)

    res.status(400).json({
      error: err.message,
    });
  }
});

routerforOrders.get("/openOrder", authmiddleware, async (req, res) => {
  const userId = (req as any).userId;
  try {

    const response: MessageFromOrderbook =
      await apiRedisManager.getinstance().sendAndAwait({
        type: "GET_OPEN_ORDERS",
        data: {
          userId,
          market: req.query.market as string,
        },
      });

    res.json(response.payload);
  } catch (err: any) {
        console.log("erre aaya nhai opemn  == Order     --create me",req.query.market)

    res.status(400).json({
      error: err.message,
    });
  }
});


routerforOrders.get("/orderHistory",authmiddleware,async(req,res)=>{
         const userId = (req as any).userId

    const query = "SELECT * FROM orders WHERE userid = $1"

   const Response = await pgClient.query(query,[userId])

    res.json(Response.rows)
})

routerforOrders.get("/tradeHistory", authmiddleware,async(req,res)=>{
         const userId = (req as any).userId

    const query = "SELECT * FROM trades WHERE makerId = $1 OR takerId = $1"

   const Response = await pgClient.query(query,[userId])
    res.json({rows : Response.rows , userId })
})



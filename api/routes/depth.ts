import { Router } from "express";
import { createClient } from "redis";
import { apiRedisManager } from "../redismanager";
import { GET_DEPTH } from "../types/types";
import { MessageFromOrderbook } from "../types";


export const routerforDepth  = Router()
const client  = createClient()

routerforDepth.get("/", async(req,res)=>{
      const market = req.query.market 
    const response : MessageFromOrderbook  = await apiRedisManager.getinstance().sendAndAwait({
        type : GET_DEPTH,
        data : {
            market : market as string
        } 
    })
    res.json(response.payload)
})
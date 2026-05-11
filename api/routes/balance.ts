import { Router } from "express";
import { createClient } from "redis";
import { apiRedisManager } from "../redismanager";
import { authmiddleware } from "../middleware";


export const routerforBalance = Router()
routerforBalance.get("/userBalance", authmiddleware, async (req,res)=>{
     const userId = (req as any).userId  ;
     const response = await apiRedisManager.getinstance().sendAndAwait({
           type : "GET_USER_BALANCE" ,
           data : {
               userId : userId 
           }
     })
     res.json(response.payload)
}) 
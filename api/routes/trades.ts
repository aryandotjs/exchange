import { Router } from "express"
import { pgClient } from "../db"

export const routerfortrades =  Router()

routerfortrades.get("/",async (req,res)=>{
      const market = req.query.market as string;
      try{
          const resopnse = await pgClient.query(`SELECT * FROM trades WHERE market=$1 ORDER BY time DESC LIMIT 50`,[market])
          res.json(resopnse.rows)
      }catch(err : any){
          res.status(400).json({
            error : err.message ?? "error while finding trades" 
        })
      }

} )


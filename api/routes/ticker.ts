import { Router } from "express"
import { pgClient } from "../db"

export const routerforticker =  Router()

routerforticker.get("/",async (req,res)=>{
      const market = req.query.market as string;
      try{
             await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1m`)
             await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1h`)
             await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1d`)
          const response = await pgClient.query(`SELECT * FROM kline_1h WHERE market=$1 AND bucket > NOW()- INTERVAL '24 hours' ORDER BY bucket ASC `,[market])
          if (!(response.rows.length > 0)) {
             res.json([]) 
             return ;
          }
             let firstPrice24ago = response.rows[response.rows.length-1]
             let firstPrice =  firstPrice24ago.open
             let lastPrice = response.rows[0].close
             let high = -Infinity ; 
             let low = Infinity ; 
             let volume = 0;
             let  priceChange = lastPrice - firstPrice24ago.open     
             let  priceChangePercent  =  (priceChange/firstPrice) * 100  
             let symbol = market
             response.rows.forEach((a)=>{
                if (a.high>high) {
                   high = a.high
                  }
                  if (a.low<low) {
                     low = a.low
                  }
                  volume += a.volume ;
               })
               let quoteVolume =  volume * lastPrice  
               
             res.json({
                    firstPrice  ,
                    high ,
                    lastPrice ,
                    low ,
                    priceChange ,
                    priceChangePercent ,
                    quoteVolume ,
                    symbol ,
                    volume 
             })
          
      }catch(err : any){
          res.status(400).json({
            error : err.message ?? "error while finding ticker" 
        })
      }

} )

// bucket :  "2026-05-03T09:00:00.000Z" close :  8.04 high :  124 low :  8.04 market :  "SOL_USD" open :  124 volume :  7
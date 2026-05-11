import { Router } from "express";
import { pgClient } from "../db";



export const routerforkline = Router()

 const intervalMap : any = { 
     "1m" : 60  ,
     "1h" : 60 * 60  ,
     "1d" : 24 * 60 * 60 
 }

routerforkline.get("/",async (req,res)=>{
      const market = req.query.market as string ;
      const interval = req.query.interval as string ;
    try{
        let response ;  
        switch(interval){
            case "1m" : 
                response = await pgClient.query(`SELECT * FROM kline_1m WHERE market=$1 ORDER by bucket ASC LIMIT 50`,[market])
            break ;
            case "1h" : 
                response = await pgClient.query(`SELECT * FROM kline_1h WHERE market=$1 ORDER by bucket ASC LIMIT 50`,[market])
            break ;
            case "1d" : 
                response = await pgClient.query(`SELECT * FROM kline_1d WHERE market=$1 ORDER by bucket ASC LIMIT 50`,[market])
            break ;
        }
        if (response?.rows.length == 0) {
            res.json([])
            return 
        }
        const final = response?.rows.map((a)=>{
            return  {
                time: Math.floor(new Date(a.bucket).getTime() / 1000),
                open: a.open,
                high: a.high,
                low: a.low,
                close: a.close,
                volume: a.volume,
            }}) || []

        const finalklines = [] 

        for (let i = 0; i < final?.length - 1 ; i++) {
            finalklines.push(final[i])

            const gap = final[i+1].time - final[i].time ;
             if (gap > intervalMap[interval]) {
                let newtime = final[i].time +  intervalMap[interval] ;
                while(newtime < final[i+1].time){
                  finalklines.push({
                        time: newtime,
                        open: final[i].close,
                        high: final[i].close,
                        low: final[i].close,
                        close: final[i].close,
                        volume: 0,
                  })
                  newtime += intervalMap[interval]
                } 
             }
        }   

        finalklines.push(final[final.length-1]) 

        if (finalklines.length > 300) {
           const klinetobesend =  finalklines.splice(-300)
           res.json( klinetobesend)
           return ;
        }

        res.json(finalklines)

    }catch(err :any){
        res.status(400).json({
            error : err.message || "error while fetching kline data from api"
        })
    }
})
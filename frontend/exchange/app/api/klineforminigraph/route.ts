import { getSpotMarket } from "@/app/utils/httpinitials";
import axios from "axios";
import { promises } from "dns";
import { NextRequest, NextResponse } from "next/server";


 let cache : any = null ;
 let timestamp = Date.now() / 1000;
 export async function GET(req:NextRequest){
   const timestamapnow = Date.now() / 1000;
  const timeaswanter = Math.floor(timestamp) - 7 * 24 * 60 * 60;
  if (!cache || (timestamapnow-timestamp)>(60*30) ) {
     timestamp = Date.now() / 1000;
    try {
      const result = await fetch("https://api.backpack.exchange/api/v1/tickers") 
        const data =await result.json()
        const filtered = data.filter((a:any)=>{
            return a.symbol.endsWith("USDC")
        })
        const newarr = await Promise.all(
       filtered.map( async (a:any)=>{
         const res = await fetch(
           `https://api.backpack.exchange/api/v1/klines?symbol=${a.symbol}&interval=${"6h"}&startTime=${timeaswanter}`,
           {
            next : {revalidate : 2000}
          }
          );
          const kd = await res.json()
            const closes =  kd.map((c :any)=>{ return c.close})
             return [a.symbol , closes]
        }))
      const klinedata  = Object.fromEntries(newarr)
      cache = klinedata
      return NextResponse.json(klinedata);
    } catch (err: any) {
      return NextResponse.json({ error: err.message, status: "500" });
    }
    
     
  }
  return NextResponse.json(cache)
} 
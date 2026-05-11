import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
 const intervalMap : any = { 
     "1m" : 60  ,
     "1h" : 60 * 60  ,
     "1d" : 24 * 60 * 60 
 }
export async function GET(req :NextRequest, context :any) {
    const params = await context.params
    const url =new URL(req.url)
    const market = params.market
    const interval = url.searchParams.get("interval")
    const startTime = Math.floor(Date.now()/1000) - ( intervalMap[interval?? "1h"]  * 300 );
  try {
    const res = await axios(
     `https://api.backpack.exchange/api/v1/klines?symbol=${market}&interval=${interval}&startTime=${startTime}`
    );
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message, status: "500" });
  }
}


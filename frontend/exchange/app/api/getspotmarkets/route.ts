import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest){
    const markets = await fetch("https://api.backpack.exchange/api/v1/tickers",{
        next : {revalidate:3600}
    }) 
    const data = await markets.json()
    const filtered = data.filter((a:any)=>{
           return  a.symbol.endsWith("USDC") 
    })
     
     return NextResponse.json(filtered)
}
import axios from "axios";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest,context :any){
    const param= await context.params
    const market = param.market
    try{
        const res = await axios(`https://api.backpack.exchange/api/v1/trades?symbol=${market}`)
            return NextResponse.json(res.data)
    }catch(err : any){
    return NextResponse.json({error : err.message} )
    }

 }
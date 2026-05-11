import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req :NextRequest, context :any) {
    const params= await context.params
    const market = params.market
  try {
    const res = await axios(
     `https://api.backpack.exchange/api/v1/depth?symbol=${market}&limit=50`
    );
    return NextResponse.json(res.data);
  } catch (err: any) {

    return NextResponse.json({ error: err.message, status: "500" });
  }
}
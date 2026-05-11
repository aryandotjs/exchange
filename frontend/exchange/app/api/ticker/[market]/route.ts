import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req :NextRequest, context :any) {
    const params= await context.params
    const market = params.market
  try {
    const res = await axios(
      `https://api.backpack.exchange/api/v1/ticker?symbol=${market}`
    );
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message, status: "500" });
  }
}

export const COIN_NAMES: any = {
  BTC: "Bitcoin",
  ETH: "Ethereum", 
  SOL: "Solana",
  DOGE: "Dogecoin",
  SHIB: "Shiba Inu",
  USDT: "Tether",
  AAVE: "Aave",
  LINK: "Chainlink",
  UNI: "Uniswap",
  LDO: "Lido DAO",
  RENDER: "Render",
  PEPE: "Pepe",
  ONDO: "Ondo",
  PYTH: "Pyth Network",
  SEI: "Sei",
  SUI: "Sui",
  STRK: "Starknet",
  ZRO: "LayerZero",
  POL: "Polygon",
  APT: "Aptos",
  BONK: "Bonk",
  BOME: "Book of Meme",
  JTO: "Jito",
  JUP: "Jupiter",
  RAY: "Raydium",
  KMNO: "Kamino",
  DRIFT: "Drift",
  WIF: "dogwifhat",
  WEN: "Wen",
  PENGU: "Pudgy Penguins",
  ENA: "Ethena",
  IO: "io.net",
};


export const COINGECKO_IDS: Record<string, string> = {
  "0G": "zero-gravity",
  "2Z": "zeta",
  APT: "aptos",
  BLUE: "bluefin",
  BNB: "binancecoin",
  BOME: "book-of-meme",
  BONK: "bonk",
  BTC: "bitcoin",
  CLOUD: "cloud",
  DOGE: "dogecoin",
  DRIFT: "drift-protocol",
  ENA: "ethena",
  ES: "escoin-token",
  ETH: "ethereum",
  HYPE: "hyperliquid",
  IO: "io",
  JTO: "jito-governance-token",
  JUP: "jupiter",
  KMNO: "kamino",
  LINK: "chainlink",
  MET: "metis-token",
  MON: "mon-protocol",
  ONDO: "ondo-finance",
  PENGU: "pudgy-penguins",
  PEPE: "pepe",
  PIPE: "pipe",
  POL: "polygon-ecosystem-token",
  PUMP: "pump-fun",
  PYTH: "pyth-network",
  RAY: "raydium",
  RENDER: "render-token",
  SEI: "sei-network",
  SHIB: "shiba-inu",
  SOL: "solana",
  SONIC: "sonic",
  STABLE: "stablecoin",
  STRK: "starknet",
  SUI: "sui",
  SWTCH: "switch-token",
  TRUMP: "official-trump",
  UNI: "uniswap",
  USDT: "tether",
  WEN: "wen-4",
  WIF: "dogwifcoin",
  WLFI: "world-liberty-financial",
  W: "wormhole",
  XPL: "plasma",
  XRP: "ripple",
  ZRO: "layerzero"
};

import { count } from "console";
import { NextResponse } from "next/server";

let cache : any = null; 
const lastime = Date.now()/1000
export async function GET() {
const now = Date.now()/1000
   if (cache && now-lastime < (60*120)) {
        return NextResponse.json(cache)
   }
   try{
 const markets = await fetch("https://api.backpack.exchange/api/v1/tickers")
 const allmarkets = await markets.json()
 let cid = []
  for(const a of allmarkets){
  const sym = a.symbol.replace("_USDC","")
  if (sym.endsWith("PERP")) {
     continue
  }
     if (COINGECKO_IDS[sym]) {
        cid.push(COINGECKO_IDS[sym])
        continue 
     }
     cid.push(sym.toLowerCase())
 }
 const marketcap = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cid.join(",")}&vs_currencies=usd&include_market_cap=true`,{next :{revalidate: 3600}})
 const mc = await marketcap.json()
 cache = mc 
 return NextResponse.json(mc)
   }catch(err){
      return NextResponse.json({hf : "hulululu"})
   }

}
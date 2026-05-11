
import axios from "axios";
import { Depthtype, Klines, Ticker } from "./types";
import { url } from "inspector";




const baseUrl = "/api/";

export async function getTicker(market: string): Promise<Ticker> {
  const ticker = await axios.get(`${baseUrl}ticker/${market}`);
  if (!ticker) {
    throw new Error(`cant find ticker for ${market}`);
  }
  return ticker.data;
}
export async function getMultipleTickers(markets: string[]) {
  const results = await Promise.all(
    markets.map((m) => getTicker(m))
  );

  const prices: any = {};

  results.forEach((data, i) => {
    prices[markets[i]] = data.lastPrice;
  });

  return prices;
}
export async function getDepth(market: string): Promise<Depthtype> {

  const depth = await axios.get(`${baseUrl}depth/${market}`);
  if (!depth) {
    throw new Error(`cant find ticker for ${market}`);
  }
  return depth.data;
}

export async function getKlines(market: string , interval :any ): Promise<Klines> {
  const depth = await axios.get(`${baseUrl}kline/${market}?interval=${interval}`);
  if (!depth) {
    throw new Error(`cant find ticker for ${market}`);
  }
  return depth.data;
}

export async function getMarketCap() {
  const marketcap = await axios.get(`${baseUrl}getmarketcap`);
  if (!marketcap) {
    throw new Error(`cant find ticker for `);
  }
  return marketcap.data;
}

export async function getTrades(market: string) {
  const alltrades = await axios.get(`${baseUrl}trades/${market}`);
  if (!alltrades) {
    throw new Error(`cant find ticker for `);
  }
  return alltrades.data;
}



export async function getKlineDataForMiniGraph() {
  const alltrades = await axios.get(`/api/klineforminigraph`)
  if (!alltrades) {
    throw new Error(`cant find ticker for `);
  }
  return alltrades.data;
}

export async function getSpotMarket() {
  const markets : any =await axios.get(`${baseUrl}getspotmarkets`);
  if (!markets) {
    throw new Error(`cant find ticker for `);
  }
  return markets.data;
}

export async function getUserBalance(){
     const token = localStorage.getItem("token")
     const userbalance = await axios.get( "http://localhost:3001/api/v1/getbalance/userBalance" , {
       headers : {
         Authorization : `Bearer ${token}`
       }
     })
     return userbalance.data
}

export async function addOrder(market:string, price: string, quantity : string , side : string  ){
      const token = localStorage.getItem("token")
    try{

      const response = await axios.post("http://localhost:3001/api/v1/orders/createOrder", 
            {
            market ,
            price,
            quantity ,
            side  
      },{
        headers : {
              Authorization : `Bearer ${token}`
            }
      }
      )
      return response.data
    }catch(err:any){
       return err.response?.data;
    } 

}

export async function getUserOpenOrders(){
      const token = localStorage.getItem("token")
    const response = await axios.get("http://localhost:3001/api/v1/orders/openOrder",{
      params : {
        market :"All"
      },
      headers : {
         Authorization : `Bearer ${token}`
       }
    })
    return response.data
}

export async function cancleOrder(orderId : string,userId : string , market : string){
   const response = await axios.delete("http://localhost:3001/api/v1/orders/cancleOrder",{
      data : {
         orderId ,
         userId ,
          market
      }
   })
   return response.data
}

export async function orderHistory(){
      const token = localStorage.getItem("token")

   const response = await axios.get("http://localhost:3001/api/v1/orders/orderHistory",{
       headers : {
         Authorization : `Bearer ${token}`
       }
   })
   return response.data
}
export async function tradeHistory(){
      const token = localStorage.getItem("token")

   const response = await axios.get("http://localhost:3001/api/v1/orders/tradeHistory",{
       headers : {
         Authorization : `Bearer ${token}`
       }
   })
   return response.data
}



export async function handleAuth(data:any,mode:any) {
  try{
      if(mode == "signup"){
        if (data.email == "" || data.password == "" || data.username == "") return { msg : "inter valid inputs"}
        const response = await axios.post("http://localhost:3001/api/v1/auth/signup",{
          username : data.username ,
          email : data.email,
          password : data.password
        })
        if (response.data.token) {
          localStorage.setItem("token",response.data.token)
        }
        return  {
          msg : response.data.msg
        }
      }

      if (data.email == "" || data.password == "") return { msg : "inter valid inputs"}
      const response = await axios.post("http://localhost:3001/api/v1/auth/signin",{
          email : data.email,
          password : data.password
        })
        if (response.data.token) {
          localStorage.setItem("token",response.data.token)
        }
        return {
          msg : response.data.msg
        } 
      }catch(err :any){
         return err.response.data
      }

}

export async function getme(){
      const token = localStorage.getItem("token")
    const response = await axios.get("http://localhost:3001/api/v1/auth/me",{
      headers : {
         Authorization : `Bearer ${token}`
       }
    })
    return response.data
}

export async function tradesformarket(market:string){
    
  const response =await axios.get("http://localhost:3001/api/v1/trades",{
     params : { 
       market
     }
  })
  
  return response.data
}


export async function getKlinefromDb(market:string ,interval:string){
  const response = await axios.get("http://localhost:3001/api/v1/kline",{
    params : {
       market,
      interval
    }
  })
  return response.data
}

export async function getDepthFromEngine(market:string){
  const response = await axios.get("http://localhost:3001/api/v1/depth",{
    params : {
       market,
    }
  })
  return response.data
}

export async function getTickerFromDb(market:string){
  const response = await axios.get("http://localhost:3001/api/v1/ticker",{
    params : {
       market,
    }
  })
  return response.data
}
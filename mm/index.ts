import axios from "axios";
import jwt  from "jsonwebtoken";
import "dotenv/config"
const BASE_URL = "http://localhost:3001";
const totalasks = 50 ;
const totalbids = 50 ;
let userid  = 1;
let jwttoken = jwt.sign({userId : userid}, process.env.JWT_SECRET || "" ,{expiresIn : "24h"})


let priceMap = new Map<string,number>()
let lastfetchtimeMap = new Map<string,number>()


async function main(market:string){
    try {
         await fetchPrice(market) 
        const response = await axios.get( `${BASE_URL}/api/v1/orders/openOrder`,{
            params : {
                market :"All"
            },
            headers : {
                Authorization : `Bearer ${jwttoken}`
            }
        })
        const marketOrders = response.data.openOrders.filter((a:any)=> a.market === market )

        const bidslength = marketOrders.filter((a:any)=> a.side === "buy" ).length 
        const asklength = marketOrders.filter((a:any)=> a.side === "sell" ).length


        let price =  priceMap.get(market) || 0 ;
        let removedbids = await removeBids(marketOrders , price , market) 
        let removedasks = await removeAsks(marketOrders , price , market) 


        let bidsToAdd = totalbids -  bidslength - removedbids ;
        let asksToAdd = totalasks - asklength - removedasks ;

        while(bidsToAdd > 0 || asksToAdd > 0){
            const a = Math.random()
            if (a < 0.02 && a > 0.018) {
                const quantity = (0.001+Math.random()/10).toFixed(3).toString()
                const offsset = Number(Math.random().toFixed(3))
            try{

                await axios.post( `${BASE_URL}/api/v1/orders/createOrder`,{
                market  : market,
                price :  price + offsset ,
                quantity  : quantity,
                side : "buy"  
                },{ headers : { Authorization : `Bearer ${jwttoken}`}})

                await axios.post( `${BASE_URL}/api/v1/orders/createOrder`,{
                market  : market,
                price :price - offsset ,
                quantity  : quantity,
                side : "sell"  
                },{ headers : { Authorization : `Bearer ${jwttoken}`}})
            }catch(err: any) {
                  console.log("TRADE ORDER ERROR:", err.response?.data || err.message);
            }

            }
            if (bidsToAdd > 0) {
                const res =await axios.post( `${BASE_URL}/api/v1/orders/createOrder`,{
                market  : market,
                price :  price - Math.random() * 10 ,
                quantity  : (0.001+Math.random()/10).toFixed(3).toString(),
                side : "buy"  
                },{ headers : { Authorization : `Bearer ${jwttoken}`}})
                bidsToAdd--
            }
            if (asksToAdd > 0) {
                const res =await axios.post( `${BASE_URL}/api/v1/orders/createOrder`,{
                market  : market,
                price :price +Math.random() * 10 ,
                quantity  : (0.001+Math.random()/10).toFixed(3).toString(),
                side : "sell"  
                },{ headers : { Authorization : `Bearer ${jwttoken}`}})
                asksToAdd--;
        }}
         
    }catch (err: any) {
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);
    }finally{
         setTimeout(() => {
         main(market);
    }, 500);
    }     
}

async function start(){
    await createUser()
    await main("BTC_USD")
    await main("SOL_USD")
    await main("ETH_USD")

}
start()

async function removeBids(openOrders : any[] , price : number , market : string) {
         const promises : any[] = [];
     openOrders.map(async (a:any)=>{
        if((a.side === "buy") && (Number(a.price)/1000 > price || Math.random() < 0.1)){
           promises.push( axios.delete(`${BASE_URL}/api/v1/orders/cancleOrder`,{
                data : {
                        orderId : a.orderId ,
                        userId  : userid ,
                        market  : market
                    }
                }))
            }
        })
        await Promise.allSettled(promises)    
        return promises.length;
}

async function removeAsks(openOrders : any[] , price : number, market : string) {
         const promises : any[] = [];
     openOrders.map(async (a:any)=>{
        if((a.side === "sell") && (Number(a.price)/1000 < price || Math.random() < 0.1)){
           promises.push(  axios.delete(`${BASE_URL}/api/v1/orders/cancleOrder`,{
                data : {
                        orderId : a.orderId ,
                        userId  : userid ,
                        market  : market
                    }
                }))
            }
        })
        await Promise.allSettled(promises)    
        return promises.length;
}

 async function createUser(){

    try {
        const response = await axios.post("http://localhost:3001/api/v1/auth/signup",{
            username : "aryan" ,
            email : "aryanlohar@gmail.com",
            password : "121212"
        })
        userid = response.data.user.userid
           jwttoken = jwt.sign({userId : userid}, process.env.JWT_SECRET || "",{expiresIn : "24h"})
   

        } catch (err: any) {
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
}}

async function fetchPrice(market:string) {
    let datenow = Date.now()
    let price = priceMap.get(market)
    let lasttime = lastfetchtimeMap.get(market) || 0 ;
    if (!price || datenow - lasttime > 1000*30 ) {
        const res = await axios(
            `https://api.backpack.exchange/api/v1/ticker?symbol=${market}C`
        );
        console.log("fetched market" ,market , Number(res.data.lastPrice))
        lastfetchtimeMap.set(market,datenow) 
        priceMap.set(market,Number(res.data.lastPrice)) 
        return Number(res.data.lastPrice)
    }
   return 
} 

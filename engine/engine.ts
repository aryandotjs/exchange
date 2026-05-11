import fs from "fs"

import { Fill, Order, OrderBook, userOpenOrders } from "./orderbook"
import { json } from "stream/consumers"
import { RedisManager } from "./redismanager"
import { MessageFromApi } from "./types"
import { data } from "react-router-dom"
import { timeStamp } from "console"
import { execArgv } from "process"

interface UserBalance  { 
    [ key : string] : {
         available : number,
         locked : number
    }
}
export class Engine{
    private OrderBooks : OrderBook[] = [] 
    private Balances : Map<string,UserBalance> = new Map()
    private userOpenOrders : Map<string, userOpenOrders[]> = new Map()

    constructor(){
     let snapshot = null
    try{
        snapshot = fs.readFileSync("./snapshot.json")
    }catch{
        console.log("no snapshot found")
    }

    if (snapshot) {
        let snapshotsnapshot = JSON.parse(snapshot.toString())
        this.OrderBooks = snapshotsnapshot.OrderBook.map((a : any)=>{ new OrderBook(a.baseAsset,a.Asks ,a.bids,a.crrprice,a.lastTradeId) })
        this.Balances =  new Map(snapshotsnapshot.Balances)

        console.log("updated data with the snapshot")
   
    }else{

        this.OrderBooks.push(new OrderBook("BTC",[],[],0,0))
        this.OrderBooks.push(new OrderBook("ETH",[],[],0,0))
        this.OrderBooks.push(new OrderBook("SOL",[],[],0,0))
        
        console.log("created new markets and pushed to orderbooks")
        // this.setBaseBalance()
    }

    
    // setInterval(()=>{
    //     this.takeSnapshots()
    // })
    }
    // Inside your Engine class
    
    takeSnapshots(){
        let snapshot  = {
            OrderBook : this.OrderBooks.map((a)=>{ return a.getSnapshot()}),
            Balances :  Array.from(this.Balances.entries()) 
        }
        fs.writeFileSync("./snapshot.json" ,JSON.stringify(snapshot))
    }
    async process({message , clientId} : { message : MessageFromApi , clientId :string }){
        const redis = await RedisManager.getInstance()
        switch ( message.type ){

            case "CREATE_ORDER" :{
                
                try{
                    
                    const  {executedQty , fills , orderId } = this.CreateOrder(message.data.market ,message.data.price , message.data.quantity , message.data.side ,message.data.userId)
                   await redis.sendToapi(clientId, {
                        type : "ORDER_PLACED",
                        payload: {
                            msg : "order created",
                            orderId,
                            executedQty: executedQty.toString(),
                            fills
                        }
                    })
                  
                }catch(e:any){
                    await redis.sendToapi(clientId, {
                        type : "ORDER_CREATING_FAILED",
                        payload: {
                            error : e.message || "failed to cancle order"
                    }})
                }   
                 
            break ;
            }    
            case "CANCEL_ORDER" :{
                try {
                    let executedQty ;
                    let cancleUserId = message.data.userId
                    let cancelMarket = message.data.market
                    let orderId = message.data.orderId
                    let baseAsset = cancelMarket.split("_")[0]
                    let quoteAsset = cancelMarket.split("_")[1]

                    let orderbook = this.OrderBooks.find((a)=> a.getTicker() == cancelMarket)
                    if (!orderbook) throw new Error("market not found")
                    let order = orderbook.Asks.find((a)=> a.orderId == orderId ) ||  orderbook.Bids.find((a)=> a.orderId == orderId )
                    if (!order) throw new Error("order not found ")
                    if(cancleUserId !== order.userId) throw new Error("Unauthorized : this is not your order ")
                            
                    let user =  this.Balances.get(order.userId);
                    if(!user) throw new Error("user account not found")
                    if (order.side == "buy") {
                             executedQty = orderbook.cancleBid(order)
                            if (executedQty !== null) {
                                user[quoteAsset].available = user[quoteAsset].available + ((order.quantity - order.filled)* order.price )/1000
                                user[quoteAsset].locked = user[quoteAsset].locked - ((order.quantity - order.filled)* order.price )/1000
                            }else{
                                throw new Error("Cancle failed : order dose not exist ") 
                            }

                    }
                    else{
                            executedQty = orderbook.cancleAsk(order)
                            if (executedQty !== null) {
                                user[baseAsset].available = user[baseAsset].available + (order.quantity - order.filled) 
                                user[baseAsset].locked = user[baseAsset].locked - (order.quantity - order.filled) 
                            }else{
                                throw new Error("Cancle failed : order dose not exist ") 
                            }
                        
                        }

                    const Openorders = this.userOpenOrders.get(cancleUserId)
                    const updatedOrders = Openorders?.filter(a => a.orderId !== orderId) || []
                    this.userOpenOrders.set(cancleUserId,updatedOrders)
                    this.publishDepthUpdatesInWsOnCancle((order.price).toString(),cancelMarket)
            
                    redis.sendToapi(clientId , {
                        type : "ORDER_CANCELLED",
                        payload : {
                            msg : "order cancelled",
                            orderId ,
                            executedQty : executedQty.toString() ,
                            remainingQty : "0"
                    }})  
                    
                    redis.pushMessages({
                        type : "CANCEL_ORDER",
                        data : {
                            orderId  
                        }
                    })

                }catch (error:any) {
                       redis.sendToapi(clientId , {
                        type : "ORDER_CANCELING_FAILED",
                        payload : {
                            error : error.message || "order didnt cancel"
                        }})  
                } 
            break;
            }
            case "ON_RAMP" :{
                let user = message.data.userId
                let amount = message.data.amount
                let asset = message.data.asset
                this.onRamp(user,amount,asset);
                break ;  
            }
            case "GET_DEPTH": {
                try{
                    let market = message.data.market
                    let orderbook = this.OrderBooks.find((a)=>{ return a.getTicker() == market })
                    if (!orderbook) throw new Error("market not found ")
                    let {asks , bids} = orderbook.getDepth()
                    redis.sendToapi(clientId,{
                    type : "DEPTH",
                    payload : {
                           asks,
                           bids
                    }
                    })

                }catch(err:any){
                    redis.sendToapi(clientId,{
                    type : "DEPTH_FAILED",
                    payload : {
                          error : err.message || "didnt find depth"
                    }
                    })
                } 
                break ;
            }
            case "GET_OPEN_ORDERS":{
                let { userId , market} = message.data;
                try{
                    const Openorders =  this.userOpenOrders.get(userId) || [];
                    if (market == "All") {
                        redis.sendToapi(clientId,{
                         type : "OPEN_ORDERS",
                         payload : {
                            openOrders : Openorders
                        }
                    })}
                    // const marketOrders = Openorders.filter(a => a.market == market)   
                    // redis.sendToapi(userId,{
                    //     type : "OPEN_ORDERS",
                    //     payload : {
                    //         openOrders : marketOrders
                    //     }
                    // })
                }catch(e:any){
                    redis.sendToapi(clientId,{
                        type : "OPEN_ORDERS_ERROR",
                        payload : {
                            error :  e.message || "no open order found "
                        }
                    })
                }
                break;
            }
            case "GET_USER_BALANCE" : {
                try{

                    const {userId} =  message.data
                    const response = this.getUserBalance(userId)
                    if (!response) throw new Error("invalid userId") 
                    redis.sendToapi( clientId , {
                        type : "GET_USER_BALANCE",
                        payload : {
                            userbalance : response ,
                           userId 
                        }
                    })
                }catch(err :any){
                       redis.sendToapi(clientId,{
                        type : "USER_BALANCE_ERR",
                        payload : {
                            err :  err.message || "balance not found"
                        }
                    })
                }
                  
            }
        }  
      
    }
   
    CreateOrder(market : string , price : string , quantity : string , side : "buy" | "sell" , userid : string ){
        const baseAsset =  market.split("_")[0]
        const quoteAsset = market.split("_")[1]
        const orderbook = this.OrderBooks.find((a)=> a.baseAsset == baseAsset)
        if(!orderbook) throw new Error("dont support this market")
        this.CheckAndLockFund(baseAsset , quoteAsset, userid  , price , quantity ,side )
        
        const order : Order = {
                price: Number(price),
                quantity: Number(quantity),
                orderId: Math.random().toString().substring(2,15),
                filled: 0,
                side ,
                userId: userid     
        }
        const { fills  , executedQty  } = orderbook.addOrder(order)
        
        if (executedQty < Number(quantity)) {
           const orders = this.userOpenOrders.get(userid) || [] ;
           this.userOpenOrders.set(userid,[...orders,{...order, filled : executedQty , market}])
        }
        
        fills.forEach((a)=>{
            this.UpdateUserTakerOrder(a.otherUserId, a.makerOrderId , a.qty)
        })

        this.UpdateBalance(userid,baseAsset,quoteAsset,side,fills,executedQty,price);

        this.updateOrderDb(order ,fills , market, executedQty )
        this.createDbTrades(fills , market , side ,userid)
        this.publishWsTrades(market,fills,userid ,side);
        this.publishDepthUpdatesInWs(price,market,fills,side)

        return { executedQty , fills  , orderId : order.orderId  }
    } 
     
    UpdateUserTakerOrder(otherUserId : string , otherOrderId : string , qty : number){
        const orders = this.userOpenOrders.get(otherUserId)
        if (!orders) return ; 
         
        const UpdatedOrders = orders.map((a)=>{
            if (a.orderId == otherOrderId) {
                return {...a, filled : a.filled + qty} 
            }
            return a ;
         }).filter(a=>  a.filled < a.quantity ) 

        this.userOpenOrders.set(otherUserId,UpdatedOrders)
    } 

    async updateOrderDb( order : Order , fills : Fill[] , market : string , executedQty : number){
         let redis = await RedisManager.getInstance();

         redis.pushMessages({
             type : "CREATE_ORDER",
             data : { 
                    orderId : order.orderId,
                    userId : order.userId ,
                    executedQty,
                    market ,
                    side  : order.side ,
                    quantity  : order.quantity.toString(),
                    price  : order.price.toString() ,
             }
         })

         fills.forEach( fill =>{ 
             redis.pushMessages({
                type : "UPDATE_ORDER",
                data : {
                     orderId : fill.makerOrderId ,
                     executedQty : fill.qty.toString() 
                }
             })
         })
    }   
    async createDbTrades(fills : Fill[] , market : string , side :string , userid :string){
          const redis = await RedisManager.getInstance() ;
         fills.forEach(f => {
              redis.pushMessages({
                  type : "TRADE_ADDED",
                  data : {
                        market,
                        id : f.tradeId.toString(),
                        takerId : userid ,
                        makerId : f.otherUserId ,
                        isBuyerMaker : side == "sell",
                        price : (Number(f.price)/1000).toString() ,
                        quantity : (f.qty/1000).toString() ,
                        quoteQuantity : ((f.qty/1000) * Number(f.price)).toString(),
                        timestamp : Date.now(),
                        tradeId : f.tradeId
                  }
              })
         })
    }
    
    CheckAndLockFund(baseAsset : string , quoteAsset : string , userId : string , price : string , quantity : string , side : "buy" | "sell"){ 

        const UserBalance  = this.Balances.get(userId)
        if(!UserBalance) throw new Error("user not found ")
        const amount = Number(quantity) 
        const rate = Number(price)
        if (side === "buy") {
            let totalCost = amount*rate/1000 
            if ( UserBalance[quoteAsset].available < totalCost  ) {
                throw new Error("insufficient balance : quoteAsset")
            }

            UserBalance[quoteAsset].available -= totalCost
            UserBalance[quoteAsset].locked += totalCost

        }else{

            if ( UserBalance[baseAsset].available < amount ) {
                throw new Error("insufficient balance : baseAsset")
            }

            UserBalance[baseAsset].available -= amount
            UserBalance[baseAsset].locked += amount
        }
   }

    UpdateBalance(userid : string ,baseAsset :string ,quoteAsset: string,side : "buy"|"sell",fills : Fill[],executedQty : number , price :string){
       
        if (side == "buy") {
            
            fills.forEach((fill)=>{
                let otheruser =  this.Balances.get(fill.otherUserId)
                let user =  this.Balances.get(userid)
                if (!otheruser) throw new Error("other User dont exist") 
                if (!user) throw new Error("User dont exist") 

                otheruser[baseAsset].locked =  otheruser[baseAsset].locked -  fill.qty
                otheruser[quoteAsset].available =  otheruser[quoteAsset].available + (Number(fill.price) * fill.qty)/1000
                
                user[baseAsset].available =  user[baseAsset].available + fill.qty
                user[quoteAsset].locked =  user[quoteAsset].locked - (Number(price)*fill.qty)/1000

                user[quoteAsset].available =  user[quoteAsset].available + (fill.qty* (Number(price) - Number(fill.price)))/1000
            })
                
        }else{
            
            fills.forEach((fill)=>{
                
                let otheruser =  this.Balances.get(fill.otherUserId)
                let user =  this.Balances.get(userid)
                
                if (!otheruser) throw new Error("other User dont exist") 
                if (!user) throw new Error("User dont exist") 
                
                user[baseAsset].locked =  user[baseAsset].locked -  fill.qty
                user[quoteAsset].available =  user[quoteAsset].available + (Number(fill.price) * fill.qty)/1000

                otheruser[quoteAsset].locked =  otheruser[quoteAsset].locked - (Number(fill.price) * fill.qty)/1000
                otheruser[baseAsset].available =  otheruser[baseAsset].available +  fill.qty

            })

        }

    }
    
    onRamp(userId :string , balance :string , asset :string){
        let user = this.Balances.get(userId)
        if (!user) {
            if (userId == "1") {
                this.Balances.set(userId, {
                "USD" : {
                    available : 1000000000 ,
                    locked : 0
                },
                "USDT" : {
                    available : 10000000 ,
                    locked : 0
                },
                "SOL" : {
                    available : 10000000 ,
                    locked : 0
                },
                "BTC" : {
                    available : 100000 ,
                    locked : 0
                },
                "ETH" : {
                    available : 300000 ,
                    locked : 0
                },
            } )
            return ; 
            }
            this.Balances.set(userId, {
                "USD" : {
                    available : 10000000 ,
                    locked : 0
                },
                "USDT" : {
                    available : 10000000 ,
                    locked : 0
                },
                "SOL" : {
                    available : 100000 ,
                    locked : 0
                },
                "BTC" : {
                    available : 10000 ,
                    locked : 0
                },
                "ETH" : {
                    available : 30000 ,
                    locked : 0
                },
            } )
            user = this.Balances.get(userId)
            console.log(user)
        }
        if(user && user[asset]) {
            user[asset].available =  Number(user[asset].available) +  Number(balance)
        }
        
    }
    setBaseBalance(){
       this.Balances.set("1",{
        [ "SOL" ]: { available : 100 , locked : 0},
        [ "BTC" ]: { available : 10 , locked : 0},
        [ "ETH" ]: { available : 50 , locked : 0},
        [ "USDC" ]: { available : 10000 , locked : 0},
       })
        this.Balances.set("1",{
        [ "SOL" ]: { available : 100 , locked : 0},
        [ "BTC" ]: { available : 10 , locked : 0},
        [ "ETH" ]: { available : 50 , locked : 0},
        [ "USDC" ]: { available : 10000 , locked : 0},
       })
        this.Balances.set("1",{
        [ "SOL" ]: { available : 100 , locked : 0},
        [ "BTC" ]: { available : 10 , locked : 0},
        [ "ETH" ]: { available : 50 , locked : 0},
        [ "USDC" ]: { available : 10000 , locked : 0},
       }) 
        this.Balances.set("1",{
        [ "SOL" ]: { available : 100 , locked : 0},
        [ "BTC" ]: { available : 10 , locked : 0},
        [ "ETH" ]: { available : 50 , locked : 0},
        [ "USDC" ]: { available : 10000 , locked : 0},
       })
       
    }

    async publishWsTrades(market :string , fills : Fill[] , userId :string ,side : string){
        let redis = await RedisManager.getInstance();
        fills.forEach( (fill) => {
            redis.publishMessages(`trade@${market}`, {
                stream :`trade@${market}`,
                data : { 
                     e : "trade" ,
                     t : fill.tradeId,
                     m : `${ side == "buy" ? "false" : "true"}` ,
                     p : (Number(fill.price)/1000).toString(),
                     q : (Number(fill.qty)/1000).toString(),
                     s : market,
                     T : Date.now()
                }
            }
        )})
    }
    async publishDepthUpdatesInWs(price : string , market :string , fills : Fill[] ,side :string) {
        let redis = await RedisManager.getInstance();
        let orderbook  = this.OrderBooks.find( (a) => {
            return a.getTicker() == market
        })
        if (!orderbook) {
            return 
        }
        let updatedBidsDepth  ;
        let updatedAsksDepth  ;
        const depth = orderbook.getDepth()
        const priceString = (Number(price)/1000).toString()
        
        if (side == "buy") {
            updatedBidsDepth = depth.bids.find( a => a[0] === priceString)
        }if (side == "sell") {
            updatedAsksDepth = depth.asks.find( a => a[0] === priceString)
        }
            redis.publishMessages(`depth@${market}`, {
            stream : `depth@${market}`,
            data : {
                a :  [updatedAsksDepth] ,
                b :  [updatedBidsDepth] ,
                e : "depth"
            }
        })
        
        fills.forEach((fill: Fill) => {

            const fillprice = (Number(fill.price) / 1000).toString();

            let askUpdate: [string, string][] = [];
            let bidUpdate: [string, string][] = [];

            if (side === "buy") {
            const level = depth.asks.find(a => a[0] === fillprice);

            askUpdate = level
                ? [level]
                : [[fillprice, "0"]];
            }

            if (side === "sell") {
            const level = depth.bids.find(a => a[0] === fillprice);

            bidUpdate = level
                ? [level]
                : [[fillprice, "0"]];
            }

            redis.publishMessages(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: askUpdate,
                b: bidUpdate,
                e: "depth",
            },
            });
});
        
    }
    
    async publishDepthUpdatesInWsOnCancle(price:string,market:string) {
        const redis = await RedisManager.getInstance()
         const orderbook = this.OrderBooks.find( a => a.getTicker() == market)
         if (!orderbook) {
            return;
         }
        let updatedBidsDepth  ;
        let updatedAsksDepth  ;
        const depth = orderbook.getDepth()
        const priceString = (Number(price)/1000).toString()

        updatedBidsDepth = depth.bids.find( a => a[0] === priceString)
        updatedAsksDepth = depth.asks.find( a => a[0] === priceString)
        
         redis.publishMessages(`depth@${market}`, {
            stream : `depth@${market}`,
            data : {
                a : updatedAsksDepth ? [updatedAsksDepth] : [[priceString , "0" ]] ,
                b : updatedBidsDepth ? [updatedBidsDepth] : [[priceString , "0" ]],
                e : "depth"
            }
        })
    }

    getUserBalance(userId : string){
          const usersbalance = this.Balances.get(userId)
          return usersbalance ;
    }
   
}


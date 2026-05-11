import strict from "assert/strict";

export interface Order{
    price : number ,
    quantity : number,
    orderId :  string,
    filled : number,
    side : "buy" | "sell" ,
    userId  : string
}
export interface userOpenOrders extends Order{
 market : string 
}
export interface Fill{
    price : string ,
    qty : number,
    tradeId : number,
    otherUserId : string,
    makerOrderId :string
}

export class OrderBook{
    Asks : Order[] = []
    Bids : Order[] = []
    baseAsset :string;
    quoteAsset :string = "USD"
    lastTradeId : number ;
    currentPrice : number

    constructor(baseasset : string , asks : Order[], bids : Order[] , lastTradeId : number , crrprice :number){
        this.baseAsset = baseasset
        this.Asks = asks,
        this.Bids = bids,
        this.lastTradeId = lastTradeId || 0
        this.currentPrice = crrprice || 0

    }
    getSnapshot(){
    return {
        baseAsset : this.baseAsset,
        ask : this.Asks,
        bids : this.Bids ,
        currentPrice : this.currentPrice,
        lastTradeId : this.lastTradeId,
    }
    }
    getTicker(){
        return `${this.baseAsset}_${this.quoteAsset}`
    }
    
    addOrder(order:Order){
    
        if(order.side == "sell"){
        const { fills , executedQty} = this.matchmyAsk(order)
        order.filled = executedQty
        if ( order.quantity == executedQty) {
            return {
                fills , executedQty
            }
        }
        this.Asks.push(order)
        this.Asks.sort((a,b)=> a.price - b.price )
        return { fills , executedQty }
        
        }
        else{
        const { fills , executedQty} = this.matchmyBid(order)
        order.filled = executedQty
        if ( order.quantity == executedQty) {
            return {fills , executedQty }
        }

        this.Bids.push(order)
        this.Bids.sort((a,b)=> b.price - a.price )
        
        return {
            fills,executedQty
        }
        }
    }
    
    matchmyAsk(sellOrder :Order) : { fills :Fill[] , executedQty:number }{
    const fills : Fill[] = [];
    let executedQty : number = 0;
    for (let i = 0; i < this.Bids.length; i++) {
        if( sellOrder.price <= this.Bids[i].price  &&  executedQty < sellOrder.quantity ){
            let filledqty = Math.min(( sellOrder.quantity - executedQty) , (this.Bids[i].quantity - this.Bids[i].filled) ) 
            executedQty += filledqty;
            this.Bids[i].filled += filledqty
                
            
            fills.push({
                    price :this.Bids[i].price.toString(),
                    qty : filledqty ,
                    tradeId : this.lastTradeId++,
                    otherUserId :  this.Bids[i].userId,
                    makerOrderId : this.Bids[i].orderId
            })
        }
    }
    for (let i = 0; i < this.Bids.length; i++) {
        if (this.Bids[i].filled === this.Bids[i].quantity ) {
            this.Bids.splice(i,1)
            i--
        } 
    }
    return { fills , executedQty }
    }

    matchmyBid(Buyorder : Order) : {fills : Fill[], executedQty :number}{
        const fills : Fill[] = [] ; 
        let executedQty : number = 0;
    for (let i = 0; i < this.Asks.length; i++) {
        if(this.Asks[i].price <= Buyorder.price && executedQty < Buyorder.quantity){
                let filledqty = Math.min( ( Buyorder.quantity- executedQty), (this.Asks[i].quantity - this.Asks[i].filled))

                executedQty += filledqty    
                this.Asks[i].filled += filledqty  
            

                fills.push({
                price : this.Asks[i].price.toString() ,
                qty : filledqty,
                tradeId : this.lastTradeId++,
                otherUserId : this.Asks[i].userId, 
                makerOrderId : this.Asks[i].orderId
                })
        }
    }
    for (let i = 0; i < this.Asks.length; i++) {
        if (this.Asks[i].filled == this.Asks[i].quantity ) {
                this.Asks.splice(i,1);
                i--;
        }           
    }
    return {
            fills ,
            executedQty
    }
    }

    ticker(){
    return `${this.baseAsset}_${this.quoteAsset}`
    }

    getDepth(){
        let BidsArray : [string, string][]= [];
        let AskArray : [string, string][] = [];

        let BidsObject : { [key : string] : number} = {}
        let AskObject : { [key : string] : number} = {}

        this.Bids.forEach((a)=>{
             if (!BidsObject[a.price]) {
                 BidsObject[a.price] = 0
             }
             BidsObject[a.price] += a.quantity -a.filled
        })
        this.Asks.forEach((a)=>{
             if (!AskObject[a.price]) {
                 AskObject[a.price] = 0
             }
             AskObject[a.price] += a.quantity -a.filled
        })
        for (const Bidprice in BidsObject ){
             BidsArray.push([ (Number(Bidprice)/1000).toString() , (BidsObject[Bidprice]/1000).toString()])
        }
        for (const askPrice in AskObject){
             AskArray.push([(Number(askPrice)/1000).toString(), (AskObject[askPrice]/1000).toString()])
        }
        BidsArray.sort((a,b) => Number(b[0]) - Number(a[0]) )
        AskArray.sort((a,b) => Number(a[0]) - Number(b[0]) )

        return  {
            bids : BidsArray,
            asks : AskArray 
        }
    }

    getOpenOrder(userId : string ): Order[]{
        let Bids = this.Bids.filter((a)=> a.userId == userId )
        let Asks = this.Asks.filter((a)=> a.userId == userId )
           return [...Bids, ...Asks]
    }

    

    cancleBid(order : Order){
    const index = this.Bids.findIndex((a)=> a.orderId == order.orderId )
    if (index === -1)  return null ;
        const executedQty = this.Bids[index].filled
        this.Bids.splice(index,1);
        return  executedQty;

    }

    cancleAsk(order : Order){
    const index = this.Asks.findIndex((a)=> a.orderId == order.orderId )
    if (index === -1) return null ;
        const executedQty = this.Asks[index].filled
        this.Asks.splice(index,1);
        return executedQty;

    }
}

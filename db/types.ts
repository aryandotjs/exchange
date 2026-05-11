export type DbMessage = {
    type: "TRADE_ADDED",
    data: {
        id: string,
        makerId : string ;
        takerId : string ;
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
        tradeId : number
    }
} | {
    type: "CREATE_ORDER",
    data: {
        orderId: string,
        userId : string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell",
    }
} |{
    type : "UPDATE_ORDER",
    data : {
            orderId : string,
            executedQty : string
    } 
} |  {
    type : "CANCEL_ORDER",
    data : {
        orderId : string
    }
}
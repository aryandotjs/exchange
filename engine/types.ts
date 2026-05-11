import { Fill, Order } from "./orderbook"

const CREATE_ORDER = "CREATE_ORDER"
const CANCEL_ORDER = "CANCEL_ORDER"
const ON_RAMP = "ON_RAMP"
const GET_DEPTH = "GET_DEPTH"
const GET_OPEN_ORDERS = "GET_OPEN_ORDERS"
const GET_USER_BALANCE = "GET_USER_BALANCE"

export type  MessageFromApi = {
        type : typeof CREATE_ORDER ,
        data : {
        price : string,
        quantity : string,
        side : "buy"| "sell",
        userId : string,
        market :string,
        }
} | {
        type : typeof CANCEL_ORDER ,
        data : {
            orderId: string ,
            userId : string,
            market :string,
         }
} | {
        type : typeof ON_RAMP ,
        data :  {
            userId : string ,
            amount : string,
            asset : string
        }  
} | {
        type : typeof GET_DEPTH ,
        data : {
            market : string ,
        }
} | {
        type : typeof GET_OPEN_ORDERS ,
        data : {
             userId : string,
             market : string
        }
} | {
    type : typeof GET_USER_BALANCE,
    data : {
         userId : string ,
    }
}





export type MessageToApi = {
        type : "ORDER_PLACED" ,
        payload : {
            msg : string ,
            orderId : string,
            executedQty : string ,
            fills : Fill[] | []
        }
} | {
        type : "ORDER_CANCELLED",
        payload : {
            msg : string ,
            orderId: string ,
            executedQty : string,
            remainingQty :string,
         }
}| {
        type : "ORDER_CANCELING_FAILED",
        payload : {
            error : Error
         }
} | {
        type : "ORDER_CREATING_FAILED",
        payload : {
            error : Error
         }
} | {
        type : "DEPTH" ,
        payload : {
            asks : [string,string][],
            bids : [string,string][]
        }
}  | {
        type : "DEPTH_FAILED" ,
        payload : {
             error : string
        }
} | {
        type : "OPEN_ORDERS" ,
        payload : {
            openOrders : Order[]
        }
}| {
        type : "OPEN_ORDERS_ERROR" ,
        payload : {
            error : string
        }
}| {
    type : "GET_USER_BALANCE",
    payload : {
         userbalance : any
         userId : string ,
    }
}| {
    type : "USER_BALANCE_ERR",
    payload : {
         err : string,
    }
}

export type DbMessage = {
    type: "TRADE_ADDED",
    data: {
        id: string,
        isBuyerMaker: boolean,
        takerId : string, 
        makerId :string,
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
} | {
    type : "UPDATE_ORDER",
    data : {
            orderId : string,
            executedQty : string
    } 
} | {
    type : "CANCEL_ORDER",
    data : {
        orderId : string
    }
}
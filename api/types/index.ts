
export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";
export const ON_RAMP = "ON_RAMP";

export const GET_DEPTH = "GET_DEPTH";
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";
export const GET_USER_BALANCE = "GET_USER_BALANCE";


export type MessageToEngine = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string
    }
} | {
    type: typeof CANCEL_ORDER,
    data: {
        orderId: string,
        market: string,
    }
} | {
    type: typeof ON_RAMP,
    data: {
        amount: string,
        userId: string,
        txnId: string
    }
} | {
    type: typeof GET_DEPTH,
    data: {
        market: string,
    }
} | {
    type: typeof GET_OPEN_ORDERS,
    data: {
        userId: string,
        market: string,
    }
} | { type : typeof GET_USER_BALANCE,
    data : {
         userId : string ,
    }}

export const ORDER_PLACED = "ORDER_PLACED";
export const ORDER_CANCELLED = "ORDER_CANCELLED";

export const DEPTH = "DEPTH";
export const OPEN_ORDERS = "OPEN_ORDERS";

export type MessageFromOrderbook = {
    type: typeof ORDER_PLACED,
    payload: {
        orderId : string,
        executedQty : number,
        fills : {
            price : string ,
            qty : string,
            tradeId : number 
        }
    }
} | {
    type: typeof ORDER_CANCELLED,
    payload: {
        orderId: string,
        executedQty : string ,
        remainingQty :string
    }
} | {
    type: typeof ON_RAMP,
    payload: {
        amount: string,
        userId: string,
        txnId: string
    }
} | {
    type: typeof DEPTH,
    payload: {
        asks : [string,string][],
        bids : [string,string][]
    }
} | {
    type: typeof OPEN_ORDERS,
    payload : {
        openOrders : [];
    }
}
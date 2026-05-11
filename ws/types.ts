
export type SUBSCRIBE = "SUBSCRIBE";
export type UNSUBSCRIBE = "UNSUBSCRIBE";

export type SubscribeMessage = {
     type : SUBSCRIBE ,
     params : []
}

export type UnsubscribeMessage = {
     type : UNSUBSCRIBE ,
     params : []
}

export type IncomingMessages = SubscribeMessage | UnsubscribeMessage;
import { WebSocket } from "ws";
import { IncomingMessages } from "./types";
import { emit } from "node:cluster";
import { SubscriptionManager } from "./subscriptionmanager";
export class User{
    private  ws : WebSocket ;
    private  id : string ; 

    constructor(id :string, ws : WebSocket){
        this.ws = ws 
        this.id = id
        this.addListeners()
    }

    private subscriptions : string[] = [] ;

    public subscribe(subscriptions:string){
         this.subscriptions.push(subscriptions)
    }

    public unsubscribe(subscriptions:string){
         this.subscriptions =  this.subscriptions.filter( a => a !== subscriptions);
    }
    
    emit(message : string ){
        this.ws.send(message)
    }    

    private addListeners(){
        this.ws.on("message",(message : string)=>{
            const parsedMessage: IncomingMessages = JSON.parse(message) ; 

             if (parsedMessage.type == "SUBSCRIBE") {
                 parsedMessage.params.forEach(a => SubscriptionManager.getinstace().subscribe(this.id,a))
             }
             if (parsedMessage.type == "UNSUBSCRIBE") {
                 parsedMessage.params.forEach(a => SubscriptionManager.getinstace().unsubscribe(this.id,a))
             }
        })
    }

}
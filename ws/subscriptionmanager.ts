import RedisClient from "@redis/client/dist/lib/client";
import { createClient, RedisClientType } from "redis";
import { UserManager } from "./usermanager";

export class SubscriptionManager {
    private static instance : SubscriptionManager ;
     subscriptions : Map<string,string[]> = new Map() 
    // set subs private later 
    private reverseSubscriptions : Map<string,string[]> = new Map();
    private redisClient : RedisClientType ;

    constructor(){
        this.redisClient = createClient() ;
        this.redisClient.connect();
    }

    public static getinstace(){
        if (!this.instance){
            this.instance = new SubscriptionManager();
            return this.instance
        }
        return this.instance
    }
    
    public subscribe(id : string , subscription : string){
      console.log(this.subscriptions)
        if(this.subscriptions.get(id)?.includes(subscription)){
            return; 
        }

        this.subscriptions.set(id, (this.subscriptions.get(id) || []).concat(subscription) )
        this.reverseSubscriptions.set(subscription,(this.reverseSubscriptions.get(subscription)||[]).concat(id))

        if(this.reverseSubscriptions.get(subscription)?.length == 1){
            console.log(`${subscription} listinging this ong pubsub `)
            this.redisClient.subscribe(subscription,this.redisCallbackHandler)
        }
    }

    private redisCallbackHandler = ( message :string ,channel : string ) =>{
        this.reverseSubscriptions.get(channel)?.forEach( a => UserManager.getInstance().getUser(a)?.emit(message))
    }
    
    public unsubscribe(id :string ,subscription :string){
        const subscriptions =  this.subscriptions.get(id);
        if (subscriptions) {
            this.subscriptions.set(id,  subscriptions.filter( a => a !== subscription) )
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscription)
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscription, reverseSubscriptions.filter(a => a !== id))
            if (this.reverseSubscriptions.get(subscription)?.length == 0) {
                this.reverseSubscriptions.delete(subscription)
                this.redisClient.unsubscribe(subscription);
                console.log(`${subscription} closed susbcirption  `)
            }
        }
    }  

    userleft(id:string){
        console.log(id,"-- this user left")
        this.subscriptions.get(id)?.forEach(s => this.unsubscribe(id,s))
        this.subscriptions.delete(id);
    } 
     
}
import { createClient, RedisClientType } from "redis";
import { MessageToEngine } from "./types/types";
import { MessageFromApi } from "../engine/types";
import { MessageFromOrderbook } from "./types";


 export  class apiRedisManager {
     private static instance : apiRedisManager;
     public pushClient : RedisClientType;
     public subClient : RedisClientType;

     constructor(){
         this.pushClient = createClient();
         this.subClient = createClient();
         this.pushClient.connect()
         this.subClient.connect()
     }

     public static getinstance(){
         if(!this.instance){
            this.instance = new apiRedisManager()
            return this.instance
         }
         return this.instance
     }
     
     public sendAndAwait( message : MessageToEngine ){
           return new Promise<MessageFromOrderbook>((resolve)=>{
               const id = this.getRandomId()
               this.subClient.subscribe(id,(message)=>{
                   this.subClient.unsubscribe(id)
                  resolve(JSON.parse(message))
               })
               this.pushClient.lPush( "messages", JSON.stringify({clientId : id , message}))
           })
     }

     public getRandomId(){
        return Math.random().toString(35).substring(2,15)+Math.random().toString(35).substring(2,15); 
     }
      
 } 
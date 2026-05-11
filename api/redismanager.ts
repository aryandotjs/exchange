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
     
    //  public sendAndAwait( message : MessageToEngine ){
    //        return new Promise<MessageFromOrderbook>((resolve)=>{
    //            const id = this.getRandomId()
    //            this.subClient.subscribe(id,(message)=>{
    //                this.subClient.unsubscribe(id)
    //               resolve(JSON.parse(message))
    //            })
    //            this.pushClient.lPush( "messages", JSON.stringify({clientId : id , message}))
    //        })
    //  }
     public async sendAndAwait(message: MessageToEngine) {
  return new Promise<MessageFromOrderbook>(async (resolve) => {
    const id = this.getRandomId();

    const slowLog = setTimeout(() => {
      console.log("[SLOW ENGINE RESPONSE]", {
        id,
        type: message.type,
        market: (message as any).data?.market,
        userId: (message as any).data?.userId,
        orderId: (message as any).data?.orderId,
      });
    }, 5000);

    await this.subClient.subscribe(id, async (response) => {
      clearTimeout(slowLog);
      await this.subClient.unsubscribe(id);
      resolve(JSON.parse(response));
    });

    await this.pushClient.lPush(
      "messages",
      JSON.stringify({ clientId: id, message })
    );
  });
}


     public getRandomId(){
        return Math.random().toString(35).substring(2,15)+Math.random().toString(35).substring(2,15); 
     }
      
 } 
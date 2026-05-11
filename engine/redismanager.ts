import { data } from "react-router-dom";
import { createClient, RedisClientType } from "redis";
import { DbMessage, MessageFromApi, MessageToApi } from "./types";



export class RedisManager {
   private static Instance: RedisManager;
   private client: RedisClientType;

   private constructor() {
      this.client = createClient()
   }
   public  static async  getInstance() {
      if (!this.Instance) {
         this.Instance = new RedisManager()
          await this.Instance.client.connect()
      }
      return this.Instance
   }
   //  type creaate for 3 functions
   public async  pushMessages(messages :DbMessage) {
     await this.client.lPush("db_proccsor", JSON.stringify(messages))
   }

   public async publishMessages(channel: string, messages: any) {
     await  this.client.publish(channel, JSON.stringify(messages))
   }

   public async sendToapi(channel: string, messages: MessageToApi) {
     await  this.client.publish(channel, JSON.stringify(messages))
   }
}
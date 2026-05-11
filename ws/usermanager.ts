import { SubscriptionManager } from "./subscriptionmanager";
import { User } from "./user";
import { WebSocket } from "ws";


export class UserManager {
       private static instance : UserManager ;
       private Users : Map<string,User> = new Map() ;
       
       public static getInstance(){
           if(!this.instance){
              this.instance = new UserManager();
              return this.instance
           }
           return this.instance ;
       }

       public addUser(ws : WebSocket){
        const id  = this.getRandomId();
        const user = new User(id , ws);
        this.Users.set(id,user);
        this.registerOnClose(id,ws)     
       }

       private registerOnClose(id:string,ws:WebSocket){
            ws.on("close",()=>{
                this.Users.delete(id)
                SubscriptionManager.getinstace().userleft(id);
            })
       }
       
       public getUser(id:string){
           return this.Users.get(id);
       }
       private getRandomId(){
               return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15);
       }
}
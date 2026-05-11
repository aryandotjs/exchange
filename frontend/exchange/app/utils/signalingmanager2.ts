
export const BASE_URL = "ws://localhost:3002"

export class signalingManager2 {
    private ws : WebSocket ;
    private static instace : signalingManager2 ;
    private callback : any = {}
    private bufferedmessages : any = []
    private id = 1
    private isinitialized = false

     private constructor (){
        this.ws =  new WebSocket(BASE_URL)
        this.init()
     }
   public static getInstance(){
          if (!this.instace) {
              this.instace = new signalingManager2
          }
           return this.instace
    }
    init(){
         this.ws.onopen =()=>{
            this.isinitialized = true
            this.bufferedmessages.forEach((a: any)=>{
                  this.ws.send(JSON.stringify(a))
            })
         }
         this.ws.onmessage = (event :any) => {
                const {data} = JSON.parse(event.data) 
                const type = data.e
                   if (this.callback[type]) {
                       this.callback[type].forEach(({callbackfn}: any)=>{             

                        if (type == "ticker") {
                           const datatosend = {
                             firstPrice: data.o, 
                             lastPrice: data.c, 
                             high:data.h , 
                             low:data.l , 
                             volume: data.v,
                             fax : data.E
                           }
                           callbackfn(datatosend)
                        }
                        if (type == "depth") {
                           const asks = data.a[0]
                           const bids = data.b[0]
                           callbackfn(asks,bids)
                           
                        }
                        if (type == "trade") {
                            callbackfn(data)
                        }
                   })
                   }
         }
    }
    sendmessages(messages : any){
       const msstosend  : any=  {
          ...messages,
       }
    if (!this.isinitialized) {

        this.bufferedmessages.push(msstosend)
        return
      }
       this.ws.send(JSON.stringify(msstosend))
    }

     regesterCallback(type : any,callbackfn : any, id : any ){
        this.callback[type] = this.callback[type] || []
        this.callback[type].push({id,callbackfn})
     }
       deRegesterCallback(type  : any, id :any){
             if (this.callback[type]) {
                 const index = this.callback[type].findIndex((a:any)=> a.id == id )
                 this.callback[type].splice(index,1)
             } 
     }
     
}

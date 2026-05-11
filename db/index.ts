import { Client } from "pg";
import { createClient} from "redis"
import { DbMessage } from "./types";

const pgClient = new Client({
    connectionString : "postgresql://user:secret123@localhost:5432/exchange_db"
})
export async function updateTrades(){
    const client = createClient()       
    await client.connect() ;
    await pgClient.connect();
    console.log("redis and pg both connected in index.ts file ")
      
    while(true){
    const response = await client.rPop("db_proccsor" )
    if (response) {
        const parsedResponse : DbMessage = JSON.parse(response);
        if (parsedResponse.type == "TRADE_ADDED") {
            const time = new Date(parsedResponse.data.timestamp)
            const price = Number(parsedResponse.data.price)
            const qty = Number(parsedResponse.data.quantity)
            const market =  parsedResponse.data.market
            const makerId = parsedResponse.data.makerId
            const takerId = parsedResponse.data.takerId
            const tradeId = parsedResponse.data.tradeId
            const isBuyerMaker = parsedResponse.data.isBuyerMaker 
            const query = 'INSERT INTO trades (time , price , volume ,market , makerId , takerId , tradeid , isBuyerMaker) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)'
            const value = [time , price , qty , market , makerId , takerId , tradeId , isBuyerMaker]
    
            await pgClient.query(query,value)

            console.log(" trade added to db")

        } 
        if (parsedResponse.type == "CREATE_ORDER") {

            const orderId = parsedResponse.data.orderId 
            const userId = parsedResponse.data.userId 
            const price = parsedResponse.data.price 
            const quantity = Number(parsedResponse.data.quantity)
            const market = parsedResponse.data.market 
            const side = parsedResponse.data.side 
            const filled = parsedResponse.data.executedQty 
            const status  = filled == 0 ? "OPEN" : filled === quantity ? "FILLED" : "PARTIALLY_FILLED"
            const createAt = new Date()

            const query  = `INSERT INTO orders
                (orderId ,userId , price , quantity , market , side ,filled , status , createAt )
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`
            const value  = [orderId ,userId ,price ,quantity , market,side ,filled, status,createAt] 

            await pgClient.query(query,value)
        }  
        if (parsedResponse.type == "UPDATE_ORDER") {
             
            const orderId = parsedResponse.data.orderId ;
            const executedQty = parsedResponse.data.executedQty;
            
            await pgClient.query(`UPDATE orders 
                       SET 
                          filled = filled + $2 ,
                          status = CASE 
                           WHEN filled + $2 >= quantity THEN 'FILLED'
                           ELSE 'PARTIALLY_FILLED'
                        END   
                       WHERE orderId = $1
                `,
                [orderId ,executedQty])
        }
        if (parsedResponse.type == "CANCEL_ORDER") {
             await pgClient.query(`UPDATE orders
                 SET 
                   status = 'CANCELLED'
                 WHERE orderId = $1
                `,[parsedResponse.data.orderId])
        }
            
    }

    }
} 

updateTrades()


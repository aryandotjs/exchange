import { Client } from "pg"

export const pgClient = new Client({
    connectionString : "postgresql://user:secret123@localhost:5432/exchange_db"
})

async function connect(){
    await pgClient.connect()
    console.log("hey pg is connected in the refresh")
}

async function refreshKlineData(){
    await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1m`)
    await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1h`)
    await pgClient.query(`REFRESH MATERIALIZED VIEW kline_1d`)
    
}

connect()
refreshKlineData().catch(()=> console.log("error while refreshing kline data"))

setInterval(()=>{
    refreshKlineData()
},1000*10)
import { Client } from "pg";


export const pgClient = new Client({
    connectionString : "postgresql://user:secret123@localhost:5432/exchange_db"
})

export async function startdbserver(){
    await pgClient.connect()
}
import { Client, Pool } from "pg";


export const pgClient = new Pool({
    connectionString : "postgresql://user:secret123@localhost:5432/exchange_db"
})

// export async function startdbserver(){
//     await pgClient.connect()
// }
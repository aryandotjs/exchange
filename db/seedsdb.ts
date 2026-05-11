import { Client } from 'pg';

export const client = new Client({
        connectionString : "postgresql://user:secret123@localhost:5432/exchange_db"
})
   
async function initilailizeDb(){
   await client.connect()
    
   console.log("connected to pg in docker")
    
   await client.query(`
          DROP TABLE IF EXISTS users ;
          CREATE TABLE users(
             userId SERIAL PRIMARY KEY ,
             username VARCHAR(50) UNIQUE NOT NULL,
             email VARCHAR(255) UNIQUE NOT NULL , 
             password_hash TEXT NOT NULL ,
             is_verified BOOLEAN DEFAULT false  ,
             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
    `)

    await client.query(`
         DROP TABLE IF EXISTS orders ;
        CREATE TABLE IF NOT EXISTS orders (
        
        orderId   VARCHAR(50) ,
        userId    VARCHAR(50) ,
        price     DOUBLE PRECISION ,
        quantity  DOUBLE PRECISION ,
        market    VARCHAR(10) ,
        side      VARCHAR(10) ,
        filled    DOUBLE PRECISION ,
        status    VARCHAR(20) ,
        createAt  TIMESTAMP WITH TIME ZONE 
      );` )
    await client.query(` 
         DROP MATERIALIZED VIEW IF EXISTS kline_1d ;
         DROP MATERIALIZED VIEW IF EXISTS kline_1h ;
         DROP MATERIALIZED VIEW IF EXISTS kline_1m ;
         DROP TABLE IF EXISTS trades ;
         CREATE TABLE trades (
            time           TIMESTAMP WITH TIME ZONE NOT NULL,
            price          DOUBLE PRECISION,
            volume         DOUBLE PRECISION, 
            market         VARCHAR(20),
            makerId        VARCHAR(255), 
            takerId        VARCHAR(255),
            tradeid        VARCHAR(255), 
            isBuyerMaker   BOOLEAN
        );
        SELECT create_hypertable('trades','time')
    `)
    
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS kline_1m AS 
        SELECT
            time_bucket('1 minute' , time) AS bucket,
            first(price,time) AS open ,
            MAX(price) AS high ,
            MIN(price) AS low ,
            last(price,time) AS close ,
            sum(volume) AS volume ,
            market
        FROM trades 
        GROUP BY bucket , market ; 
    `)

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS kline_1h AS 
        SELECT
            time_bucket('1 hour' , time) AS bucket,
            first(price,time) AS open ,
            MAX(price) AS high ,
            MIN(price) AS low ,
            last(price,time) AS close ,
            sum(volume) AS volume ,
            market
        FROM trades 
        GROUP BY bucket , market ; 
    `)
    
     await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS kline_1d AS 
        SELECT
            time_bucket('1 day' , time) AS bucket,
            first(price,time) AS open ,
            MAX(price) AS high ,
            MIN(price) AS low ,
            last(price,time) AS close ,
            sum(volume) AS volume ,
            market
        FROM trades 
        GROUP BY bucket , market ; 
    `)

   await client.end() 
   console.log("database initilailize ")
} 

initilailizeDb().catch(console.error)
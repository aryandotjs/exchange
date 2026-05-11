export interface Ticker{
    "firstPrice": string,
    "high": string,
    "lastPrice": string,
    "low": string,
    "priceChange": string,
    "priceChangePercent": string,
    "quoteVolume": string,
    "symbol": string,
    "trades": string,
    "volume": string,
}

export interface Depthtype {
    bids: [string, string][],
    asks: [string, string][],
    lastUpdateId: string,
    timestamp: number;
}

export interface kline{
    close: string;        
    end: string;       
    high: string;     
    low: string;          
     open: string;         
     quoteVolume: string; 
  start: string;        
  trades: string;  
  volume: string;     
}
export type Klines = kline[];

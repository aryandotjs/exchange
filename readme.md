# Full Exchange

A microservices-style crypto exchange prototype built with Node.js and TypeScript. It includes a REST API, matching engine, Redis-based messaging, WebSocket market streams, TimescaleDB persistence, a market maker, external market-data views, and a Next.js trading frontend.

<!-- ![Architecture](./assets/architecture.png) -->
 <img width="1297" height="645" alt="Screenshot 2026-05-12 011216" src="https://github.com/user-attachments/assets/62e14fcb-15b8-478b-a23d-b01878f87c9c" />

## Architecture

The project is split into independent services:

- **API Service**: Express.js HTTP gateway for auth, orders, balances, market data, and database queries.
- **Engine Service**: Isolated matching engine with in-memory order books, balances, open orders, and trade execution.
- **Redis**: Used for API-to-engine request/response messaging, DB queues, and WebSocket pub/sub.
- **DB Worker**: Persists orders and trades into TimescaleDB.
- **WebSocket Service**: Streams real-time depth and trade updates to the frontend.
- **Market Maker**: Generates local liquidity for engine-supported markets.
- **Frontend**: Next.js trading UI with markets, chart, order book, trades, and order panel.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Backend**: Express.js
- **Messaging**: Redis queues and pub/sub
- **Database**: TimescaleDB/PostgreSQL
- **Authentication**: JWT
- **Frontend**: Next.js, React, Tailwind CSS
- **Charts**: Lightweight Charts
- **WebSocket**: `ws`

## Key Features

### Trading

- Create limit buy/sell orders
- Cancel open orders
- Match orders through an in-memory order book
- Track user balances and locked funds
- Maintain open orders per user
- Publish real-time depth and trade updates

### Market Data

- Live order book depth
- Recent trades
- Ticker data
- Kline/candlestick data
- Market list from Backpack API
- Local market maker for simulated liquidity

### Authentication

- User signup/signin
- JWT-protected endpoints
- Authenticated order and balance routes

### Data Management

- **In-memory engine state**: order books, balances, open orders
- **Persistent database state**: users, orders, trades, kline views
- **Redis queues**: engine commands and DB persistence events
- **Redis pub/sub**: real-time trade and depth streams

## Order Flow

1. User or market maker sends an order request to the API.
2. API validates the request and JWT.
3. API sends a command to the engine through the Redis `messages` queue.
4. Engine checks balances and locks funds.
5. Engine matches the order against the in-memory order book.
6. Engine updates balances, open orders, and order book state.
7. Engine sends a response back to the API through a Redis response channel.
8. Engine publishes depth/trade updates through Redis pub/sub.
9. WebSocket service forwards realtime updates to the frontend.
10. DB worker persists order and trade events into TimescaleDB.

## Request/Response Pattern

The API communicates with the engine through Redis.

1. API generates a unique request ID.
2. API subscribes to a Redis response channel for that ID.
3. API pushes the command to the Redis `messages` queue.
4. Engine reads the command, processes it, and publishes a response to the same request ID.
5. API resolves the waiting request and returns the response to the client.

This pattern is used for:

- Creating orders
- Cancelling orders
- Fetching open orders
- Fetching balances
- Fetching depth from the engine

## API Endpoints

| Endpoint                      | Method |   Auth | Description             |
| ----------------------------- | -----: | -----: | ----------------------- |
| `/api/v1/auth/signup`         |   POST |     No | Create user             |
| `/api/v1/auth/signin`         |   POST |     No | Sign in and receive JWT |
| `/api/v1/auth/me`             |    GET |    Yes | Get current user        |
| `/api/v1/orders/createOrder`  |   POST |    Yes | Create order            |
| `/api/v1/orders/cancleOrder`  | DELETE | Manual | Cancel order            |
| `/api/v1/orders/openOrder`    |    GET |    Yes | Get open orders         |
| `/api/v1/orders/orderHistory` |    GET |    Yes | Get user order history  |
| `/api/v1/orders/tradeHistory` |    GET |    Yes | Get user trade history  |
| `/api/v1/depth/:market`       |    GET |     No | Get market depth        |
| `/api/v1/trades/:market`      |    GET |     No | Get recent trades       |
| `/api/v1/kline/:market`       |    GET |     No | Get kline data          |
| `/api/v1/ticker/:market`      |    GET |     No | Get ticker data         |
| `/api/v1/getbalance`          |    GET |    Yes | Get user balance        |

## Market Support

The local matching engine currently supports active trading for:

- `BTC_USD`
- `ETH_USD`
- `SOL_USD`

The frontend also displays additional markets from the Backpack API. These external markets are used for viewing market data only, including:

- Market list
- Ticker data
- Order book/depth
- Chart/kline data

Orders are matched and settled only for markets supported by the local engine.

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker Desktop

### Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=secret123
```

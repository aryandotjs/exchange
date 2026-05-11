
// const { Engine } = require("./engine");

// const engine = new Engine()

// let USER_ID1 = "USER_MAKER" 
// let USER_ID2 = "USER_TAKER"
// engine.process({
//     message : {
//         type : "ON_RAMP",
//         data : {
//             userId :USER_ID1,
//             amount : "10",
//             asset :  "SOL"
//         }
//     },
//     clientId : USER_ID1
// })
// engine.process({
//     message : {
//         type : "ON_RAMP",
//         data : {
//             userId :USER_ID2,
//             amount : "1000",
//             asset :  "USDC"
//         }
//     },
//     clientId : USER_ID2
// })

// // engine.process({
// //     message : {
// //         price : "100",
// //         type : "CREATE_ORDER" ,
// //         market : "SOL_USDC",
// //         userID : USER_ID1,
// //         side : "sell",
// //         quantity : "1",
// //     },
// //     clientId : USER_ID1 
// // })
// //  const orderId  = engine.process({
// //     message : {
// //         price : "110",
// //         type : "CREATE_ORDER" ,
// //         market : "SOL_USDC",
// //         userID : USER_ID2,
// //         side : "buy",
// //         quantity : "5",
// //     },
// //     clientId : USER_ID2
// // })

// // console.log("--- Balances ---");
// // console.log(engine.getBalances(USER_ID1));
// // console.log(engine.getBalances(USER_ID2));

// // console.log("--- Orderbook Depth ---");
// // engine.process({
// //     message: { type: "GET_DEPTH", market: "SOL_USDC" },
// //     clientId: "checker"
// // });
// //  console.log("now we are canceling order")
// // engine.process({
// //     message : {
// //         type : "CANCEL_ORDER" ,
// //         market : "SOL_USDC",
// //         orderId : orderId
// //     },
// //     clientId : USER_ID2
// // })


// // console.log("--- Balances ---");
// // console.log(engine.getBalances(USER_ID1));
// // console.log(engine.getBalances(USER_ID2));

// // console.log("--- Orderbook Depth ---");
// // engine.process({
// //     message: { type: "GET_DEPTH", market: "SOL_USDC" },
// //     clientId: "checker"
// // });
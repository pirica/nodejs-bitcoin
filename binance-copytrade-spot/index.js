import "dotenv/config";
import WebSocket from "ws";
import { newOrder, getSignature, copyTrade } from "./api.js";

/// LOADING ACCOUNTS
const accounts = [];

let i = 1;
while (process.env[`TRADER${i}_API_KEY`]) {
    accounts.push({
        apiKey: process.env[`TRADER${i}_API_KEY`],
        apiSecret: process.env[`TRADER${i}_API_SECRET`]
    })
    i++;
}
console.log(`${i - 1} copy accounts loaded`);

/// CONNECTING WS API
const ws = new WebSocket(process.env.BINANCE_WS_URL);

ws.on("open", async () => {
    console.log("WebSocket connected to " + process.env.BINANCE_WS_URL);

    // Subscribe using userDataStream.subscribe.signature method
    const timestamp = Date.now();
    const signature = getSignature({ apiKey: process.env.TRADER0_API_KEY, timestamp });

    const request = {
        id: timestamp,
        method: 'userDataStream.subscribe.signature',
        params: {
            apiKey: process.env.TRADER0_API_KEY,
            timestamp,
            signature
        }
    }

    ws.send(JSON.stringify(request), (err) => {
        if (err) {
            console.error('WebSocket subscription error: ', err);
            process.exit(0);
        }
    });
});

ws.on("error", (err) => {
    console.error("WebSocket error: ", err);
    process.exit(0);
});

/// PAST TRADES
const oldOrders = {};

ws.on("message", async (data) => {
    const message = JSON.parse(data);
    console.log(message);

    if (message.error) {
        console.error("message.error", message.error);
        process.exit(0);
    }

    if (message.subscriptionId !== undefined)
        console.log("message.subscriptionId", message.subscriptionId);

    if (!message.event) return;
    const tradeEvent = message.event;
    if (tradeEvent.e !== "executionReport" || oldOrders[tradeEvent.i]) return;

    try {
        oldOrders[tradeEvent.i] = true;
        const orderCopy = copyTrade(tradeEvent);
        const promises = accounts.map(acc => newOrder(orderCopy, acc.apiKey, acc.apiSecret));
        const results = await Promise.allSettled(promises);

        console.log(results.length + " copy orders sent. Results:");
        results.forEach((result, index) => {
            console.log(`Account ${index + 1}:`, result.status === "fulfilled" ? "Success" : "Failed", result.reason || "");
        });

        //para não entrar em loop durante os testes, descomente abaixo
        process.exit(0);
    }
    catch (err) {
        console.error(err);
    }
});

console.log("Waiting news...");

//código apenas para teste, para enviar uma ordem fake após 10 segundos, descomente abaixo
setTimeout(() => {
    console.log("sending a fake order...")
    newOrder({
        symbol: "BTCUSDT",
        side: "BUY",
        type: "MARKET",
        quoteOrderQty: 15
    }, process.env.TRADER0_API_KEY, process.env.TRADER0_API_SECRET);
}, 10000);
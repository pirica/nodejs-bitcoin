import WebSocket from "ws";
const ws = new WebSocket(`${process.env.STREAM_URL}/btcusdt@ticker`);
let isOpened = false;

import api from "./api.js";

ws.onmessage = async (event) => {
    console.clear();
    const obj = JSON.parse(event.data);
    console.log(`Symbol: ${obj.s}`);
    console.log(`Price: ${obj.c}`);

    const price = parseFloat(obj.c);

    try {
        if (price < 100000 && !isOpened) {
            console.log('Abrir posição!');
            const result = await api.newOrder("BTCUSDT", "0.01", "BUY")
            console.log(result);
            isOpened = true;
        }
        else if (price > 110000 && isOpened) {
            console.log('Fechar posição!');
            const result = await api.newOrder("BTCUSDT", "0.01", "SELL")
            console.log(result);
            isOpened = false;
        }
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}
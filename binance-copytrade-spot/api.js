import crypto from "crypto";
import axios from 'axios';

export function getSignature(data) {
    return crypto
        .createHmac('sha256', process.env.TRADER0_API_SECRET)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');
}

export async function newOrder(data, apiKey, apiSecret) {
    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    data.timestamp = Date.now();
    data.recvWindow = 60000;//máximo permitido, default 5000

    const signature = getSignature(data);
    const qs = `?${new URLSearchParams({ ...data, signature })}`;

    try {
        const result = await axios({
            method: "POST",
            url: `${process.env.BINANCE_API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        return result.data;
    } catch (err) {
        console.error("newOrder Error:", err.response ? err.response : err);
    }
}

export function copyTrade(trade) {
    const data = {
        symbol: trade.s,
        side: trade.S,
        type: trade.o
    }

    if (trade.Q && parseFloat(trade.Q)) data.quoteOrderQty = trade.Q;
    else if (trade.q && parseFloat(trade.q)) data.quantity = trade.q;

    if (trade.p && parseFloat(trade.p)) data.price = trade.p

    if (trade.f && trade.f !== "GTC") data.timeInForce = trade.f;

    if (trade.P && parseFloat(trade.P)) data.stopPrice = trade.P;

    return data;
}
import axios from "axios";
import crypto from "crypto";

const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;

if (!apiKey || !apiSecret || !apiUrl)
    throw new Error('Preencha corretamente seu .env');

async function newOrder(symbol, quantity, side = 'BUY', type = 'MARKET') {
    const data = { symbol, side, type, quantity };

    const timestamp = Date.now();
    const recvWindow = 60000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams({ ...data, timestamp, recvWindow }).toString()}`)
        .digest('hex');

    const newData = { ...data, timestamp, recvWindow, signature };
    const qs = `?${new URLSearchParams(newData).toString()}`;

    const result = await axios({
        method: 'POST',
        url: `${apiUrl}/v1/order${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
    });
    return result.data;
}

export default {
    newOrder
}
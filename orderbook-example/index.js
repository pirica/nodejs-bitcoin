import MatchEngine from "./lib/MatchEngine.js";
import OrderBook from "./lib/OrderBook.js";
import Order, { Side } from "./lib/Order.js";

async function printOrderBook(orderBook) {
    const buyOrders = Object.values(orderBook.buyOrders.slice(0, 10));
    const sellOrders = Object.values(orderBook.sellOrders.slice(0, 10));
    const maxRows = Math.max(buyOrders.length, sellOrders.length);
    const colWidth = 36;

    const formatOrder = (order) =>
        order ? `| ID: ${order.id}, Amt: ${order.amount.toFixed(4)}, $${order.price.toFixed(2)}`.padEnd(colWidth) : "";

    console.log("-".repeat(colWidth * 2));
    console.log(`| Buy Orders (${orderBook.buyOrders.length})`.padEnd(colWidth - 1) + ` | Sell Orders (${orderBook.sellOrders.length})`.padEnd(colWidth + 1) + "|");
    console.log("-".repeat(colWidth * 2));
    for (let i = 0; i < maxRows; i++) {
        const left = formatOrder(buyOrders[i]).padEnd(colWidth);
        const right = formatOrder(sellOrders[i]).padEnd(colWidth) + "|";
        console.log(left + right);
    }
    console.log("-".repeat(colWidth * 2));
}

async function printLastTrades(trades) {
    console.log("-".repeat(72));
    console.log("| Last Trades".padEnd(71) + "|");
    console.log("-".repeat(72));
    trades.forEach(trade => {
        const line = `| ${trade.amount.toFixed(4)} @ $${trade.price.toFixed(2)} (Buy ID: ${trade.buyOrderId}, Sell ID: ${trade.sellOrderId})`;
        console.log(line.padEnd(71) + "|");
    });
    console.log("-".repeat(72));
}

function getRandomPrice(base, variance) {
    return (base + (Math.random() - 0.5) * variance).toFixed(2);
}

function getRandomAmount(min, max) {
    return (Math.random() * (max - min) + min).toFixed(4);
}

function getRandomSide() {
    return Math.random() < 0.5 ? Side.BUY : Side.SELL;
}

function getRandomOrder() {
    const basePrice = 50000;
    const variance = 5000;
    const price = getRandomPrice(basePrice, variance);
    const amount = getRandomAmount(0.01, 1);
    const side = getRandomSide();
    return new Order(side, amount, price);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const matchEngine = new MatchEngine();
const orderBook = new OrderBook(matchEngine);

for (let i = 0; i < 50000; i++) {
    const order = getRandomOrder();
    orderBook.addOrder(order);

    console.clear();
    await printOrderBook(orderBook);
    await printLastTrades(matchEngine.getLastTrades());

    console.log(`Ticker Price: ${orderBook.getTickerPrice().toFixed(2)}`);
    const stats = orderBook.getStats();
    console.log(`Trades: ${stats.numOfTrades}, Volume: ${stats.totalVolume.toFixed(4)}, Max Price: $${stats.maxPrice.toFixed(2)}, Min Price: $${stats.minPrice.toFixed(2)}`);
    await sleep(50);
}
import Trade from "./Trade.js";

export default class MatchEngine {
    constructor() {
        this.trades = [];
        this.totalVolume = 0;
        this.maxPrice = 0;
        this.minPrice = 0;
    }

    getLastTrades(size = 10) {
        return this.trades.slice(-size);
    }

    matchOrders(orderBook) {
        while (orderBook.buyOrders.length > 0 && orderBook.sellOrders.length > 0) {
            const buyOrder = orderBook.buyOrders[0];
            const sellOrder = orderBook.sellOrders[0];

            if (buyOrder.price >= sellOrder.price) {
                const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount);

                buyOrder.amount -= tradeAmount;
                sellOrder.amount -= tradeAmount;

                if (buyOrder.amount === 0) {
                    orderBook.buyOrders.shift();
                }
                if (sellOrder.amount === 0) {
                    orderBook.sellOrders.shift();
                }

                this.trades.push(new Trade(buyOrder, sellOrder, sellOrder.price, tradeAmount));
                this.totalVolume += tradeAmount;

                if (this.maxPrice === 0 || sellOrder.price > this.maxPrice) {
                    this.maxPrice = sellOrder.price;
                }
                if (this.minPrice === 0 || sellOrder.price < this.minPrice) {
                    this.minPrice = sellOrder.price;
                }
            } else {
                break;
            }
        }
    }
}
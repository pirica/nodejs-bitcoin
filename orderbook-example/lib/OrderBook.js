import { Side } from "./Order.js";

export default class OrderBook {
    constructor(matchEngine) {
        this.buyOrders = [];
        this.sellOrders = [];

        if (!matchEngine || !matchEngine.matchOrders) {
            throw new Error("MatchEngine instance with matchOrders method is required.");
        }

        this.matchEngine = matchEngine;
    }

    getStats() {
        return {
            numOfBuyOrders: this.buyOrders.length,
            numOfSellOrders: this.sellOrders.length,
            numOfTrades: this.matchEngine.trades.length,
            totalVolume: this.matchEngine.totalVolume,
            maxPrice: this.matchEngine.maxPrice,
            minPrice: this.matchEngine.minPrice
        }
    }

    getTickerPrice() {
        if (this.buyOrders.length === 0 || this.sellOrders.length === 0) {
            return 0; // No trades possible, so no ticker price
        }

        const difference = this.sellOrders[0].price - this.buyOrders[0].price;
        const midPrice = (this.sellOrders[0].price + this.buyOrders[0].price) / 2;
        const tickerPrice = midPrice + difference * 0.1; // Adjust the ticker price slightly towards the sell side
        return tickerPrice;
    }

    addOrder(order) {
        let shouldTest = false;
        if (order.side === Side.BUY) {
            this.buyOrders.push(order);
            this.buyOrders.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);

            shouldTest = this.buyOrders.length > 0 && this.buyOrders[0].id === order.id;
        } else {
            this.sellOrders.push(order);
            this.sellOrders.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);

            shouldTest = this.sellOrders.length > 0 && this.sellOrders[0].id === order.id;
        }

        if (shouldTest)
            this.matchEngine.matchOrders(this);
    }

    removeOrder(orderId) {
        orderId = Number(orderId);
        if (!orderId) {
            throw new Error("Order ID is required to remove an order.");
        }

        this.buyOrders = this.buyOrders.filter(order => order.id !== orderId);
        this.sellOrders = this.sellOrders.filter(order => order.id !== orderId);
    }
}
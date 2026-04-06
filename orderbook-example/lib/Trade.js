export default class Trade {
    constructor(buyOrder, sellOrder, price, amount) {
        this.buyOrderId = buyOrder.id;
        this.sellOrderId = sellOrder.id;
        this.price = price;
        this.amount = amount;
        this.timestamp = Date.now();
    }
}
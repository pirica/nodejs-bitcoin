export default class Order {

    static orderId = 0;

    static getNextOrderId() {
        return ++Order.orderId;
    }

    constructor(side, amount, price = 0) {
        if(side !==  Side.BUY && side !== Side.SELL) {
            throw new Error("Invalid order side. Must be 'buy' or 'sell'.");
        }

        if(price && parseFloat(price) <= 0) {
            throw new Error("Price must be a positive number.");
        }

        if(parseFloat(amount) <= 0) {
            throw new Error("Amount must be a positive number.");
        }

        this.id = Order.getNextOrderId();
        this.side = side;
        this.price = price ? Number(price) : undefined;
        this.amount = Number(amount);
        this.timestamp = Date.now();
    }
}

export const Side = {
    BUY: "buy",
    SELL: "sell"
}
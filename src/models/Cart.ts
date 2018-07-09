import { Card } from "./Shop"

class CartItem {
    card: Card;
    amount: number;
}

export default class Cart {
    items: Array<CartItem> = [];
}
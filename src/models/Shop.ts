import Card from '@/models/Card';

import Vue from "vue";

export class Card {
    name: string;
    stock: number;
    price: number;
    quality: string;
    referral: string;
    foil: boolean;

    constructor(name: string, stock: number, price: number, quality: string, referral: string, foil: boolean) {
        this.name = name;
        this.stock = stock;
        this.price = price;
        this.quality = quality;
        this.referral = referral;
        this.foil = boolean;
    }
}

export class Shop {
    name: string;
    logo: string;
    cards: { [cardname: string]: Array<ShopCard> } = {};

    constructor(name: string, logo: string) {
        this.name = name;
        this.logo = logo;
    }

    addCard(card: Card) {
        if (!(card.name in this.cards)) {
            Vue.set(this.cards, card.name, []);
        }
        this.cards[card.name].push(card)
    }

    get score() {
        let result = 0;
        const wantlist = vue.$store.state.wantlist;
        _.forIn(this.cards, (name: string, card: ShopCard) => {
            if (card.stock > wantlist[name]) {
                result += wantlist[name];
            } else {
                result += card.stock;
            }
        });
        return result;
    }

    get amountInCart() {
        let result = 0;
        const cart: Cart = vue.$store.state.currentCart;
        if (cart != null) {
            for (const item in cart.items) {
                if (item.card.name in this.cards) {
                    result += item.amount;
                }
            }
        }
        return result;
    }

    get rating() {
        return this.score + this.amountInCart;
    }
}
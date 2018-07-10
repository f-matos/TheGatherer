import Vue from "vue";
import _ from "lodash";
import store from "@/store";

export let formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  // the default value for minimumFractionDigits depends on the currency
  // and is usually already 2
});

export class CartItem {
  card: Card;
  shops: { [shopname: string]: number } = {};

  constructor(card: Card) {
    this.card = card;
  }

  get amount() {
    let total = 0;
    _.forIn(this.shops, amount => {
      total += amount;
    });
    return total;
  }

  get price() {
    let total = 0;
    _.forIn(this.shops, (amount, shopname) => {
      total += store.state.shops[shopname].cards[this.card.id].price * amount;
    });
    return total;
  }
}

export class Cart {
  items: { [cardId: string]: CartItem } = {};

  addItem(card: Card, amount: number) {
    if (!(card.id in this.items)) {
      Vue.set(this.items, card.id, new CartItem(card));
    }
    const item = this.items[card.id];
    if (!(card.shop.name in item.shops)) {
      Vue.set(item.shops, card.shop.name, 0);
    }
    item.shops[card.shop.name] += amount;
  }

  removeItem(card: Card, amount: number) {
    this.items[card.name].shops[card.shop.name] -= amount;
  }
}

export class Card {
  name: string;
  stock: number;
  price: number;
  quality: string;
  referral: string;
  foil: boolean;
  shop: Shop;

  constructor(
    shop: Shop,
    name: string,
    stock: number,
    price: number,
    quality: string,
    referral: string,
    foil: boolean
  ) {
    this.shop = shop;
    this.name = name;
    this.stock = stock;
    this.price = price;
    this.quality = quality;
    this.referral = referral;
    this.foil = foil;
  }

  get id() {
    return `${this.name}|${this.shop.name}|${this.quality}`;
  }

  get money() {
    return formatter.format(this.price);
  }
}

export class Shop {
  name: string;
  logo: string;
  cards: { [cardId: string]: Card } = {};

  constructor(name: string, logo: string) {
    this.name = name;
    this.logo = logo;
  }

  get score() {
    let result = 0;
    const wantlist = store.state.wantlist;
    _.forIn(this.cards, card => {
      if (card.stock > wantlist[card.name]) {
        result += wantlist[card.name];
      } else {
        result += card.stock;
      }
    });
    return result;
  }

  get amountInCart() {
    let result = 0;
    const cart: Cart = store.state.currentCart;
    if (cart != null) {
      _.forIn(cart.items, (item: CartItem) => {
        result += item.amount;
      });
    }
    return result;
  }

  get rating() {
    return this.score + this.amountInCart;
  }
}

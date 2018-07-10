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
  id: string;
  cardname: string;
  shops: { [shopname: string]: number } = {};

  constructor(id: string, cardname: string) {
    this.id = id;
    this.cardname = cardname;
  }

  decrease(shopname: string, amount: number) {
    if (this.shops[shopname] <= amount) {
      Vue.delete(this.shops, shopname);
    } else {
      this.shops[shopname] -= amount;
    }
  }

  increase(shopname: string, amount: number) {
    if (!(shopname in this.shops)) {
      Vue.set(this.shops, shopname, 0);
    }
    this.shops[shopname] += amount;
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
      total += store.state.shops[shopname].cards[this.id].price * amount;
    });
    return total;
  }

  get money() {
    return formatter.format(this.price);
  }
}

export class Cart {
  items: { [cardId: string]: CartItem } = {};

  addItem(card: Card, amount: number) {
    if (!(card.name in this.items)) {
      Vue.set(this.items, card.id, new CartItem(card.id, card.name));
    }
    this.items[card.id].increase(card.shop.name, amount);
  }

  removeItem(card: Card, amount: number) {
    const item = this.items[card.id];
    item.decrease(card.shop.name, amount);
    if (_.size(item.shops) == 0) {
      Vue.delete(this.items, item.id);
    }
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
    return `${this.name}|${this.quality}`;
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
    let results: { [cardname: string]: number } = {};
    const wantlist = store.state.wantlist;

    _.forIn(this.cards, card => {
      if (!(card.name in results)) {
        results[card.name] = 0;
      }
      let partialScore = results[card.name] + card.stock;
      if (partialScore > wantlist[card.name]) {
        results[card.name] = wantlist[card.name];
      } else {
        results[card.name] = partialScore;
      }
    });
    let total = 0;
    _.forIn(results, value => {
      total += value;
    })
    return total;
  }

  get amountInCart() {
    let result = 0;
    const cart: Cart = store.state.currentCart;
    if (cart != null) {
      _.forIn(cart.items, (item: CartItem) => {
        if (this.name in item.shops) {
          result += item.shops[this.name];
        }
      });
    }
    return result;
  }

  get rating() {
    return this.score + this.amountInCart;
  }
}

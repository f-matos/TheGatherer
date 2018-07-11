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

export class Card {
  name: string;
  price: number;
  quality: string;
  referral: string;
  foil: boolean;

  constructor(
    name: string,
    price: number,
    quality: string,
    referral: string,
    foil: boolean
  ) {
    this.name = name;
    this.price = price;
    this.quality = quality;
    this.referral = referral;
    this.foil = foil;
  }

  get id() {
    return `${this.name}|${this.referral}`;
  }

  get money() {
    return formatter.format(this.price);
  }
}

export class ShopCard {
  card: Card;
  _stock: number;

  constructor(card: Card, stock: number) {
    this.card = card;
    this._stock = stock;
  }

  set stock(value: number) {
    this.stock = value;
  }

  get stock() {
    const cart = store.state.currentCart;
    let result = this._stock;
    cart.items.some(cartCard => {
      if (cartCard.card == this.card) {
        result -= cartCard.amount;
        return true;
      }
      return false;
    });
    return result;
  }
}

export class Shop {
  name: string;
  logo: string;
  cards: Array<ShopCard> = [];

  constructor(name: string, logo: string) {
    this.name = name;
    this.logo = logo;
  }

  get score() {
    let results: { [cardname: string]: number } = {};
    const wantlist = store.state.wantlist;
    this.cards.forEach(storeCard => {
      const card = storeCard.card;
      const wantedCard = store.state.wantlist.cards.find(
        c => c.name == card.name
      );
      if (wantedCard === undefined) {
        results[card.name] = 0;
        return;
      }
      if (!(card.name in results)) {
        results[card.name] = 0;
      }
      let partialScore =
        results[card.name] + storeCard.stock + wantedCard.amountOwned;
      if (partialScore > wantedCard.amountWanted) {
        results[card.name] = wantedCard.amountWanted;
      } else {
        results[card.name] = partialScore;
      }
    });
    let total = 0;
    _.forIn(results, value => {
      total += value;
    });
    return total;
  }

  get amountInCart() {
    let result = 0;
    const cart: Cart = store.state.currentCart;
    if (cart != null) {
      cart.items.forEach(cartCard => {
        if (cartCard.shop == this) {
          result += cartCard.amount;
        }
      });
    }
    return result;
  }

  get rating() {
    return this.score + this.amountInCart;
  }
}

export class CartCard {
  card: Card;
  shop: Shop;
  amount: number;

  constructor(card: Card, shop: Shop, amount: number) {
    this.card = card;
    this.shop = shop;
    this.amount = amount;
  }

  get price() {
    //return this.card.price * this.amount
    return this.card.price;
  }

  get money() {
    return formatter.format(this.price);
  }
}

export class Cart {
  items: Array<CartCard> = [];

  addItem(card: Card, shop: Shop, amount: number) {
    let wantedCard = _.find(
      store.state.wantlist.cards,
      w => card.name == w.name
    );
    if (wantedCard === undefined) {
      store.mutations.addError("Added card but its not in wantlist!");
      return;
    }
    if (wantedCard.isSatisfied) {
      store.mutations.addError("You dont need more of this card");
      return;
    }
    const hasStock = shop.cards.every(shopCard => {
      if (shopCard.card == card) {
        if (shopCard.stock < amount) {
          return false;
        }
      }
      return true;
    });
    if (!hasStock) {
      store.mutations.addError("Store out of stock!");
      return;
    }
    const index = _.findIndex(
      this.items,
      i => i.card == card && i.shop == shop
    );
    if (index == -1) {
      this.items.push(new CartCard(card, shop, amount));
    } else {
      this.items[index].amount += amount;
    }
    wantedCard.amountOwned += amount;
  }

  get price() {
    return _.reduce(this.items, (result, item) => result + item.price, 0);
  }

  get money() {
    return formatter.format(this.price);
  }

  removeItem(cartCard: CartCard, amount: number) {
    const index = _.indexOf(this.items, cartCard);
    if (index == -1) {
      store.mutations.addError("Tried removing a card that doesnt exists");
      return;
    }
    const item = this.items[index];
    if (item.amount <= amount) {
      this.items.splice(index, 1);
    } else {
      item.amount -= amount;
    }
    store.state.wantlist.cards.some(wantedCard => {
      if (wantedCard.name == item.card.name) {
        wantedCard.amountOwned--;
        return true;
      }
      return false;
    });
  }
}

export class WantlistCard {
  name: string;
  amountWanted: number;
  amountOwned: number = 0;

  constructor(name: string, amount: number) {
    this.name = name;
    this.amountWanted = amount;
  }

  get isSatisfied() {
    return this.amountOwned == this.amountWanted;
  }
}

export class Wantlist {
  cards: Array<WantlistCard> = [];
}

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

  constructor(name: string, price: number, quality: string, referral: string, foil: boolean) {
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
    })
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
      const wantedCard = store.state.wantlist.cards.find(c => c.name == card.name);
      if (wantedCard === undefined) {
        results[card.name] = 0;
        return;
      }
      if (!(card.name in results)) {
        results[card.name] = 0;
      }
      let partialScore = results[card.name] + storeCard.stock;
      if (partialScore > wantedCard.amount) {
        results[card.name] = wantedCard.amount;
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
      cart.items.forEach(cartCard => {
        if (cartCard.shop == this) {
          result += cartCard.amount;
        }
      })
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
    return this.card.price
  }

  get money() {
    return formatter.format(this.price);
  }

}

export class Cart {
  items: Array<CartCard> = []

  addItem(card: Card, shop: Shop, amount: number) {
    const amountDone = store.state.wantlist.missing.some(wanted =>
      card.name == wanted.name && wanted.amount < amount
    )
    if (amountDone) {
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
    })
    if (!hasStock) {
      store.mutations.addError("Store out of stock!");
      return;
    }
    const done = this.items.some(item => {
      if (item.card == card && item.shop == shop) {
        item.amount += amount;
        return true;
      }
      return false;
    })
    if (!done) {
      this.items.push(new CartCard(card, shop, amount));
    }
  }

  get price() {
    return _.reduce(this.items, (result, item) => result + item.price, 0)
  }

  get money() {
    return formatter.format(this.price);
  }

  removeItem(cartCard: CartCard, amount: number) {
    let updatedItem: CartCard = this.items[0]; //Bug prone
    const index = _.indexOf(this.items, cartCard);
    if (index == -1) {
      store.mutations.addError("Tried removing a card that doesnt exists");
      return;
    }
    if (this.items[index].amount <= amount) {
      this.items.splice(index, 1);
    } else {
      this.items[index].amount -= amount;
    }
  }
}

export class WantlistCard {
  name: string;
  amount: number;

  constructor(name: string, amount: number) {
    this.name = name;
    this.amount = amount;
  }
}

export class Wantlist {
  cards: Array<WantlistCard> = [];

  get missing(): Array<WantlistCard> {
    const cart = store.state.currentCart;
    if (cart.items.length == 0) {
      return this.cards;
    } else {
      const arrayCardsInCart = _.chain(cart.items).groupBy(o => o.card.name).map(m => _.transform<CartCard, WantlistCard>(m, (result, item) => {
        const index = _.findIndex(result, i => i.name == item.card.name);
        if (index == -1) {
          result.push(new WantlistCard(item.card.name, item.amount));
        } else {
          result[index].amount += item.amount;
        }
      })).value();
      const cardsInCart = _.zip(...arrayCardsInCart)[0];
      let result: Array<WantlistCard> = [];
      this.cards.forEach(wantedCard => {
        let amount = wantedCard.amount;
        cardsInCart.every(ownedCard => {
          if (ownedCard === undefined) {
            return true;
          }
          if (wantedCard.name == ownedCard.name) {
            amount -= ownedCard.amount;
            return false;
          }
          return true;
        })
        result.push(new WantlistCard(wantedCard.name, amount));
      })
      return result;
    }
  }
}

/*  

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
*/
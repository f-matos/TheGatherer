//import { BaseItem } from "./../models";
import _ from "lodash";
import axios from "axios";
import Vue from "vue";
import { store, module, Getters, Mutations, Actions } from "sinai";
import { Shop, Card } from "./models/Shop";
import Cart from "./models/Cart";

// Declare the moimport Shop from '@/models/Shop';
dule state and its initial value
class RootState {
  shops: { [storeName: string]: Shop } = {};
  currentShop!: Shop;

  carts: Array<Cart> = [];
  currentCart!: Cart;

  lastError: string = "";
  errors: Array<string> = [];
  loadDone = 0;
  loadTotal = 0;
  step = 0;
  wantlist: { [cardname: string]: number } = {};
  shopFilter: string = "";
  selectedStore: Store = {
    name: "",
    logo: "",
    cards: {},
    rating: 0,
    onCart: 0
  };
  /*carts: Array<Cart> = [
    { wantlist: Object.assign({}, this.wantlist), items: {} }
  ];*/
  selectedCart: Cart = this.carts[0];
  bestPrice: { [cardname: string]: Store } = {};
}

// Declare mutations
class RootMutations extends Mutations<RootState>() {
  addCardToStore(name: string, logo: string, card: Card) {
    if (!(name in this.state.stores)) {
      Vue.set(this.state.stores, name, {
        name: name,
        logo: logo,
        cards: {},
        rating: 0,
        onCart: 0
      });
    }
    if (!(card.name in this.state.stores[name].cards)) {
      this.state.stores[name].cards[card.name] = card;
    }
    if (card.name in this.state.bestPrice) {
      const bestShop = this.state.bestPrice[card.name];
      if (bestShop.cards[card.name].price > card.price) {
        this.state.bestPrice[card.name] = this.state.stores[name];
      }
    } else {
      this.state.bestPrice[card.name] = this.state.stores[name];
    }
  }

  addShop(shopName: string, logo: string) {
    Vue.set(this.state.shops, shopName, new Shop(shopName, logo));
  }

  addToWantlist(cardname: string, amount: number) {
    Vue.set(this.state.wantlist, cardname, amount);
  }

  selectShop(shop: Shop) {
    this.state.currentShop = shop;
  }

  lastErrorHandled() {
    this.state.lastError = "";
  }

  incLoadDone() {
    this.state.loadDone += 1;
  }

  setLoadTotal(value: number) {
    this.state.loadTotal = value;
  }

  resetLoadDone() {
    this.state.loadDone = 0;
  }

  addError(message: string) {
    this.state.lastError = message;
    this.state.errors.push(message);
  }

  setWantlist(wantlist: { [cardname: string]: number }) {
    this.state.wantlist = wantlist;
    this.state.carts.forEach(cart => {
      cart.wantlist = Object.assign({}, wantlist);
    });
  }

  selectStore(store: Store) {
    this.state.selectedStore = store;
  }

  selectCart(index: number) {
    this.state.selectedCart = this.state.carts[index];
    this.initRatings();
  }

  setShopFilter(value: string) {
    this.state.shopFilter = value;
  }

  addCart() {
    const newCart = new Cart();
    this.state.carts.push(newCart);
    this.state.selectedCart = newCart;
  }

  removeCart(id: number) {
    if (this.state.carts.length > 1) {
      if (this.state.carts[id] === this.state.selectedCart) {
        this.selectCart(0);
      }
      this.state.carts.splice(id, 1);
    } else {
      this.addError("Cannot delete all Carts");
    }
  }

  addCardToCart(card: Card) {
    const cart = this.state.selectedCart;
    const store = this.state.selectedStore;
    if (cart.wantlist[card.name] == 0) {
      this.addError("You dont need more of this card");
      return;
    }
    const id = store.name + card.name;
    if (id in cart.items) {
      if (cart.items[id].quantity >= store.cards[card.name].stock) {
        this.addError("Store out of stock;");
        return;
      }
      cart.items[id].quantity += 1;
    } else {
      const item: CartItem = {
        name: card.name,
        price: card.price,
        referral: card.referral,
        store: store.name,
        quantity: 1,
        quality: card.quality
      };
      Vue.set(cart.items, id, item);
    }
    cart.wantlist[card.name] -= 1;
    store.onCart += 1;
  }

  removeItemFromCart(item: CartItem) {
    this.state.selectedCart.wantlist[item.name] += 1;
    const id = item.store + item.name;
    if (this.state.selectedCart.items[id].quantity == 1) {
      Vue.delete(this.state.selectedCart.items, id);
    } else {
      this.state.selectedCart.items[id].quantity -= 1;
    }
    this.state.stores[item.store].onCart -= 1;
  }

  initRatings() {
    const cart = this.state.selectedCart;
    _.forIn(this.state.stores, (store: Store) => {
      store.rating = 0;
      _.forIn(store.cards, (card: Card, name: string) => {
        if (card.stock > this.state.wantlist[name]) {
          store.rating += this.state.wantlist[name];
        } else {
          store.rating += card.stock;
        }
        const id = store.name + name;
        if (id in cart.items) {
          store.rating -= cart.items[id].quantity;
        }
      });
    });
  }
}

class RootGetters extends Getters<RootState>() {
  get isLoadingCards() {
    return this.state.loadDone != this.state.loadTotal;
  }

  get sortedStores(): Array<Store> {
    let sorted: Array<Store> = _.values(this.state.stores);
    sorted.sort((a: Store, b: Store) => {
      return b.rating + b.onCart - (a.rating + a.onCart);
    });
    return sorted;
  }
}

// Declare actions
class RootActions extends Actions<RootState, RootGetters, RootMutations>() {

  async loadCards(cards: { [cardname: string]: number }, count: number) {
    this.mutations.resetLoadDone();
    this.mutations.setLoadTotal(count);
    for (const cardname in cards) {
      this.loadCard(cardname);
      this.mutations.addToWantlist(cardname, count);
    }
  }

  private async loadCard(cardname: string) {
    const result: Array<Store> = [];
    let shopCount = 0;
    try {
      const response: Array<any> = (await axios.get("/api/" + cardname)).data;
      shopCount = response.length;
      if (shopCount == 0) {
        this.mutations.addError(`Card "${cardname}" not found`);
      }
      response.forEach(data => {
        if (!(data["store"] in this.state.shops)) {
          this.mutations.addShop(data["store"], data["logo"])
        }
        const shop = this.state.shops[data["store"]];
        const card = new Card(
          name, data["stock"], data["price"],
          data["quality"], data["ref"], false); //TODO foil
        shop.addCard(card);
      });
    } catch (e) {
      this.mutations.addError(`Failed adding card ${cardname}. Is the server running?`);
    }
    this.mutations.incLoadDone();
  }
}

// Create module by composing state/getters/mutations/actions
export default module({
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions
});

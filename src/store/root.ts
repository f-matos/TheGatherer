import { BaseItem } from "./../models";
import _ from "lodash";
import axios from "axios";
import Vue from "vue";
import { store, module, Getters, Mutations, Actions } from "sinai";
import { Store, Card, Cart, CartItem } from "@/models";

// Declare the module state and its initial value
class RootState {
  stores: { [key: string]: Store } = {};
  lastError: string = "";
  errors: Array<string> = [];
  loadDone = 0;
  loadTotal = 0;
  step = 0;
  wantlist: { [cardname: string]: number } = {};
  selectedStore: Store = {
    name: "",
    logo: "",
    cards: {},
    rating: 0
  };
  carts: Array<Cart> = [
    { wantlist: Object.assign({}, this.wantlist), items: {} }
  ];
  selectedCart: Cart = this.carts[0];
}

// Declare mutations
class RootMutations extends Mutations<RootState>() {
  addCardToStore(name: string, logo: string, card: Card) {
    if (!(name in this.state.stores)) {
      Vue.set(this.state.stores, name, {
        name: name,
        logo: logo,
        cards: {},
        rating: 0
      });
    }
    this.state.stores[name].cards[card.name] = card;
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

  addCart() {
    const newCart = {
      wantlist: Object.assign({}, this.state.wantlist),
      items: {}
    };
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
    store.rating -= 1;
  }

  removeItemFromCart(item: CartItem) {
    this.state.selectedCart.wantlist[item.name] += 1;
    this.state.stores[item.store].rating += 1;
    const id = item.store + item.name;
    if (this.state.selectedCart.items[id].quantity == 1) {
      Vue.delete(this.state.selectedCart.items, id);
    } else {
      this.state.selectedCart.items[id].quantity -= 1;
    }
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

  get sortedStores() {
    let sorted: Array<Store> = _.values(this.state.stores);
    sorted.sort((a: Store, b: Store) => {
      return b.rating - a.rating;
    });
    return sorted;
  }
}

// Declare actions
class RootActions extends Actions<RootState, RootGetters, RootMutations>() {
  updateWantlist(cards: { [cardname: string]: number }, count: number) {
    this.mutations.resetLoadDone();
    this.mutations.setLoadTotal(count);
    let newWantlist: { [cardname: string]: number } = {};
    for (const card in cards) {
      if (card in this.state.wantlist) {
        this.mutations.incLoadDone();
      } else {
        this.loadCard(card);
      }
      newWantlist[card] = cards[card];
    }
    this.mutations.setWantlist(newWantlist);
  }

  private async loadCard(card: string) {
    const result: Array<Store> = [];
    try {
      const data: Array<any> = (await axios.get("/api/" + card)).data;
      data.forEach(store => {
        this.mutations.addCardToStore(store["store"], store["logo"], {
          name: card,
          price: store["price"],
          stock: store["stock"],
          referral: store["ref"],
          quality: store["quality"]
        });
      });
    } catch (e) {
      this.mutations.addError(`Failed adding card ${card}`);
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

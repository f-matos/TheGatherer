import _ from "lodash";
import axios from "axios";
import Vue from "vue";
import { store, module, Getters, Mutations, Actions } from "sinai";
import { Shop, Card, Cart, CartItem } from "@/models";


// Declare the moimport Shop from '@/models/Shop';
//dule state and its initial value
class RootState {
  shops: { [storeName: string]: Shop } = {};
  currentShop!: Shop;
  carts: Array<Cart> = [];
  currentCart: Cart = this.carts[0];

  lastError: string = "";
  errors: Array<string> = [];
  loadDone = 0;
  loadTotal = 0;
  step = 0;
  wantlist: { [cardname: string]: number } = {};
  shopFilter: string = "";
  bestShop: { [cardname: string]: { shop: Shop; price: number } } = {};
}

// Declare mutations
class RootMutations extends Mutations<RootState>() {
  addShop(shopName: string, logo: string) {
    Vue.set(this.state.shops, shopName, new Shop(shopName, logo));
  }

  addToWantlist(cardname: string, amount: number) {
    Vue.set(this.state.wantlist, cardname, amount);
  }

  addCardToShop(shop: Shop, card: Card) {
    Vue.set(shop.cards, card.id, card);
  }

  setBestPrice(cardname: string) {
    if (!(cardname in this.state.bestShop)) {
      Vue.set(this.state.bestShop, cardname, { price: Infinity });
    }
    let bestShop = this.state.bestShop[cardname];
    _.forIn(this.state.shops, (shop: Shop) => {
      _.forIn(shop.cards, card => {
        if (card.name === cardname) {
          if (bestShop.price > card.price) {
            bestShop.shop = shop;
            bestShop.price = card.price;
          }
        }
      });
    });
  }

  selectShop(shop: Shop) {
    Vue.set(this.state, "currentShop", shop);
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

  selectCart(index: number) {
    this.state.currentCart = this.state.carts[index];
  }

  setShopFilter(value: string) {
    this.state.shopFilter = value;
  }

  addCart() {
    const newCart = new Cart();
    this.state.carts.push(newCart);
    this.state.currentCart = newCart;
  }

  removeCart(id: number) {
    if (this.state.carts.length > 1) {
      if (this.state.carts[id] === this.state.currentCart) {
        this.selectCart(0);
      }
      this.state.carts.splice(id, 1);
    } else {
      this.addError("Cannot delete all Carts");
    }
  }

  addItemToCart(card: Card) {
    const cart = this.state.currentCart;
    const shop = this.state.currentShop;
    if (card.id in cart.items) {
      if (cart.items[card.id].amount == this.state.wantlist[card.name]) {
        this.addError("You dont need more of this card");
        return;
      }
      if (cart.items[card.id].shops[shop.name] == shop.cards[card.id].stock) {
        this.addError("Store out of stock;");
        return;
      }
    }
    cart.addItem(card, 1);
  }

  removeItemFromCart(card: Card) {
    this.state.currentCart.removeItem(card, 1);
  }
}

class RootGetters extends Getters<RootState>() {
  get isLoadingCards() {
    return this.state.loadDone != this.state.loadTotal;
  }
}

// Declare actions
class RootActions extends Actions<RootState, RootGetters, RootMutations>() {
  async loadCards(cards: { [cardname: string]: number }, count: number) {
    this.mutations.resetLoadDone();
    this.mutations.setLoadTotal(count);
    _.forIn(cards, (amount, cardname) => {
      this.loadCard(cardname);
      this.mutations.addToWantlist(cardname, amount);
    });
    this.mutations.addCart();
  }

  private async loadCard(cardname: string) {
    try {
      const response: Array<any> = (await axios.get("/api/" + cardname)).data;
      if (response.length == 0) {
        this.mutations.addError(`Card "${cardname}" not found`);
      }
      response.forEach(data => {
        if (!(data["store"] in this.state.shops)) {
          this.mutations.addShop(data["store"], data["logo"]);
        }
        const shop = this.state.shops[data["store"]];
        const card = new Card(
          shop,
          cardname,
          data["stock"],
          data["price"],
          data["quality"],
          data["ref"],
          false
        ); //TODO foil
        this.mutations.addCardToShop(shop, card);
      });
      this.mutations.setBestPrice(cardname);
    } catch (e) {
      this.mutations.addError(
        `Failed adding card ${cardname}. Is the server running?`
      );
    }
    this.mutations.incLoadDone();
  }
}

// Create module by composing state/getters/mutations/actions
export default module({
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions,
});

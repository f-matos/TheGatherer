import _ from "lodash";
import axios from "axios";
import Vue from "vue";
import { store, module, Getters, Mutations, Actions } from "sinai";
import { Shop, Card, Cart, Wantlist, ShopCard, CartCard, WantlistCard } from "@/models";


// Declare the moimport Shop from '@/models/Shop';
//dule state and its initial value
class RootState {
  shops: Array<Shop> = [];
  currentShop: Shop = this.shops[0];
  carts: Array<Cart> = [];
  currentCart: Cart = this.carts[0];

  lastError: string = "";
  errors: Array<string> = [];

  loadDone = 0;
  loadTotal = 0;

  filters: any = {
    cardname: "",
    shopname: "",
    maxPrice: Infinity,
    minPrice: 0
  }

  wantlist: Wantlist = { cards: [], missing: [] };

  shopFilter: string = "";

  bestShop: { [cardname: string]: { shop: Shop; price: number } } = {};
}

// Declare mutations
class RootMutations extends Mutations<RootState>() {
  addShop(shopName: string, logo: string) {
    const shop = new Shop(shopName, logo)
    this.state.shops.push(shop);
  }

  resetWantlist() {
    this.state.wantlist = new Wantlist();
  }

  addToWantlist(cardname: string, amount: number) {
    this.state.wantlist.cards.push(new WantlistCard(cardname, amount));
  }

  addCardToShop(shop: Shop, card: Card, stock: number) {
    shop.cards.push(new ShopCard(card, stock))
  }

  setBestPrice(cardname: string) {
    if (!(cardname in this.state.bestShop)) {
      Vue.set(this.state.bestShop, cardname, { price: Infinity });
    }
    let bestShop = this.state.bestShop[cardname];
    this.state.shops.forEach(shop => {
      shop.cards.forEach(shopCard => {
        const card = shopCard.card;
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

  setCardnameFilter(name: string) {
    this.state.filters.cardname = name;
  }

  setShopnameFilter(name: string) {
    this.state.filters.shopname = name;
  }

  setMaxPrice(value: number) {
    if (_.isNaN(value)) {
      this.state.filters.maxPrice = Infinity;
    } else {
      this.state.filters.maxPrice = value;
    }
  }

  setMinPrice(value: number) {
    if (_.isNaN(value)) {
      this.state.filters.minPrice = 0;
    } else {
      this.state.filters.minPrice = value;
    }
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
    cart.addItem(card, shop, 1);
  }

  removeItemFromCart(cartCard: CartCard) {
    this.state.currentCart.removeItem(cartCard, 1);
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
    this.mutations.resetWantlist();
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
        let shop = _.find(this.state.shops, s => s.name === data["store"]);
        if (shop == null) {
          this.mutations.addShop(data["store"], data["logo"]);
          shop = this.state.shops[this.state.shops.length - 1];
        }
        const card = new Card(
          cardname,
          data["price"],
          data["quality"],
          data["ref"],
          false
        ); //TODO foil
        this.mutations.addCardToShop(shop, card, data["stock"]);
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

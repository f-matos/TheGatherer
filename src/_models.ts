export interface BaseItem {
  name: string;
  price: number;
  referral: string;
  quality: string;
}

export interface Card extends BaseItem {
  stock: number;
}

export interface Store {
  name: string;
  logo: string;
  cards: { [cardname: string]: Card };
  rating: number;
  onCart: number;
}

export interface Cart {
  wantlist: { [cardname: string]: number };
  items: { [key: string]: CartItem };
}

export interface CartItem extends BaseItem {
  store: string;
  quantity: number;
}

export let formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2
  // the default value for minimumFractionDigits depends on the currency
  // and is usually already 2
});

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
}

export interface Cart {
  wantlist: { [cardname: string]: number };
  items: { [key: string]: CartItem };
}

export interface CartItem extends BaseItem {
  store: string;
  quantity: number;
}

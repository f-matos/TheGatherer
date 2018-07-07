export interface Card {
    name: string
    price: number
    stock: number
}

export interface Store {
    name: string
    logo: string
    cards: {[cardname: string]: Card}
    rating: number
}

export interface Cart {
    wantlist: {[cardname: string]:number}
    items: {[key: string]: CartItem}
}

export interface CartItem {
    name: string
    price: number
    store: string
    quantity: number
}

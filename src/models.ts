export interface Card {
    name: string
    price: number
    stock: number
}

export interface Store {
    name: string
    cards: Array<Card>
}
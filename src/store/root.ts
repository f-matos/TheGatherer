import axios from 'axios'
import Vue from 'vue'
import { store, module, Getters, Mutations, Actions } from 'sinai'
import { Store, Card, Cart, CartItem } from '@/models';

// Declare the module state and its initial value
class RootState {
    stores: { [key: string]: Store } = {}
    lastError: string = ""
    errors: Array<string> = []
    loadDone = 0
    loadTotal = 0
    step = 0
    wantlist: {[cardname: string]:number} = {}
    selectedStore: Store = {name: '', logo: '', cards: {}, rating: 0}
    carts: Array<Cart> = [{wantlist: Object.assign({},this.wantlist), items:{}}]
    selectedCart: Cart = this.carts[0]
}

// Declare mutations
class CounterMutations extends Mutations<RootState>() {

    addCardToStore(name: string, logo:string, card: Card) {
        if (!(name in this.state.stores)) {
            Vue.set(this.state.stores, name, { 'name': name, 'logo': logo, cards: {}, rating: 0 })
        }
        this.state.stores[name].cards[card.name] = card
    }

    lastErrorHandled(){
        this.state.lastError = ""
    }

    incLoadDone() {
        this.state.loadDone += 1
    }

    setLoadTotal(value: number) {
        this.state.loadTotal = value
    }

    resetLoadDone() {
        this.state.loadDone = 0
    }

    addError(message: string) {
        this.state.lastError = message;
        this.state.errors.push(message)
    }

    setWantlist(wantlist: {[cardname: string]:number}){
        this.state.wantlist = wantlist
        this.state.carts.forEach(cart => {
            cart.wantlist = Object.assign({}, wantlist)
        })
    }

    selectStore(store: Store){
        this.state.selectedStore = store
    }

    selectCart(cart: Cart){
        this.state.selectedCart = cart
    }

    addCart(){
        const newCart = {
            wantlist: Object.assign({}, this.state.wantlist),
            items: {}
        }
        this.state.carts.push(newCart)
        this.state.selectedCart = newCart
    }

    removeCart(id: number){
        if(id > 0){
            if(this.state.carts[id] === this.state.selectedCart){
                this.selectCart(this.state.carts[0])
            }
            this.state.carts.splice(id, 1)
        }else{
            this.addError("Cannot delete Cart 0")
        }
    }

    addCardToCart(card: Card){
        if(this.state.selectedCart.wantlist[card.name] == 0){
            this.addError("You dont need more of this card")
            return;
        }
        const id = this.state.selectedStore.name + card.name
        if(id in this.state.selectedCart.items){
            if(this.state.selectedCart.wantlist[card.name] == 0){
                this.addError("You dont need more of this card")
                return;
            }
            this.state.selectedCart.items[id].quantity += 1
        }else{
            const item: CartItem = {
                name: card.name,
                price: card.price,
                store: this.state.selectedStore.name,
                quantity: 1
            }
            Vue.set(this.state.selectedCart.items, id, item)
        }
        this.updateCartWantList(card)
    }

    removeCardFromCart(card: Card){
        this.state.selectedCart.wantlist[card.name] += 1
        const id = this.state.selectedStore.name + card.name
        if(this.state.selectedCart.items[id].quantity == 1){
            Vue.delete(this.state.selectedCart.items, id)
        }else{
            this.state.selectedCart.items[id].quantity -= 1
        }

    }

    updateCartWantList(card: Card){
        this.state.selectedCart.wantlist[card.name] -= 1
    }
}

class CounterGetters extends Getters<RootState>() {
    get isLoadingCards() {
        return this.state.loadDone != this.state.loadTotal
    }

    get sortedStores() {
        let sorted: Array<Store> = []
        for(const key in this.state.stores){
            const store = this.state.stores[key]
            store.rating = 0
            const wantlist = this.state.selectedCart.wantlist
            for(const card in store.cards){
                if(card in wantlist){
                    if(store.cards[card].stock > wantlist[card]){
                        store.rating += wantlist[card]
                    }else{
                        store.rating += store.cards[card].stock
                    }
                }
            }
            sorted.push(store)
        }
        sorted.sort((a: Store, b: Store) => {
            return b.rating - a.rating
        })
        return sorted
    }
}

// Declare actions
class CounterActions extends Actions<RootState, CounterGetters, CounterMutations>() {

    updateWantlist(cards: {[cardname: string]:number}, count: number){
        this.state.step = 1
        this.mutations.resetLoadDone()
        this.mutations.setLoadTotal(count)
        let newWantlist: {[cardname: string]:number} = {}
        for(const card in cards){
            if(card in this.state.wantlist){
                this.mutations.incLoadDone()
            }else{
                this.loadCard(card)
            }
            newWantlist[card] = cards[card]
        }
        this.mutations.setWantlist(newWantlist)
    }

    private async loadCard(card: string) {
        const result: Array<Store> = []
        try{
            const data: Array<any> = (await axios.get("/api/" + card)).data
            data.forEach(store => {
                this.mutations.addCardToStore(store["store"], store["logo"], {
                    name: card,
                    'price': store["price"],
                    'stock': store["stock"],
                })
            })
        }catch(e){
            this.mutations.addError(`Failed adding card ${card}`)
        }
        this.mutations.incLoadDone()
    }


}

// Create module by composing state/getters/mutations/actions
export default module({
    state: RootState,
    getters: CounterGetters,
    mutations: CounterMutations,
    actions: CounterActions
})

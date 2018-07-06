import axios from 'axios'
import Vue from 'vue'
import { store, module, Getters, Mutations, Actions } from 'sinai'
import { Store, Card } from '@/models';

// Declare the module state and its initial value
class RootState {
    stores: { [key: string]: Store } = {}
    cards: Array<string> = []
    lastError: string = ""
    loadDone = 0
    loadTotal = 0
    step = 0
}

// Declare mutations
class CounterMutations extends Mutations<RootState>() {

    addCardToStore(name: string, card: Card) {
        if (!(name in this.state.stores)) {
            Vue.set(this.state.stores, name, { 'name': name, cards: [] })
        }
        this.state.stores[name].cards.push(card)
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
}

class CounterGetters extends Getters<RootState>() {
    get isLoadingCards() {
        return this.state.loadDone != this.state.loadTotal
    }
}

// Declare actions
class CounterActions extends Actions<RootState, CounterGetters, CounterMutations>() {
    addError(message: string) {
        this.state.lastError = message;
    }

    updateCards(cards: Array<string>) {
        this.state.step = 1
        const oldCards = this.state.cards
        const newCards: Array<string> = []
        cards.forEach(card => {
            newCards.push(card)
        })
        this.mutations.setLoadTotal(cards.length)
        this.mutations.resetLoadDone()
        this.loadCards(newCards)
        this.state.cards = newCards;
    }

    /*
    private parseResponse(card: string, data: string) {
        const html = document.createElement('html')
        html.innerHTML = data
        const doc: Document = new Document()
        doc.appendChild(html)

        const aba = doc.getElementById('aba-cards')
        if (aba == null) {
            this.addError(`Card "${card}" not found`)
            return;
        }
        const price_string = doc.getElementsByClassName('e-col3')[0].innerHTML
        const m = /R\$ ([0-9]+),([0-9]+)$/.exec(price_string)
        let price = -1
        if (m != null) {
            price = parseFloat(m[1] + '.' + m[2])
        } else {
            this.addError(`"${card}" returned null`)
            return;
        }
        const store_string = doc.getElementsByClassName('e-col1')[0].getElementsByTagName('a')[0].getElementsByTagName('img')[0].getAttribute('title')
        if (store_string != null) {
            this.addCardToStore(store_string, {
                'name': card,
                'price': price,
                'stock': 10
            })
        } else {
            this.addError(`"${card}": Failed getting store`)
            return;
        }
    }*/

    private async loadCards(cards: Array<string>) {
        const result: Array<Store> = []
        //const baseURL = "https://www.ligamagic.com.br/?view=cards/card&card="

        cards.forEach(async card => {
            const data: Array<any> = (await axios.get("/api/" + card)).data
            data.forEach(store => {
                this.mutations.addCardToStore(store[0], {
                    name: card,
                    'price': store[1],
                    'stock': 10
                })
            })
            this.mutations.incLoadDone()
        })
    }


}

// Create module by composing state/getters/mutations/actions
export default module({
    state: RootState,
    getters: CounterGetters,
    mutations: CounterMutations,
    actions: CounterActions
})
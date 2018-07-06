import { store, module, Getters, Mutations, Actions } from 'sinai'

// Declare the module state and its initial value
class CounterState {
    count = 0
}

// Declare getters
class CounterGetters extends Getters<CounterState>() {
    get half() {
        return this.state.count / 2
    }
}

// Declare mutations
class CounterMutations extends Mutations<CounterState>() {
    inc() {
        this.state.count += 1
    }

    dec() {
        this.state.count -= 1
    }
}

// Declare actions
class CounterActions extends Actions<CounterState, CounterGetters, CounterMutations>() {
    asyncInc(ms: number) {
        console.log('count: ' + this.state.count)
        console.log('half: ' + this.getters.half)

        return new Promise(resolve => {
            setTimeout(() => {
                this.mutations.inc()
                resolve()
            }, ms)
        })
    }
}

// Create module by composing state/getters/mutations/actions
export default module({
    state: CounterState,
    getters: CounterGetters,
    mutations: CounterMutations,
    actions: CounterActions
})
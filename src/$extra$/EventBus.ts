export class EventBus {
    #events: Map<string, Set<Function>> = new Map([]);

    //
    constructor() {
        this.#events = new Map([]);
    }

    //
    off(name, cb) {
        if (this.#events.has(name)) {
            this.#events.get(name)?.delete?.(cb);
        }
        return this;
    }

    //
    on(name, cb) {
        if (!this.#events.has(name)) {
            this.#events.set(name, new Set([]));
        }
        this.#events.get(name)?.add?.(cb);
        return this;
    }

    //
    fire(name, args = {}) {
        const results = Array.from(this.#events.get(name)?.values?.() || [])?.map?.((cb, I)=>{
            return cb(args, I);
        });
        return results;
    }
};

//
const eventBus = new EventBus();
export default eventBus;

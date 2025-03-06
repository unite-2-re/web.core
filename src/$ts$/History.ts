export default class State {
    static $story = new Array();

    //
    constructor() {}

    //
    static pushState(obj, href) {
        if (location.hash == href) return;

        //
        const prevState = this.$story.at(this.$story.length - 1) ?? null;
        const state = [obj, "", href];

        // @ts-ignore
        history.pushState(...state);
        this.$story.push(state);

        //
        window.dispatchEvent(
            new CustomEvent("u2-push-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );

        //
        window.dispatchEvent(
            new CustomEvent("u2-change-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );
    }

    //
    static replaceState(obj, href) {
        this.back();
        this.pushState(obj, href);
    }

    //
    static back() {
        const prevState = this.$story.at(this.$story.length - 1) ?? null;
        history.back();
        this.$story.pop();
        const state = this.$story.at(this.$story.length - 1) ?? null;

        //
        window.dispatchEvent(
            new CustomEvent("u2-pop-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );

        //
        window.dispatchEvent(
            new CustomEvent("u2-change-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );
    }
}

// deprecated...
export const initHistory = ()=>{
    addEventListener("popstate", _ => {
        const prevState = State.$story.at(State.$story.length - 1) ?? null;
        State.$story.pop();
        const state = State.$story.at(State.$story.length - 1) ?? null;

        window.dispatchEvent(
            new CustomEvent("u2-pop-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );

        window.dispatchEvent(
            new CustomEvent("u2-change-state", {
                detail: {
                    prevState,
                    state,
                },
            })
        );
    });
}

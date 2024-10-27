// TODO! Needs it?
//import "core-js";
//import "css-doodle";

//
(async()=>{
    // avoid any dragging when no-needed...
    document.documentElement.addEventListener("dragstart", (ev) => {
        if ((ev?.target as HTMLElement)?.matches?.("div, img, picture, canvas, video, svg")) {
            ev.preventDefault();
        }
    }, {passive: false, capture: true});

    // comment to enable native context menu
    document.documentElement.addEventListener("contextmenu", (ev)=>{
        ev.stopPropagation();
        ev.preventDefault();
    }, {capture: true});

    //
    if ("virtualKeyboard" in navigator && navigator?.virtualKeyboard) {
        // @ts-ignore
        navigator.virtualKeyboard.overlaysContent = true;
    }

    // TODO!
    /*if (typeof navigator != "undefined") {
        await navigator?.serviceWorker?.register?.(new URL("./service.mjs", import.meta.url).href, {scope: "/"})?.catch?.(console.warn.bind(console));
    }*/

})();

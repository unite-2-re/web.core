

//
const provide = async (path = "") => {
    path = path?.url ?? path;
    const relPath = path.replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        const params = relPath.split(/\?/i)?.[1] || relPath;
        const $path = new URLSearchParams(params).get("path");
        const parts = $path?.split?.("/") || $path || "";

        //
        let dir = await navigator?.storage
            ?.getDirectory?.()
            ?.catch?.(console.warn.bind(console));
        for (let I = 0; I < parts.length - 1; I++) {
            if (!parts[I]) continue;
            dir = await dir
                ?.getDirectoryHandle?.(parts[I], { create: false })
                ?.catch?.(console.warn.bind(console));
            if (!dir) break;
        }

        //
        const fileh = await dir?.getFileHandle?.(parts[parts.length - 1], {
            create: false,
        });
        return await fileh?.getFile?.();
    } else if (relPath.startsWith("/")) {
        return fetch(path);
    }
    return null;
};

// Config
const NETWORK_TIMEOUT_MS = 6000; // hosting, amvera
//const NETWORK_TIMEOUT_MS = 3000; //localhost, router
const RUNTIME = "idc-ls";

//
const isSameOrigin = (urlString) => {
    const urlOrigin = new URL(urlString).origin;
    return urlOrigin.startsWith(self.location.origin);
};

//
const _WARN_ = (...args) => {
    const real = args.filter((v) => v != null);
    if (real && real.length > 0) {
        console.warn(...real);
    }
    //return args[0];
    return null;
};

//
const tryFetch = (req, event) => {
    const sendResponse = async (response) => {
        let resp = (await response)?.clone?.()?.catch?.((e)=>{
            console.warn(e);
            return response;
        }) || (await response);
        if (!(resp instanceof Response)) { throw Error("Invalid Response"); };
        caches.open(RUNTIME).then(async (c)=>c.add(await resp).catch(_WARN_));
        return resp;
    };

    //
    {
        // @ts-ignore
        const ctime = !navigator.onLine || (navigator?.connection?.effectiveType == "slow-2g") ? 1000 : NETWORK_TIMEOUT_MS;
        const fc = new Promise((resolve, reject) =>setTimeout(() => reject(null), ctime)).catch(_WARN_);
        const fp = fetch(req, {
            //cache: "no-store",
            signal: AbortSignal.timeout(ctime + 2000),
            mode: (req?.url ?? req).startsWith("http:") ? "no-cors" : (isSameOrigin(req?.url ?? req) ? "same-origin" : "cors"),
        }).then(sendResponse).catch(_WARN_);

        //
        return Promise.race([fp, fc]).catch((_) => null);
    }
};

//
const fit = (req, event) => {

    //
    const relPath = (req?.url ?? req).replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        const preload = (async () => {
            const filex = provide(relPath);
            const result = sendResponse(new Response(await filex)).catch(console.warn.bind(console));
            return result;
        })();
        event?.waitUntil?.(preload);
        return preload;
    }

    //
    const loading = (async ()=>{
        for (let i = 0; i < 3; i++) {
            try {
                const resp = await tryFetch(req, event);
                if (await resp) { return resp; }
            } catch (e) {
                console.warn(e);
            }
            console.warn("Attempt: " + i + ", failed, trying again...");
        }
        return null;
    })();

    //
    const cached = caches.open(RUNTIME).then((c) => c.match(req, {
            ignoreSearch: true,
            ignoreMethod: true,
            ignoreVary: true,
        })
    ).catch(()=>null);

    //
    event?.waitUntil?.(cached);

    //
    const anyone = loading.then((r)=>(r||cached)).catch(()=>cached);
    anyone.then(()=>self.skipWaiting())
    return anyone?.then?.((resp)=>{
        if (!(resp instanceof Response)) { throw Error("Invalid Response"); };
        return resp;
    });
};

//
const putCacheAll = (list) => {
    return Promise.allSettled(
        list.map(async (it) => {
            const cache = await caches.open(RUNTIME);
            return cache.add(it);
        })
    ).catch(_WARN_);
};

//
const preloadNeeded = (list) => {
    const cache = putCacheAll(list);
    cache.then(()=>self.skipWaiting());
    return cache;
};

//
const PRE_CACHE_FORCE = [
].map((u) => new URL(u, self.location.origin).href);

//
self?.addEventListener?.("install", (event) => {
    event.waitUntil(preloadNeeded([...PRE_CACHE_FORCE]));
    self.skipWaiting();
});

//
self?.addEventListener?.('activate', (event) => {
    const claims = self.clients.claim();
    claims.then(()=>self.skipWaiting())
    event.waitUntil(claims);
});

//
self?.addEventListener?.('fetch', (event) => {
    event.respondWith(fit(event.request, event));
});

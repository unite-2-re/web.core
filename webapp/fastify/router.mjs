import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import fs from "fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import zlib from "node:zlib"

//
const probeDirectory = async (dirList, agr = "local/", testFile = "certificate.crt") => {
    for (const dir of dirList) {
        const check = await fs
            .stat(path.resolve(import.meta.dirname, dir + agr, testFile))
            .catch(() => false);
        if (check) {
            return path.resolve(import.meta.dirname, dir);
        }
    }
    return path.resolve(import.meta.dirname, dirList[0]);
};

//
const __dirname = (await probeDirectory(["../../webapp/index", "../webapp/index", "./webapp/index"], "./", "index.html"));

//
export default async function (fastify, options) {
    //
    await fastify.register(import("@fastify/compress"), {
        global: true,
        inflateIfDeflated: true,
        encodings: ["deflate", "gzip", "brotli"],
        brotliOptions: {
            params: {
                [zlib.constants.BROTLI_PARAM_MODE]:
                    zlib.constants.BROTLI_MODE_TEXT,
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
        },
        zlibOptions: { level: 9 },
    });

    //
    const cacheControl = [
        `no-store`,
        `public`,
        `proxy-revalidate`,
        `must-revalidate`,
        `max-age=10800`,
        `stale-while-revalidate=86400`,
        `stale-if-error=86400`,
        `max-stale=86400`,
    ].join(", ");

    //
    fastify.addHook("onSend", function (req, reply, payload, next) {
        reply.header("Cross-Origin-Embedder-Policy", "require-corp");
        reply.header("Cross-Origin-Opener-Policy", "same-origin");
        reply.header("Access-Control-Allow-Methods", "*");
        reply.header("Access-Control-Allow-Origin", "*");
        reply.header("Access-Control-Allow-Headers", "Cache-Control, Origin, X-Requested-With, Content-Type, Accept, Service-Worker-Allowed, X-Access-Secret, X-Access-Key");
        reply.header(
            "Permissions-Policy",
            [
                "storage-access=*",
                "fullscreen=*",
                "gyroscope=*",
                "window-management=*",
                "picture-in-picture=*",
                "magnetometer=*",
                "execution-while-out-of-viewport=*",
                "execution-while-not-rendered=*",
                "document-domain=*",
                "accelerometer=*",
                "display-capture=*",
                "serial=*",
            ].join(", ")
        );
        reply.header("Cache-Control", cacheControl);
        if (
            req.routeOptions.url.includes("assets/") ||
            req.routeOptions.url.includes("/assets") || 
            req.routeOptions.url.includes(".mjs") || 
            req.routeOptions.url.includes(".js")
        ) {
            reply.header("Service-Worker-Allowed", "/");
        }
        reply.removeHeader("Clear-Site-Data");
        next();
    });

    //
    fastify.register(cors, {
        hook: "preHandler",
        delegator: (req, callback) => {
            const corsOptions = { origin: false };
            callback(null, corsOptions);
        },
        origin: "*",
        allowedHeaders:
            "Cache-Control, Origin, X-Requested-With, Content-Type, Accept, Service-Worker-Allowed, X-Access-Secret, X-Access-Key",
        cacheControl,
    });

    //
    fastify.register(fastifyStatic, {
        prefix: "/assets/",
        root: path.join(__dirname, "assets/"),
        decorateReply: false,
        list: true,
    });

    //
    fastify.register(fastifyStatic, {
        prefix: `/modules/`,
        root: path.join(__dirname, `modules/`),
        decorateReply: false,
        list: true,
    });

    //
    fastify.register(fastifyStatic, {
        prefix: "/",
        root: path.join(__dirname, ""),
        decorateReply: true,
        list: true,
    });
}

//
let port = 443;
if (Array.from(process.argv).some((e) => e.endsWith("port"))) {
    const index = Array.from(process.argv).findIndex((e) => e.endsWith("port"));
    port = parseInt(process.argv[index + 1]);
}

//
export const options = {
    esm: true,
    debug: true,
    logger: true,
    ignoreTrailingSlash: true,
    port,
    https: Array.from(process.argv).some((e) => e.endsWith("no-https"))
        ? null
        : (await import("file://" + (await probeDirectory(["../../https/", "../https/", "./https/"]) + "/certificate.mjs"))).default,
    address: "0.0.0.0",
    host: "0.0.0.0",
};

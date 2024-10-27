import fs from "node:fs/promises"
import path from "node:path"

//
const probeDirectory = async (dirList, agr = "local/") => {
    for (const dir of dirList) {
        const check = await fs
            .stat(path.resolve(import.meta.dirname, dir + agr, "certificate.crt"))
            .catch(() => false);
        if (check) {
            return path.resolve(import.meta.dirname, dir);
        }
    }
    return path.resolve(import.meta.dirname, dirList[0]);
};

//
const probe = await probeDirectory([
    "./",
    "./webapp/https/",
    "../webapp/https/",
], "local/");

//
const local = await probeDirectory([
    path.resolve(probe, "./private/"),
    path.resolve(probe, "./local/")
], "");

//
const loadFile = async (lfile)=>{
    const fx = await fs.readFile(path.resolve(probe, lfile))
    return fx;
}

//
export default {
    ca: await loadFile(path.resolve(local, "./certificate_ca.crt")),
    key: await loadFile(path.resolve(local, "./certificate.key")),
    cert: await loadFile(path.resolve(local, "./certificate.crt"))
};

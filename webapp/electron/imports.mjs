import fs from "node:fs/promises"
import path from "node:path"

//
const probeDirectory = async (dirList, agr = "") => {
    for (const dir of dirList) {
        const check = await fs
            .stat(path.resolve(import.meta.dirname, dir + agr, "index.html"))
            .catch(() => false);
        if (check) {
            return path.resolve(import.meta.dirname, dir);
        }
    }
    return path.resolve(import.meta.dirname, dirList[0]);
};

//
export default {"@webapp": probeDirectory(["../index/", "./index/", "../../webapp/index/", "../webapp/index/", "./webapp/index/"]) };

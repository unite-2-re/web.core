// @ts-ignore
import styles from "./$scss$/_Module.scss?inline&compress";

// @ts-ignore /* @vite-ignore */
import {importCdn} from "/externals/modules/cdnImport.mjs";
export {importCdn};

//
const initialize = async ()=>{
    // @ts-ignore
    const {loadBlobStyle} = await Promise.try(importCdn, ["/externals/lib/dom.js"]);
    loadBlobStyle(styles);
}

//
export default initialize;

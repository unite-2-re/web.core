//
export * from "./$ts$/TaskManager";

// @ts-ignore
import styles from "./$scss$/_Module.scss?inline&compress";

// @ts-ignore
import { loadBlobStyle } from "/externals/lib/dom.js";

//
const initialize = ()=>{
    loadBlobStyle(styles);
}

//
export default initialize;

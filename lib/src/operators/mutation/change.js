import { changeProps } from "../../change_props";
import { ensureArray, isObject, Ok } from "../../utils";
export function $change(source, modifiers, query, collection) {
    let mods = ensureArray(modifiers);
    mods.forEach((mod) => {
        if (!isObject(mod) && !Array.isArray(mod)) {
            let obj = {};
            Ok(query).forEach((key) => {
                obj[key] = mod;
            });
            source = changeProps(source, query, obj, false);
        }
        else {
            source = changeProps(source, query, mod, false);
        }
    });
    return source;
}

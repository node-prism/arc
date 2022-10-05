import { appendProps } from "../../append_props";
import { ensureArray } from "../../utils";
export function $merge(source, modifiers, query, collection) {
    const mods = ensureArray(modifiers);
    mods.forEach((mod) => {
        source = appendProps(source, query, mod, true);
    });
    return source;
}

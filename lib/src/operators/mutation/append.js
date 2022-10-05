import { appendProps } from "../../append_props";
import { ensureArray } from "../../utils";
export function $append(source, modifiers, query, collection) {
    const mods = ensureArray(modifiers);
    mods.forEach((mod) => {
        source = appendProps(source, query, mod);
    });
    return source;
}

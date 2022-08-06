import _ from "lodash";
import { ensureArray } from "../../utils";
export function $unset(source, modifiers, query, collection) {
    let mods = ensureArray(modifiers);
    mods.forEach((mod) => {
        // { $unset: ["a", "b.c.d"] }
        if (Array.isArray(mod)) {
            return $unset(source, mod, query, collection);
        }
        // { $unset: "a" } or { $unset: "a.b.c" }
        source = source.map((document) => {
            return _.set(document, mod, undefined);
        });
    });
    return source;
}

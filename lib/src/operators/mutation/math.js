import { ID_KEY } from "../..";
import { returnFound } from "../../return_found";
import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";
var Op;
(function (Op) {
    Op[Op["Inc"] = 0] = "Inc";
    Op[Op["Dec"] = 1] = "Dec";
    Op[Op["Mult"] = 2] = "Mult";
    Op[Op["Div"] = 3] = "Div";
})(Op || (Op = {}));
function math(source, modifiers, query, op, collection) {
    let mods = ensureArray(modifiers);
    let operable = returnFound(source, query, {
        deep: true,
        returnKey: ID_KEY,
        clonedData: false,
    });
    mods.forEach((mod) => {
        // update({ a: 1 }, { $inc: { visits: 1 } })
        // in this case, a is not incremented, only `visits` is.
        if (isObject(mod)) {
            Ok(mod).forEach((target) => {
                operable.forEach((item) => {
                    // Operable items were found with returnKey ID_KEY, so they're top-level documents.
                    // Here, we specify a returnKey of the property defined by the operation so that we can
                    // target a specific property.
                    const z = returnFound([item], query, { returnKey: target, deep: true, clonedData: false });
                    const iterables = z?.length ? z : operable;
                    iterables.forEach((zz) => {
                        if (safeHasOwnProperty(zz, target)) {
                            if (op === Op.Inc) {
                                zz[target] += mod[target];
                            }
                            else if (op === Op.Dec) {
                                zz[target] -= mod[target];
                            }
                            else if (op === Op.Mult) {
                                zz[target] *= mod[target];
                            }
                            else if (op === Op.Div) {
                                zz[target] /= mod[target];
                            }
                        }
                        else {
                            // Search again against these iterables for the target property, because we don't know
                            // what level it's going to be at. We default to the first property of the query object as
                            // the returnKey.
                            const altReturnKey = Ok(query)[0];
                            const found = returnFound([zz], query, { returnKey: altReturnKey, deep: true, clonedData: false });
                            if (found) {
                                found.forEach((f) => {
                                    if (op === Op.Inc) {
                                        f[target] = mod[target];
                                    }
                                    else if (op === Op.Dec) {
                                        f[target] = -mod[target];
                                    }
                                    else if (op === Op.Mult) {
                                        f[target] = mod[target];
                                    }
                                    else if (op === Op.Div) {
                                        f[target] = 1 / mod[target];
                                    }
                                });
                            }
                        }
                    });
                });
            });
        }
        // update({ a: 2, b: 2 }, { $inc: 1 })
        // in this case, a and b are both incremented by 1.
        if (!isObject(mod)) {
            if (!operable || !operable.length)
                return;
            // We want to operate on each property defined in the query.
            Ok(query).forEach((target) => {
                operable.forEach((item) => {
                    const z = returnFound([item], query, { returnKey: target, deep: true, clonedData: false });
                    const iterables = z?.length ? z : operable;
                    iterables.forEach((zz) => {
                        if (safeHasOwnProperty(zz, target)) {
                            if (op === Op.Inc) {
                                zz[target] += mod;
                            }
                            else if (op === Op.Dec) {
                                zz[target] -= mod;
                            }
                            else if (op === Op.Mult) {
                                zz[target] *= mod;
                            }
                            else if (op === Op.Div) {
                                zz[target] /= mod;
                            }
                        }
                        else {
                            if (op === Op.Inc) {
                                zz[target] = mod;
                            }
                            else if (op === Op.Dec) {
                                zz[target] = -mod;
                            }
                            else if (op === Op.Mult) {
                                zz[target] = mod;
                            }
                            else if (op === Op.Div) {
                                zz[target] = 1 / mod;
                            }
                        }
                    });
                });
            });
        }
    });
    return source;
}
export function $inc(source, modifiers, query, collection) {
    source = math(source, modifiers, query, Op.Inc, collection);
    return source;
}
export function $dec(source, modifiers, query, collection) {
    source = math(source, modifiers, query, Op.Dec, collection);
    return source;
}
export function $mult(source, modifiers, query, collection) {
    source = math(source, modifiers, query, Op.Mult, collection);
    return source;
}
export function $div(source, modifiers, query, collection) {
    source = math(source, modifiers, query, Op.Div, collection);
    return source;
}

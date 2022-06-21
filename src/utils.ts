export function ensureArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  else if (input === undefined || input === null) return [];
  else return [input];
};

export function isObject(item: any): item is object {
  return !!item && Object.prototype.toString.call(item) === "[object Object]";
}

export function isEmptyObject(item: any) {
  return isObject(item) && Ok(item).length === 0;
}

export const Ov = Object.values;
export const Ok = Object.keys;

export const safeHasOwnProperty = (obj: object, prop: string) => (obj ? Object.prototype.hasOwnProperty.call(obj, prop) : false);

export function isFunction(item: any) {
  return typeof item === "function";
}

/**
 * Recursively removes empty objects from an object.
 *
 * @example
 * ```
 * {  a: { b: 1, c: { d: { e: {} } } } }
 * becomes
 * { a: { b: 1 } }
 * ```
 */
export function deeplyRemoveEmptyObjects(o: object) {
  if (!isObject(o)) return o;

  Ok(o).forEach((k) => {
    if (!o[k] || !isObject(o[k])) return;
    deeplyRemoveEmptyObjects(o[k]);
    if (Ok(o[k]).length === 0) delete o[k];
  });

  return o;
}

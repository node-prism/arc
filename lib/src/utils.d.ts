export declare function ensureArray(input: any): any[];
export declare function isObject(item: any): item is object;
export declare function isEmptyObject(item: any): boolean;
export declare const Ov: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): T[];
    (o: {}): any[];
};
export declare const Ok: {
    (o: object): string[];
    (o: {}): string[];
};
export declare const safeHasOwnProperty: (obj: object, prop: string) => any;
export declare function isFunction(item: any): boolean;
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
export declare function deeplyRemoveEmptyObjects(o: object): object;

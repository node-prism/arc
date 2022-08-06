import _ from "lodash";
import { ID_KEY } from ".";
import { ensureArray, Ok, Ov } from "./utils";
var ProjectionMode;
(function (ProjectionMode) {
    ProjectionMode[ProjectionMode["Explicit"] = 0] = "Explicit";
    ProjectionMode[ProjectionMode["ImplicitExclusion"] = 1] = "ImplicitExclusion";
    ProjectionMode[ProjectionMode["ImplicitInclusion"] = 2] = "ImplicitInclusion";
})(ProjectionMode || (ProjectionMode = {}));
const getSortFunctions = (keys) => keys.map((key) => (item) => item[key]);
const getSortDirections = (nums) => nums.map((num) => num === 1 ? "asc" : "desc");
export function applyQueryOptions(data, options) {
    if (options.project) {
        // What is the projection mode?
        // 1. Implicit exclusion: { a: 1, b: 1 }
        // 2. Implicit inclusion: { a: 0, b: 0 }
        // 3. Explicit: { a: 0, b: 1 }
        const projectionTotal = Object.keys(options.project).reduce((acc, key) => acc + options.project[key], 0);
        const projectionMode = projectionTotal === Object.keys(options.project).length
            ? ProjectionMode.ImplicitExclusion
            : projectionTotal === 0
                ? ProjectionMode.ImplicitInclusion
                : ProjectionMode.Explicit;
        // Implicitly include ID_KEY when it's not explicitly excluded.
        if (options.project[ID_KEY] === undefined) {
            options.project[ID_KEY] = 1;
        }
        if (projectionMode === ProjectionMode.ImplicitExclusion) {
            // data = _.map(data, (item) => _.pick(item, Ok(options.project)));
            data = data.map((item) => _.pick(item, Ok(options.project)));
        }
        else if (projectionMode === ProjectionMode.ImplicitInclusion) {
            // data = _.map(data, (item) => _.omit(item, Ok(options.project)));
            data = data.map((item) => _.omit(item, Ok(options.project)));
        }
        else if (projectionMode === ProjectionMode.Explicit) {
            const omit = Object.keys(options.project).filter((key) => options.project[key] === 0);
            data = data.map((item) => _.omit(item, omit));
        }
    }
    if (options.sort) {
        data = _.orderBy(data, getSortFunctions(Ok(options.sort)), getSortDirections(Ov(options.sort)));
    }
    if (options.skip && typeof options.skip === "number") {
        data = data.slice(options.skip);
    }
    if (options.take && typeof options.take === "number") {
        data = data.slice(0, options.take);
    }
    if (options.join && Array.isArray(options.join)) {
        options.join.forEach((join) => {
            const qo = join?.options || {};
            const db = join.collection;
            data = data.map((item) => {
                item[join.as] = ensureArray(item[join.as]);
                if (item[join.from] === undefined)
                    return item;
                if (Array.isArray(item[join.from])) {
                    item[join.from].forEach((key) => {
                        const query = { [`${join.to}`]: key };
                        item[join.as] = item[join.as].concat(db.find(query, qo));
                    });
                    return item;
                }
                const query = { [`${join.to}`]: item[join.from] };
                item[join.as] = item[join.as].concat(db.find(query, qo));
                return item;
            });
        });
    }
    return data;
}

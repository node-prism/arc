import fs from "fs";
import path from "path";
class SimpleFIFO {
    elements = [];
    push(...args) {
        this.elements.push(...args);
    }
    shift() {
        return this.elements.shift();
    }
    length() {
        return this.elements.length;
    }
}
export default class FilesystemAdapter {
    storagePath;
    name;
    filePath;
    queue;
    constructor(storagePath, name) {
        // if name doesn't end with `.json`, add it.
        if (!name.endsWith(".json")) {
            name += ".json";
        }
        this.storagePath = storagePath;
        this.name = name;
        this.queue = new SimpleFIFO();
        this.filePath = path.join(this.storagePath, this.name);
        this.prepareStorage();
    }
    prepareStorage() {
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath);
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}));
        }
    }
    read() {
        try {
            return Object.assign({}, JSON.parse(fs.readFileSync(this.filePath, "utf8")) || {});
        }
        catch (e) {
            return {};
        }
    }
    write(data) {
        this.queue.push([
            (d) => {
                writeJSON(d, this.filePath);
            },
            data,
        ]);
        while (this.queue.length()) {
            const ar = this.queue.shift();
            ar[0](ar[1]);
        }
    }
}
function writeJSON(data, ...args) {
    const env = process.env.NODE_ENV || "development";
    const indent = env === "development" ? 2 : 0;
    const out = JSON.stringify(data, null, indent);
    return write(out, ...args);
}
function write(data, ...args) {
    const pth = path.join(...args);
    return fs.writeFileSync(pth, data);
}

import fs from "fs";
import path from "path";
import { SimpleFIFO } from "./fs_adapter";
import crypto from "crypto";
export default class EncryptedFilesystemAdapter {
    storagePath;
    name;
    filePath;
    queue;
    constructor(storagePath, name) {
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
            const data = fs.readFileSync(this.filePath, "utf8");
            const parsed = JSON.parse(data);
            const decrypted = decrypt(parsed);
            return Object.assign({}, JSON.parse(decrypted) || {});
        }
        catch (e) {
            return {};
        }
    }
    write(data) {
        this.queue.push([
            (d) => {
                writeJSONEncrypted(d, this.filePath);
            },
            data,
        ]);
        while (this.queue.length()) {
            const ar = this.queue.shift();
            ar[0](ar[1]);
        }
    }
}
const key = crypto
    .createHash('sha256')
    .update(String(process.env.ENCRYPTION_KEY || "79bad2023354bebe53d946ca6c6e067c5fd034f9e2deacabf15ce388a39de5bd"))
    .digest('base64')
    .substr(0, 32);
function writeJSONEncrypted(data, ...args) {
    const env = process.env.NODE_ENV || "development";
    const indent = env === "development" ? 2 : 0;
    const json = JSON.stringify(data, null, indent);
    const out = encrypt(json);
    return write(out, ...args);
}
function write(data, ...args) {
    const pth = path.join(...args);
    return fs.writeFileSync(pth, JSON.stringify(data));
}
/**
  * This function takes a string and encrypts it using the
  * AES-256-GCM algorithm. It returns a base64 encoded string
  * containing the encrypted data, the initialization vector
  * and the authentication tag.
  */
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return {
        content: encrypted.toString("base64"),
        iv: iv.toString("hex"),
        tag: cipher.getAuthTag().toString("hex")
    };
}
/**
 * This function takes a base64 encoded string
 * containing the encrypted data, the initialization
 * vector and the authentication tag and decrypts it
 * using the AES-256-GCM algorithm.
 */
function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "hex"));
    decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));
    const decrpyted = decipher.update(encrypted.content, "base64", "utf8") + decipher.final("utf8");
    return decrpyted;
}

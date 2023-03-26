import fs from "fs";
import path from "path";
import { StorageAdapter } from ".";
import { SimpleFIFO } from "./fs";
import crypto from "crypto";

export default class EncryptedFSAdapter<T> implements StorageAdapter<T> {
  storagePath: string;
  name: string;
  filePath: string;
  queue: SimpleFIFO;

  constructor(storagePath: string, name: string) {
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

  read(): { [key: string]: T } {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const decrypted = decrypt(data);

      return Object.assign(
        {},
        JSON.parse(decrypted) || {},
      );
    } catch (e) {
      return {};
    }
  }

  write(data: { [key: string]: T }) {
    this.queue.push([
      (d: { [key: string]: T }) => {
        encryptAndWrite(d, this.filePath);
      },
      data,
    ]);

    while (this.queue.length()) {
      const ar = this.queue.shift();
      ar[0](ar[1]);
    }
  }
}

let ENCRYPTION_KEY = "Mahpsee2X7TKLe1xwJYmar91pCSaZIY7";
try {
  if (process.env.ARC_ENCFS_KEY) {
    ENCRYPTION_KEY = String(process.env.ARC_ENCFS_KEY);
  }
} catch (e) {}

const encryptAndWrite = (data: any, ...args: any[]) => {
  const json = JSON.stringify(data, null, 0);
  return write(encrypt(json), ...args);
};

const write = (data: string, ...args: any) => {
  return fs.writeFileSync(path.join(...args), data);
};

/**
  * This function takes a string and encrypts it using the
  * aes-256-cbc algorithm. It returns a base64 encoded string
  * containing the encrypted data, the initialization vector
  * and the authentication tag.
  */
const encrypt = (text: string) => {
  const iv = Buffer.from(crypto.randomBytes(16)).toString("hex").slice(0, 16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv}:${encrypted.toString("hex")}`;
};

/**
 * This function takes a base64 encoded string
 * containing the encrypted data, the initialization
 * vector and the authentication tag and decrypts it    
 * using the aes-256-cbc algorithm. 
 */
const decrypt = (text: string) => {
  const textParts = text.includes(":") ? text.split(":") : [];
  const iv = Buffer.from(textParts.shift() || "", "binary");
  const encryptedtext = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  return Buffer.concat([decipher.update(encryptedtext), decipher.final()]).toString();
};

import { generateKeyPairSync, randomBytes } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const publicJwk = publicKey.export({ format: "jwk" });
const privateJwk = privateKey.export({ format: "jwk" });
const rawPublicKey = Buffer.concat([
    Buffer.from([4]),
    Buffer.from(publicJwk.x, "base64url"),
    Buffer.from(publicJwk.y, "base64url")
]).toString("base64url");

console.log("Create these Supabase Edge Function secrets. Do not commit their values:");
console.log(`VAPID_KEYS=${JSON.stringify({ publicKey: publicJwk, privateKey: privateJwk })}`);
console.log("VAPID_CONTACT=mailto:YOUR_CONTACT_EMAIL");
console.log(`CRON_SECRET=${randomBytes(32).toString("base64url")}`);
console.log(`Public application server key: ${rawPublicKey}`);

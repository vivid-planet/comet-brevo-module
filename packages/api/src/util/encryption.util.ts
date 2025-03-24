import crypto from "crypto";

export function encrypt(email: string, secretKey: string): string {
    const hmac = crypto.createHmac("sha256", Buffer.from(secretKey, "hex"));
    hmac.update(email.toLowerCase());
    return hmac.digest("hex");
}

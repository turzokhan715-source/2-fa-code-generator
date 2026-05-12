function base32ToHex(base32) {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";
    base32 = base32.replace(/=+$/,"");
    for (let i = 0; i < base32.length; i++) {
        const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        if (val === -1) throw new Error("Invalid base32 character");
        bits += val.toString(2).padStart(5,"0");
    }
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        hex += parseInt(bits.substr(i,8),2).toString(16).padStart(2,"0");
    }
    return hex;
}

function hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c,2),16));
    }
    return new Uint8Array(bytes);
}

async function hmacSha1(keyHex, message) {
    const keyBytes = hexToBytes(keyHex);
    const messageBytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        messageBytes[i] = message & 0xff;
        message = Math.floor(message / 256);
    }
    const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, {name:"HMAC",hash:"SHA-1"}, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBytes);
    return new Uint8Array(signature);
}

async function generateTOTP(secret) {
    const key = base32ToHex(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / 30);
    const hmac = await hmacSha1(key, time);
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = (((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)) % 1000000;
    return code.toString().padStart(6,"0");
}

function getTimeRemaining() {
    const epoch = Math.floor(Date.now() / 1000);
    return 30 - (epoch % 30);
}
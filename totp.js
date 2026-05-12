// Base32 alphabet
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base32 decode
function base32Decode(base32) {
    base32 = base32.toUpperCase().replace(/=+$/, '');
    let bits = '';
    
    for (let i = 0; i < base32.length; i++) {
        const val = BASE32_CHARS.indexOf(base32[i]);
        if (val === -1) throw new Error('Invalid base32 character');
        bits += val.toString(2).padStart(5, '0');
    }
    
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    
    return new Uint8Array(bytes);
}

// HMAC-SHA1 (synchronous using jsSHA library alternative)
function hmacSha1Sync(key, message) {
    // Simple HMAC-SHA1 implementation
    const blockSize = 64;
    
    // Pad or hash key if needed
    if (key.length > blockSize) {
        key = sha1(key);
    }
    if (key.length < blockSize) {
        const padded = new Uint8Array(blockSize);
        padded.set(key);
        key = padded;
    }
    
    // Create inner and outer padded keys
    const innerKey = new Uint8Array(blockSize);
    const outerKey = new Uint8Array(blockSize);
    
    for (let i = 0; i < blockSize; i++) {
        innerKey[i] = key[i] ^ 0x36;
        outerKey[i] = key[i] ^ 0x5c;
    }
    
    // HMAC = H(outerKey || H(innerKey || message))
    const innerHash = sha1(concat(innerKey, message));
    return sha1(concat(outerKey, innerHash));
}

// SHA-1 implementation
function sha1(data) {
    // Convert to array if needed
    if (!(data instanceof Uint8Array)) {
        data = new Uint8Array(data);
    }
    
    // Initialize hash values
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;
    
    // Pre-processing
    const ml = data.length * 8;
    const paddedLength = Math.ceil((ml + 65) / 512) * 512 / 8;
    const padded = new Uint8Array(paddedLength);
    padded.set(data);
    padded[data.length] = 0x80;
    
    // Append length
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 4, ml & 0xffffffff, false);
    
    // Process chunks
    for (let i = 0; i < paddedLength; i += 64) {
        const w = new Uint32Array(80);
        
        // Break chunk into sixteen 32-bit big-endian words
        for (let j = 0; j < 16; j++) {
            w[j] = view.getUint32(i + j * 4, false);
        }
        
        // Extend the sixteen 32-bit words into eighty 32-bit words
        for (let j = 16; j < 80; j++) {
            w[j] = leftRotate(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
        }
        
        // Initialize working variables
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        
        // Main loop
        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            } else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            } else if (j < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            
            const temp = (leftRotate(a, 5) + f + e + k + w[j]) & 0xffffffff;
            e = d;
            d = c;
            c = leftRotate(b, 30);
            b = a;
            a = temp;
        }
        
        // Add this chunk's hash to result
        h0 = (h0 + a) & 0xffffffff;
        h1 = (h1 + b) & 0xffffffff;
        h2 = (h2 + c) & 0xffffffff;
        h3 = (h3 + d) & 0xffffffff;
        h4 = (h4 + e) & 0xffffffff;
    }
    
    // Produce final hash
    const result = new Uint8Array(20);
    const resultView = new DataView(result.buffer);
    resultView.setUint32(0, h0, false);
    resultView.setUint32(4, h1, false);
    resultView.setUint32(8, h2, false);
    resultView.setUint32(12, h3, false);
    resultView.setUint32(16, h4, false);
    
    return result;
}

// Helper functions
function leftRotate(n, s) {
    return ((n << s) | (n >>> (32 - s))) & 0xffffffff;
}

function concat(a, b) {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}

// Generate TOTP code (SYNCHRONOUS - No Promise!)
function generateTOTP(secret) {
    try {
        // Remove spaces and convert to uppercase
        secret = secret.replace(/\s/g, '').toUpperCase();
        
        // Decode base32 secret
        const key = base32Decode(secret);
        
        // Get current time step (30 seconds)
        const epoch = Math.floor(Date.now() / 1000);
        const timeStep = Math.floor(epoch / 30);
        
        // Convert time to 8-byte array
        const timeBytes = new Uint8Array(8);
        const timeView = new DataView(timeBytes.buffer);
        timeView.setUint32(4, timeStep, false);
        
        // Generate HMAC-SHA1
        const hmac = hmacSha1Sync(key, timeBytes);
        
        // Dynamic truncation
        const offset = hmac[19] & 0x0f;
        const truncated = (
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff)
        );
        
        // Generate 6-digit code
        const code = (truncated % 1000000).toString().padStart(6, '0');
        
        return code;
        
    } catch (error) {
        console.error('TOTP generation error:', error);
        throw new Error('Invalid secret key');
    }
}

// Base32 decoding
function base32Decode(base32) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';
    
    base32 = base32.replace(/=+$/, '');
    
    for (let i = 0; i < base32.length; i++) {
        const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
        if (val === -1) throw new Error('Invalid base32 character');
        bits += val.toString(2).padStart(5, '0');
    }
    
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        hex += parseInt(bits.substr(i, 8), 2).toString(16).padStart(2, '0');
    }
    
    return hex;
}

// HMAC-SHA1
async function hmacSha1(key, message) {
    const encoder = new TextEncoder();
    const keyData = hexToBytes(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Convert hex string to bytes
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

// Generate TOTP code
async function generateTOTP(secret) {
    try {
        // Decode base32 secret
        const key = base32Decode(secret);
        
        // Get current time step (30 seconds)
        const epoch = Math.floor(Date.now() / 1000);
        const timeStep = Math.floor(epoch / 30);
        const timeHex = timeStep.toString(16).padStart(16, '0');
        
        // Generate HMAC
        const hmac = await hmacSha1(key, timeHex);
        
        // Dynamic truncation
        const offset = parseInt(hmac.slice(-1), 16);
        const truncated = hmac.substr(offset * 2, 8);
        const code = parseInt(truncated, 16) & 0x7fffffff;
        
        // Return 6-digit code
        return (code % 1000000).toString().padStart(6, '0');
        
    } catch (error) {
        console.error('TOTP generation error:', error);
        throw error;
    }
}

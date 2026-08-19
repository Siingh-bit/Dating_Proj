/**
 * Cryptographic SHA-256 one-way hashing helper using Web Crypto API
 * Prevents plain-text passwords & emails from ever appearing in JavaScript client bundles.
 */
export async function sha256(message) {
  if (!message) return '';
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

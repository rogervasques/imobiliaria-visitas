import crypto from 'crypto';

/**
 * Módulo de Criptografia AES-256 para Logs de Mensagens do WhatsApp
 * Utiliza o algoritmo padrão AES-256-CBC com IV aleatório e chave ENCRYPTION_KEY de 256 bits (32 bytes).
 */

const DEFAULT_SECRET = 'easymob_aes256_secret_key_32_bytes_super_secure!';

/**
 * Obtém a chave de 32 bytes (256 bits) a partir da variável de ambiente ENCRYPTION_KEY
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || DEFAULT_SECRET;
  // Cria um hash SHA-256 para garantir exatos 32 bytes (256 bits)
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Criptografa texto puro usando AES-256-CBC
 * Retorna formato seguro: aes256:v1:<iv_hex>:<encrypted_hex>
 */
export function encryptText(text: string): string {
  if (!text) return '';

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // 16 bytes para AES-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `aes256:v1:${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[CRYPTO] Erro ao criptografar mensagem:', err);
    return text;
  }
}

/**
 * Descriptografa texto em memória no servidor Next.js
 * Se o texto estiver no formato legado (ou não criptografado), retorna o texto original com segurança.
 */
export function decryptText(cipherText: string): string {
  if (!cipherText) return '';

  // Se não possuir o prefixo de criptografia, retorna o texto puro (compatibilidade retroativa)
  if (!cipherText.startsWith('aes256:v1:') && !cipherText.startsWith('enc:v1:')) {
    return cipherText;
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length < 4) return cipherText;

    const ivHex = parts[2];
    const encryptedHex = parts[3];

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[CRYPTO] Erro ao descriptografar mensagem:', err);
    return cipherText;
  }
}

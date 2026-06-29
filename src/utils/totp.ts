import * as OTPAuth from 'otpauth';

// Generate TOTP code synchronously using the 'otpauth' package
export function generateTOTP(secret: string): string {
  try {
    if (!secret || secret.trim() === '') return '—';
    // Clean spaces and convert to uppercase for standard Base32 parsing
    const cleanSecret = secret.trim().replace(/\s/g, '').toUpperCase();
    
    // Create a new TOTP instance
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    
    // Generate the current code
    return totp.generate();
  } catch (e) {
    console.error('Error generating TOTP with otpauth:', e);
    return 'Error';
  }
}

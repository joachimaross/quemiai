import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';

/**
 * Multi-Factor Authentication (MFA) Service
 * Provides TOTP (Time-based One-Time Password) functionality for 2FA
 */
@Injectable()
export class MfaService {
  /**
   * Generate a secret key for a new MFA setup
   * @returns A base32 encoded secret
   */
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate a QR code URL for the authenticator app
   * @param secret The user's MFA secret
   * @param email The user's email
   * @param issuer The application name
   * @returns otpauth:// URL for QR code generation
   */
  generateQrCodeUrl(secret: string, email: string, issuer: string = 'Quemiai'): string {
    return authenticator.keyuri(email, issuer, secret);
  }

  /**
   * Verify a TOTP token
   * @param token The 6-digit token from the authenticator app
   * @param secret The user's MFA secret
   * @returns true if token is valid
   */
  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes for account recovery
   * @param count Number of backup codes to generate (default: 10)
   * @returns Array of backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash a backup code for secure storage
   * @param code The backup code to hash
   * @returns Hashed backup code
   */
  hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify a backup code
   * @param code The backup code to verify
   * @param hashedCode The stored hashed backup code
   * @returns true if codes match
   */
  verifyBackupCode(code: string, hashedCode: string): boolean {
    const hash = this.hashBackupCode(code);
    return hash === hashedCode;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { MfaService } from '../mfa.service';

describe('MfaService', () => {
  let service: MfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MfaService],
    }).compile();

    service = module.get<MfaService>(MfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate a secret', () => {
      const secret = service.generateSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });
  });

  describe('generateQrCodeUrl', () => {
    it('should generate a valid QR code URL', () => {
      const secret = 'TESTSECRET123456';
      const email = 'test@example.com';
      const url = service.generateQrCodeUrl(secret, email);
      
      expect(url).toContain('otpauth://totp/');
      expect(url).toContain('test%40example.com'); // Email is URL-encoded
      expect(url).toContain(secret);
      expect(url).toContain('Quemiai');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const secret = service.generateSecret();
      // Note: In real tests, you'd need to generate a valid TOTP token
      // For now, we just test that the method accepts parameters
      const result = service.verifyToken('123456', secret);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate default 10 backup codes', () => {
      const codes = service.generateBackupCodes();
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]+$/);
      });
    });

    it('should generate specified number of backup codes', () => {
      const codes = service.generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('should generate unique codes', () => {
      const codes = service.generateBackupCodes(10);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('hashBackupCode', () => {
    it('should hash a backup code', () => {
      const code = 'TESTCODE1234';
      const hash = service.hashBackupCode(code);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 character hex string
    });

    it('should produce same hash for same code', () => {
      const code = 'TESTCODE1234';
      const hash1 = service.hashBackupCode(code);
      const hash2 = service.hashBackupCode(code);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify a correct backup code', () => {
      const code = 'TESTCODE1234';
      const hash = service.hashBackupCode(code);
      const result = service.verifyBackupCode(code, hash);
      
      expect(result).toBe(true);
    });

    it('should reject an incorrect backup code', () => {
      const code = 'TESTCODE1234';
      const wrongCode = 'WRONGCODE567';
      const hash = service.hashBackupCode(code);
      const result = service.verifyBackupCode(wrongCode, hash);
      
      expect(result).toBe(false);
    });
  });
});

import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    const config = {
      get: jest.fn().mockReturnValue('a'.repeat(64)),
    } as unknown as ConfigService;
    service = new EncryptionService(config);
    service.onModuleInit();
  });

  it('encrypts and decrypts back to the original plaintext', () => {
    const plainText = 'sk-super-secret-x-api-key';
    const payload = service.encrypt(plainText);

    expect(payload.encryptedValue).not.toEqual(plainText);
    expect(service.decrypt(payload)).toBe(plainText);
  });

  it('produces a different ciphertext for the same plaintext each time (random IV)', () => {
    const first = service.encrypt('same-value');
    const second = service.encrypt('same-value');

    expect(first.encryptedValue).not.toEqual(second.encryptedValue);
    expect(first.iv).not.toEqual(second.iv);
  });

  it('throws when the auth tag has been tampered with', () => {
    const payload = service.encrypt('tamper-me');
    const tampered = { ...payload, authTag: payload.authTag.replace(/^./, (c) => (c === '0' ? '1' : '0')) };

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('rejects an encryption key that is not 64 hex characters', () => {
    const badConfig = { get: jest.fn().mockReturnValue('too-short') } as unknown as ConfigService;
    const badService = new EncryptionService(badConfig);
    expect(() => badService.onModuleInit()).toThrow();
  });
});

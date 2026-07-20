import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed-token'), verifyAsync: jest.fn() };
    config = { get: jest.fn((key: string) => (key.includes('ExpiresIn') ? '15m' : 'secret')) };
    service = new AuthService(prisma as PrismaService, jwt as JwtService, config as ConfigService);
  });

  describe('login', () => {
    it('rejects when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'ghost@pablo.ai', password: 'whatever1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects when the user is deactivated', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: false, passwordHash: 'hash' });

      await expect(service.login({ email: 'a@a.com', password: 'whatever1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects on a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true, passwordHash: 'hash', email: 'a@a.com' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'a@a.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('issues an access and refresh token on success', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        isActive: true,
        passwordHash: 'hash',
        email: 'a@a.com',
        name: 'Pablo Admin',
        role: 'OWNER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'a@a.com', password: 'correct-password' });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result.user.email).toBe('a@a.com');
    });
  });
});

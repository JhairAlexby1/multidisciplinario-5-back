import { JwtService } from '../../src/auth/infraestructure/helpers/JWTService';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));
jest.mock('cookie');
const mockedJwt = jwt as any;
const mockedCookie = cookie as jest.Mocked<typeof cookie>;

describe('JWTService - Pruebas Unitarias', () => {
  let jwtService: JwtService;
  const mockSecret = 'test-secret-key';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      JWT_SECRET: mockSecret,
      NODE_ENV: 'test'
    };
    
    jwtService = new JwtService();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Prueba #13: Generación de token JWT', () => {
    it('debe generar un token JWT que contiene el ID del usuario en su payload', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const userPayload = { userId: userId, email: 'test@example.com' };
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';
      const mockSerializedCookie = 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken; HttpOnly; Secure; SameSite=Strict; Max-Age=3600';
      
      mockedJwt.sign.mockReturnValue(mockToken);
      mockedCookie.serialize.mockReturnValue(mockSerializedCookie);

      // Act
      const result = jwtService.generateToken(userPayload);

      // Assert
      expect(result).toBe(mockSerializedCookie);
      expect(typeof result).toBe('string');
      expect(result).toBeDefined();
      
      // Verificar que jwt.sign fue llamado con los parámetros correctos
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        userPayload,
        mockSecret,
        { expiresIn: '1h' }
      );
      expect(mockedJwt.sign).toHaveBeenCalledTimes(1);
      
      // Verificar que cookie.serialize fue llamado con los parámetros correctos
      expect(mockedCookie.serialize).toHaveBeenCalledWith(
        'token',
        mockToken,
        {
          httpOnly: true,
          secure: false, // NODE_ENV es 'test', no 'production'
          sameSite: 'strict',
          maxAge: 60 * 60
        }
      );
      expect(mockedCookie.serialize).toHaveBeenCalledTimes(1);
    });

    it('debe configurar secure: true cuando NODE_ENV es production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const userPayload = { userId: '123', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';
      const mockSerializedCookie = 'secure-cookie';
      
      mockedJwt.sign.mockReturnValue(mockToken);
      mockedCookie.serialize.mockReturnValue(mockSerializedCookie);

      // Act
      jwtService.generateToken(userPayload);

      // Assert
      expect(mockedCookie.serialize).toHaveBeenCalledWith(
        'token',
        mockToken,
        {
          httpOnly: true,
          secure: true, // Debe ser true en production
          sameSite: 'strict',
          maxAge: 60 * 60
        }
      );
    });

    it('debe generar tokens diferentes para payloads diferentes', () => {
      // Arrange
      const payload1 = { userId: '123', email: 'user1@example.com' };
      const payload2 = { userId: '456', email: 'user2@example.com' };
      const mockToken1 = 'token1';
      const mockToken2 = 'token2';
      const mockCookie1 = 'cookie1';
      const mockCookie2 = 'cookie2';
      
      mockedJwt.sign
        .mockReturnValueOnce(mockToken1)
        .mockReturnValueOnce(mockToken2);
      mockedCookie.serialize
        .mockReturnValueOnce(mockCookie1)
        .mockReturnValueOnce(mockCookie2);

      // Act
      const result1 = jwtService.generateToken(payload1);
      const result2 = jwtService.generateToken(payload2);

      // Assert
      expect(result1).toBe(mockCookie1);
      expect(result2).toBe(mockCookie2);
      expect(result1).not.toBe(result2);
      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
    });

    it('debe usar el secreto JWT desde las variables de entorno', () => {
      // Arrange
      const customSecret = 'custom-secret-key';
      process.env.JWT_SECRET = customSecret;
      const userPayload = { userId: '123' };
      
      mockedJwt.sign.mockReturnValue('mock-token');
      mockedCookie.serialize.mockReturnValue('mock-cookie');

      // Act
      jwtService.generateToken(userPayload);

      // Assert
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        userPayload,
        customSecret,
        { expiresIn: '1h' }
      );
    });
  });

  describe('verifyToken', () => {
    it('debe verificar y retornar el payload de un token válido', () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      const expectedPayload = { userId: '123', email: 'test@example.com' };
      
      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      // Act
      const result = jwtService.verifyToken(validToken);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith(validToken, mockSecret);
      expect(mockedJwt.verify).toHaveBeenCalledTimes(1);
    });

    it('debe retornar null cuando el token es inválido', () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';
      const mockError = new Error('Invalid token');
      
      mockedJwt.verify.mockImplementation(() => {
        throw mockError;
      });
      
      // Mock console.error para evitar logs en las pruebas
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = jwtService.verifyToken(invalidToken);

      // Assert
      expect(result).toBeNull();
      expect(mockedJwt.verify).toHaveBeenCalledWith(invalidToken, mockSecret);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid token', mockError);
      
      // Cleanup
      consoleSpy.mockRestore();
    });

    it('debe retornar null cuando el token ha expirado', () => {
      // Arrange
      const expiredToken = 'expired.jwt.token';
      const expiredError = new Error('jwt expired');
      
      mockedJwt.verify.mockImplementation(() => {
        throw expiredError;
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = jwtService.verifyToken(expiredToken);

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Invalid token', expiredError);
      
      consoleSpy.mockRestore();
    });
  });
});
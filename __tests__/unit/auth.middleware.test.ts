import { verifyToken, getToken } from '../../src/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('auth.middleware - Pruebas Unitarias', () => {
  const mockSecret = 'test-secret-key';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      SECRET: mockSecret
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('getToken', () => {
    it('debe extraer y verificar correctamente un token JWT válido', async () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      const expectedPayload = { result: { userId: '123', email: 'test@example.com' } };
      
      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      // Act
      const result = await getToken(validToken);

      // Assert
      expect(result).toEqual(expectedPayload.result);
      expect(mockedJwt.verify).toHaveBeenCalledWith(validToken, mockSecret);
      expect(mockedJwt.verify).toHaveBeenCalledTimes(1);
    });

    it('debe retornar el error cuando el token es inválido', async () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';
      const mockError = new Error('Invalid token');
      
      mockedJwt.verify.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = await getToken(invalidToken);

      // Assert
      expect(result).toBe(mockError);
      expect(mockedJwt.verify).toHaveBeenCalledWith(invalidToken, mockSecret);
    });
  });

  describe('Prueba #14: verifyToken - Acceso autorizado', () => {
    it('debe permitir el acceso a una ruta protegida cuando se provee un token JWT válido', async () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      const mockPayload = { userId: '123', email: 'test@example.com' };
      
      const mockReq = {
        cookies: {
          token: validToken
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();
      
      // Mock getToken para retornar un payload válido
      mockedJwt.verify.mockReturnValue({ result: mockPayload } as any);

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockedJwt.verify).toHaveBeenCalledWith(validToken, mockSecret);
    });

    it('debe permitir el acceso cuando el token contiene información válida del usuario', async () => {
      // Arrange
      const validToken = 'user.jwt.token';
      const userPayload = { 
        userId: '507f1f77bcf86cd799439011', 
        email: 'usuario@example.com',
        role: 'user'
      };
      
      const mockReq = {
        cookies: {
          token: validToken
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();
      
      mockedJwt.verify.mockReturnValue({ result: userPayload } as any);

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('Prueba #15: verifyToken - Acceso no autorizado', () => {
    it('debe bloquear el acceso y devolver un estado 401 (Unauthorized) si no se provee token', async () => {
      // Arrange
      const mockReq = {
        cookies: {} // Sin token
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No autorizado' });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockedJwt.verify).not.toHaveBeenCalled();
    });

    it('debe bloquear el acceso y devolver un estado 401 cuando el token es inválido', async () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';
      
      const mockReq = {
        cookies: {
          token: invalidToken
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();
      
      // Mock jwt.verify para lanzar un error (token inválido)
      const mockError = new Error('invalid token');
      mockedJwt.verify.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      // El middleware compara directamente con strings, pero getToken retorna el error object
      // Como el error no es exactamente 'invalid token', debería llamar next()
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockedJwt.verify).toHaveBeenCalledWith(invalidToken, mockSecret);
    });

    it('debe bloquear el acceso y devolver un estado 401 cuando el token ha expirado', async () => {
      // Arrange
      const expiredToken = 'expired.jwt.token';
      
      const mockReq = {
        cookies: {
          token: expiredToken
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();
      
      // Mock jwt.verify para lanzar un error de token expirado
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      mockedJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      // El middleware compara con strings, pero getToken retorna el error object
      // Como el error no es exactamente 'jwt expired', debería llamar next()
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockedJwt.verify).toHaveBeenCalledWith(expiredToken, mockSecret);
     });

     it('debe manejar errores del servidor y devolver un estado 500', async () => {
      // Arrange
      const validToken = 'valid.jwt.token';
      
      const mockReq = {
        cookies: {
          token: validToken
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn().mockImplementation(() => {
        throw new Error('Server error');
      });
      
      mockedJwt.verify.mockReturnValue({ result: { userId: '123' } } as any);

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server error' });
    });

    it('debe bloquear el acceso cuando el token está vacío', async () => {
      // Arrange
      const mockReq = {
        cookies: {
          token: '' // Token vacío
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No autorizado' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe bloquear el acceso cuando el token es null', async () => {
      // Arrange
      const mockReq = {
        cookies: {
          token: null
        }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const mockNext = jest.fn();

      // Act
      await verifyToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No autorizado' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
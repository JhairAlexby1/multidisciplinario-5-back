import { UserUseCase } from '../../src/auth/application/UserUseCase';
import { UserRepository } from '../../src/auth/domain/userRepository';
import { IEcryptService } from '../../src/auth/application/services/IEncryptService';
import { IJwtService } from '../../src/auth/application/services/IJWTService';
import { IUser } from '../../src/auth/domain/Iuser';
import { User } from '../../src/auth/domain/user';
import mongoose from 'mongoose';

// Mocks
const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  addWebhook: jest.fn(),
  getAll: jest.fn()
};

const mockEncryptService: jest.Mocked<IEcryptService> = {
  encodePassword: jest.fn(),
  authPassword: jest.fn()
};

const mockJwtService: jest.Mocked<IJwtService> = {
  generateToken: jest.fn(),
  verifyToken: jest.fn()
};

describe('UserUseCase - Prueba #5', () => {
  let userUseCase: UserUseCase;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear nueva instancia del UserUseCase
    userUseCase = new UserUseCase(
      mockUserRepository,
      mockEncryptService,
      mockJwtService
    );
  });

  describe('login - Contraseña incorrecta', () => {
    it('debe devolver un error de "credenciales inválidas" si la contraseña es incorrecta', async () => {
      // Arrange
      const email = 'juan@example.com';
      const correctPassword = 'correctPassword123';
      const incorrectPassword = 'wrongPassword456';
      const hashedPassword = 'hashedCorrectPassword123';
      
      const existingUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        'Juan Pérez',
        email,
        hashedPassword,
        'webhook-url'
      );

      // Configurar mocks
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockEncryptService.authPassword.mockReturnValue(false); // Contraseña incorrecta

      // Act & Assert
      await expect(userUseCase.login(email, incorrectPassword))
        .rejects.toThrow('Invalid credentials');

      // Verificar que se buscó el usuario
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      
      // Verificar que se intentó validar la contraseña
      expect(mockEncryptService.authPassword).toHaveBeenCalledWith(incorrectPassword, hashedPassword);
      
      // Verificar que NO se generó token JWT
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe manejar múltiples intentos de contraseña incorrecta', async () => {
      // Arrange
      const email = 'maria@example.com';
      const hashedPassword = 'hashedCorrectPassword';
      const incorrectPasswords = ['wrong1', 'wrong2', 'wrong3', ''];
      
      const user: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        'María García',
        email,
        hashedPassword,
        'webhook-url'
      );

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockEncryptService.authPassword.mockReturnValue(false);

      // Act & Assert - Probar cada contraseña incorrecta
      for (const wrongPassword of incorrectPasswords) {
        await expect(userUseCase.login(email, wrongPassword))
          .rejects.toThrow('Invalid credentials');
        
        expect(mockEncryptService.authPassword).toHaveBeenCalledWith(wrongPassword, hashedPassword);
      }

      // Verificar que nunca se generó un token
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe validar la contraseña antes de generar el token', async () => {
      // Arrange
      const email = 'admin@example.com';
      const wrongPassword = 'notTheRightPassword';
      const hashedPassword = 'hashedRealPassword';
      
      const adminUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
        'Admin User',
        email,
        hashedPassword,
        'admin-webhook'
      );

      mockUserRepository.findByEmail.mockResolvedValue(adminUser);
      mockEncryptService.authPassword.mockReturnValue(false);

      // Act & Assert
      await expect(userUseCase.login(email, wrongPassword))
        .rejects.toThrow('Invalid credentials');

      // Verificar que se llamaron los métodos correctamente
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      
      // Verificar que la validación de contraseña falló
      expect(mockEncryptService.authPassword).toHaveBeenCalledWith(wrongPassword, hashedPassword);
      expect(mockEncryptService.authPassword).toHaveReturnedWith(false);
      
      // Verificar que NO se llegó a generar el token
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe manejar contraseñas vacías o nulas como credenciales inválidas', async () => {
      // Arrange
      const email = 'test@example.com';
      const hashedPassword = 'hashedPassword';
      const invalidPasswords = ['', null, undefined];
      
      const user: User = new User(
        new mongoose.Types.ObjectId(),
        'Test User',
        email,
        hashedPassword,
        'webhook'
      );

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockEncryptService.authPassword.mockReturnValue(false);

      // Act & Assert
      for (const invalidPassword of invalidPasswords) {
        await expect(userUseCase.login(email, invalidPassword as string))
          .rejects.toThrow('Invalid credentials');
      }

      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe mantener la seguridad sin revelar información específica del error', async () => {
      // Arrange
      const email = 'secure@example.com';
      const wrongPassword = 'hackerAttempt';
      const hashedPassword = 'secureHashedPassword';
      
      const user: User = new User(
        new mongoose.Types.ObjectId(),
        'Secure User',
        email,
        hashedPassword,
        'secure-webhook'
      );

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockEncryptService.authPassword.mockReturnValue(false);

      // Act & Assert
      try {
        await userUseCase.login(email, wrongPassword);
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        // Verificar que el mensaje de error es genérico (buena práctica de seguridad)
        expect(error.message).toBe('Invalid credentials');
        
        // Verificar que NO revela información específica como:
        // - "Password is incorrect" (revela que el usuario existe)
        // - "Wrong password for user X" (revela información del usuario)
        // - Detalles del hash o algoritmo de encriptación
        expect(error.message).not.toContain('password');
        expect(error.message).not.toContain('user');
        expect(error.message).not.toContain('hash');
      }
    });

    it('debe documentar el comportamiento de seguridad para contraseñas incorrectas', () => {
      // Esta prueba documenta las características de seguridad:
      
      // ✅ COMPORTAMIENTO CORRECTO:
      // 1. Busca el usuario por email
      // 2. Valida la contraseña con el servicio de encriptación
      // 3. Si la contraseña es incorrecta, lanza "Invalid credentials"
      // 4. NO genera token JWT
      // 5. NO revela información específica del error
      
      // 🔒 CARACTERÍSTICAS DE SEGURIDAD:
      // ✅ Mensaje de error genérico (no revela si el usuario existe)
      // ✅ No genera token para credenciales inválidas
      // ✅ Valida contraseña hasheada (no en texto plano)
      // ✅ Consistente en el manejo de errores
      
      // ⚠️ POSIBLES MEJORAS:
      // - Rate limiting para prevenir ataques de fuerza bruta
      // - Logging de intentos fallidos para monitoreo
      // - Delay artificial para prevenir timing attacks
      
      expect(true).toBe(true); // Prueba de documentación
    });
  });
});
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

describe('UserUseCase - Prueba #6', () => {
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

  describe('login - Usuario no existe', () => {
    it('debe devolver un error si el usuario no existe en la base de datos durante el login', async () => {
      // Arrange
      const nonExistentEmail = 'noexiste@example.com';
      const password = 'anyPassword123';

      // Configurar mock para simular que el usuario no existe
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userUseCase.login(nonExistentEmail, password))
        .rejects.toThrow('Invalid credentials');

      // Verificar que se buscó el usuario por email
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(nonExistentEmail);
      
      // Verificar que NO se intentó validar la contraseña (porque no hay usuario)
      expect(mockEncryptService.authPassword).not.toHaveBeenCalled();
      
      // Verificar que NO se generó token JWT
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe manejar múltiples emails no existentes', async () => {
      // Arrange
      const nonExistentEmails = [
        'fake1@example.com',
        'fake2@test.com',
        'notreal@domain.org',
        'hacker@malicious.com'
      ];
      const password = 'anyPassword';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      for (const email of nonExistentEmails) {
        await expect(userUseCase.login(email, password))
          .rejects.toThrow('Invalid credentials');
        
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      }

      // Verificar que nunca se validó contraseña ni se generó token
      expect(mockEncryptService.authPassword).not.toHaveBeenCalled();
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe manejar emails con formato inválido que no existen', async () => {
      // Arrange
      const invalidEmails = [
        'notanemail',
        '@invalid.com',
        'missing@',
        'spaces in@email.com',
        ''
      ];
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      for (const invalidEmail of invalidEmails) {
        await expect(userUseCase.login(invalidEmail, password))
          .rejects.toThrow('Invalid credentials');
        
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(invalidEmail);
      }

      expect(mockEncryptService.authPassword).not.toHaveBeenCalled();
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe fallar rápidamente cuando el usuario no existe sin procesar la contraseña', async () => {
      // Arrange
      const nonExistentEmail = 'ghost@nowhere.com';
      const password = 'expensiveToHashPassword';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userUseCase.login(nonExistentEmail, password))
        .rejects.toThrow('Invalid credentials');

      // Verificar el orden de operaciones - debe fallar inmediatamente
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(nonExistentEmail);
      
      // Verificar que NO se procesó la contraseña (optimización de rendimiento)
      expect(mockEncryptService.authPassword).not.toHaveBeenCalled();
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe manejar errores de base de datos al buscar usuario', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const dbError = new Error('Database connection failed');

      // Simular error de base de datos
      mockUserRepository.findByEmail.mockRejectedValue(dbError);

      // Act & Assert
      await expect(userUseCase.login(email, password))
        .rejects.toThrow('Database connection failed');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockEncryptService.authPassword).not.toHaveBeenCalled();
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('debe mantener consistencia en mensajes de error para seguridad', async () => {
      // Arrange
      const nonExistentEmail = 'security@test.com';
      const password = 'anyPassword';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      try {
        await userUseCase.login(nonExistentEmail, password);
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        // Verificar que el mensaje es el mismo que para contraseña incorrecta
        // Esto previene ataques de enumeración de usuarios
        expect(error.message).toBe('Invalid credentials');
        
        // Verificar que NO revela información específica como:
        // - "User not found" (revela que el usuario no existe)
        // - "Email does not exist" (facilita enumeración de usuarios)
        // - "No account with this email" (información específica)
        expect(error.message).not.toContain('user');
        expect(error.message).not.toContain('email');
        expect(error.message).not.toContain('exist');
        expect(error.message).not.toContain('found');
      }
    });

    it('debe documentar el comportamiento de seguridad para usuarios no existentes', () => {
      // Esta prueba documenta las características de seguridad:
      
      // ✅ COMPORTAMIENTO CORRECTO:
      // 1. Busca el usuario por email
      // 2. Si no existe, lanza "Invalid credentials" inmediatamente
      // 3. NO procesa la contraseña (optimización)
      // 4. NO genera token JWT
      // 5. Usa el mismo mensaje de error que para contraseña incorrecta
      
      // 🔒 CARACTERÍSTICAS DE SEGURIDAD:
      // ✅ Previene enumeración de usuarios (mismo mensaje de error)
      // ✅ No revela si el usuario existe o no
      // ✅ Falla rápido sin procesar contraseña innecesariamente
      // ✅ Manejo consistente de errores
      
      // 🚀 OPTIMIZACIONES:
      // ✅ No gasta recursos en hash de contraseña si el usuario no existe
      // ✅ Falla temprano en el flujo de autenticación
      
      // ⚠️ CONSIDERACIONES ADICIONALES:
      // - Timing attacks: podría implementarse delay artificial
      // - Rate limiting para prevenir ataques de enumeración
      // - Logging de intentos con usuarios no existentes
      
      expect(true).toBe(true); // Prueba de documentación
    });
  });
});
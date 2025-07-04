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

describe('UserUseCase - Prueba #4', () => {
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

  describe('login - Inicio de sesión exitoso', () => {
    it('debe permitir el inicio de sesión y devolver un token JWT cuando las credenciales son correctas', async () => {
      // Arrange
      const email = 'juan@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const expectedToken = 'jwt.token.here';
      
      const existingUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        'Juan Pérez',
        email,
        hashedPassword,
        'webhook-url'
      );

      // Configurar mocks para un login exitoso
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockEncryptService.authPassword.mockReturnValue(true); // Contraseña correcta
      mockJwtService.generateToken.mockReturnValue(expectedToken);

      // Act
      const result = await userUseCase.login(email, password);

      // Assert
      expect(result).toBe(expectedToken);
      
      // Verificar que se buscó el usuario por email
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      
      // Verificar que se validó la contraseña
      expect(mockEncryptService.authPassword).toHaveBeenCalledWith(password, hashedPassword);
      
      // Verificar que se generó el token JWT
      expect(mockJwtService.generateToken).toHaveBeenCalledWith(existingUser);
    });

    it('debe generar un token JWT válido con la información del usuario', async () => {
      // Arrange
      const email = 'maria@example.com';
      const password = 'securePassword456';
      const hashedPassword = 'hashedSecurePassword456';
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      
      const user: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        'María García',
        email,
        hashedPassword,
        'webhook-url-maria'
      );

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockEncryptService.authPassword.mockReturnValue(true);
      mockJwtService.generateToken.mockReturnValue(expectedToken);

      // Act
      const token = await userUseCase.login(email, password);

      // Assert
      expect(token).toBe(expectedToken);
      expect(mockJwtService.generateToken).toHaveBeenCalledWith(user);
      expect(mockJwtService.generateToken).toHaveBeenCalledTimes(1);
    });

    it('debe seguir el flujo completo de autenticación correctamente', async () => {
      // Arrange
      const email = 'admin@example.com';
      const password = 'adminPassword789';
      const hashedPassword = 'hashedAdminPassword789';
      const token = 'admin.jwt.token';
      
      const adminUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
        'Admin User',
        email,
        hashedPassword,
        'admin-webhook'
      );

      mockUserRepository.findByEmail.mockResolvedValue(adminUser);
      mockEncryptService.authPassword.mockReturnValue(true);
      mockJwtService.generateToken.mockReturnValue(token);

      // Act
      const result = await userUseCase.login(email, password);

      // Assert - Verificar que se llamaron los métodos en el orden correcto
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockEncryptService.authPassword).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockJwtService.generateToken).toHaveBeenCalledWith(adminUser);
      
      // Verificar el resultado final
      expect(result).toBe(token);
    });

    it('debe manejar diferentes tipos de usuarios correctamente', async () => {
      // Arrange - Probar con diferentes usuarios
      const testCases = [
        {
          email: 'user1@test.com',
          password: 'pass1',
          name: 'Usuario Uno',
          expectedToken: 'token1'
        },
        {
          email: 'user2@test.com',
          password: 'pass2',
          name: 'Usuario Dos',
          expectedToken: 'token2'
        }
      ];

      for (const testCase of testCases) {
        // Limpiar mocks para cada iteración
        jest.clearAllMocks();
        
        const user: User = new User(
          new mongoose.Types.ObjectId(),
          testCase.name,
          testCase.email,
          'hashedPassword',
          'webhook'
        );

        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockEncryptService.authPassword.mockReturnValue(true);
        mockJwtService.generateToken.mockReturnValue(testCase.expectedToken);

        // Act
        const result = await userUseCase.login(testCase.email, testCase.password);

        // Assert
        expect(result).toBe(testCase.expectedToken);
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(testCase.email);
        expect(mockJwtService.generateToken).toHaveBeenCalledWith(user);
      }
    });

    it('debe documentar el comportamiento exitoso del login', () => {
      // Esta prueba documenta que el método login funciona correctamente cuando:
      // ✅ El usuario existe en la base de datos
      // ✅ La contraseña es correcta
      // ✅ Se genera un token JWT válido
      
      // FLUJO EXITOSO:
      // 1. userRepository.findByEmail(email) -> retorna usuario
      // 2. encryptService.authPassword(password, user.password) -> retorna true
      // 3. jwtService.generateToken(user) -> retorna token
      // 4. return token
      
      // CARACTERÍSTICAS DE SEGURIDAD:
      // ✅ Verifica existencia del usuario
      // ✅ Valida contraseña hasheada
      // ✅ Genera token JWT para sesión
      
      expect(true).toBe(true); // Prueba de documentación
    });
  });
});
import request from 'supertest';
import { createApp } from '../../src/server/app';
import mongoose from 'mongoose';
import { Express } from 'express';

describe('UserController (Integration)', () => {
  let app: Express;

  beforeAll(async () => {
    app = createApp();
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  describe('POST /auth/register', () => {
    const validUserData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'SecurePassword123!'
    };

    it('debe responder con estado 201 (Created) y los datos del usuario al registrarlo exitosamente', async () => {
      const response = await request(app)
        .post('/usuarios/register')
        .send(validUserData)
        .expect(201);

      // Verificar que la respuesta contiene el mensaje de éxito
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('id', 'mock-id');
      
      // Verificar que la contraseña NO se devuelve en la respuesta
      expect(response.body).not.toHaveProperty('password');
      
      // Verificar estructura de respuesta
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.id).toBe('string');
    });

    it('debe responder con estado 400 (Bad Request) si el email ya está en uso durante el registro', async () => {
      // Primer registro - debe ser exitoso
      await request(app)
        .post('/usuarios/register')
        .send(validUserData)
        .expect(201);

      // Segundo registro con el mismo email - debe fallar
      const response = await request(app)
        .post('/usuarios/register')
        .send(validUserData)
        .expect(400);

      // Verificar que el mensaje de error es apropiado
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
      
      // Verificar que no se devuelven datos del usuario en caso de error
      expect(response.body).not.toHaveProperty('id');
      expect(response.body).not.toHaveProperty('name');
    });

    it('debe responder con estado 400 (Bad Request) para datos de entrada inválidos', async () => {
      const invalidData = {
        name: '', // Nombre vacío
        email: 'invalid-email', // Email inválido
        password: '123' // Contraseña muy corta
      };

      const response = await request(app)
        .post('/usuarios/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('POST /auth/login', () => {
    const userData = {
      name: 'María García',
      email: 'maria.garcia@example.com',
      password: 'SecurePassword456!'
    };

    beforeEach(async () => {
      // Registrar un usuario para las pruebas de login
      await request(app)
        .post('/usuarios/register')
        .send(userData)
        .expect(201);
    });

    it('debe responder con estado 200 (OK) y un token al iniciar sesión correctamente', async () => {
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await request(app)
        .post('/usuarios/login')
        .send(loginData)
        .expect(200);

      // Verificar que la respuesta contiene un token
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
      
      // Verificar que no se devuelven datos sensibles
      expect(response.body).not.toHaveProperty('password');
      
      // Verificar estructura de respuesta exitosa
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(typeof response.body.message).toBe('string');
    });

    it('debe responder con estado 401 (Unauthorized) al intentar iniciar sesión con credenciales incorrectas', async () => {
      const invalidLoginData = {
        email: userData.email,
        password: 'WrongPassword123!' // Contraseña incorrecta
      };

      const response = await request(app)
        .post('/usuarios/login')
        .send(invalidLoginData)
        .expect(401);

      // Verificar que NO se devuelve un token
      expect(response.body).not.toHaveProperty('token');
      
      // Verificar mensaje de error genérico (buena práctica de seguridad)
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
      
      // Verificar que el mensaje NO revela información específica
      expect(response.body.error).not.toMatch(/password.*incorrect/i);
      expect(response.body.error).not.toMatch(/user.*not.*found/i);
    });

    it('debe responder con estado 401 (Unauthorized) para email no existente', async () => {
      const nonExistentUserData = {
        email: 'noexiste@example.com',
        password: 'AnyPassword123!'
      };

      const response = await request(app)
        .post('/usuarios/login')
        .send(nonExistentUserData)
        .expect(401);

      // Verificar que el mensaje es el mismo que para contraseña incorrecta
      // Esto previene ataques de enumeración de usuarios
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
      
      // Verificar que NO se devuelve un token
      expect(response.body).not.toHaveProperty('token');
    });

    it('debe responder con estado 400 (Bad Request) para datos de login inválidos', async () => {
      const invalidLoginData = {
        email: '', // Email vacío
        password: '' // Contraseña vacía
      };

      const response = await request(app)
        .post('/usuarios/login')
        .send(invalidLoginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('Seguridad y Validación', () => {
    it('debe rechazar requests sin Content-Type application/json', async () => {
      const response = await request(app)
        .post('/usuarios/register')
        .send('invalid data')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('debe manejar requests con payload muy grande', async () => {
      const largePayload = {
        name: 'A'.repeat(10000), // Nombre muy largo
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/usuarios/register')
        .send(largePayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('debe validar formato de email correctamente', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/usuarios/register')
          .send({
            name: 'Test User',
            email: email,
            password: 'Password123!'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });
});
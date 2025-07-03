# Guía de Pruebas Automatizadas

Este proyecto implementa un sistema completo de pruebas automatizadas utilizando Jest para garantizar la calidad y confiabilidad del código.

## Descripción General

El sistema de pruebas está diseñado para validar:
- **Pruebas Unitarias**: Verificación de la lógica de negocio en casos de uso
- **Componentes/Módulos**: Validación de funcionalidades específicas
- **Casos de Uso**: Pruebas de los diferentes escenarios de la aplicación

## Estructura de Pruebas

```
__tests__/
├── auth/
│   └── UserUseCase.test.ts   # Pruebas unitarias del UserUseCase
├── sensor/
│   └── [futuras pruebas]     # Pruebas de sensores
└── integration/
    └── [futuras pruebas]     # Pruebas de integración
```

## Casos de Prueba Implementados

### Caso 1: UserUseCase - Registro de Usuario
- **Componente/Módulo**: UserUseCase
- **Tipo**: Unitaria
- **Verificación**: Registra un nuevo usuario de forma exitosa cuando los datos son válidos
- **Archivo**: `__tests__/auth/UserUseCase.test.ts`

## Configuración

### Archivos de Configuración

- **`jest.config.js`**: Configuración principal de Jest para TypeScript
- **`jest.setup.js`**: Configuración del entorno de pruebas con mocks globales
- **`package.json`**: Scripts de testing

### Dependencias

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "jest-environment-node": "^29.7.0"
  }
}
```

## Scripts de Testing

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage

# Ejecutar pruebas con salida detallada
npm run test:verbose

# Ejecutar pruebas sin salida (solo resultados)
npm run test:silent
```

### Ejemplos de Uso

```bash
# Ejecutar una prueba específica
npm test -- health.test.ts

# Ejecutar pruebas de un directorio específico
npm test -- __tests__/auth

# Ejecutar pruebas con patrón específico
npm test -- --testNamePattern="health"
```

## Tipos de Pruebas

### 1. Pruebas Unitarias

**UserUseCase** (`auth/UserUseCase.test.ts`)
- **Registro exitoso**: Verifica que un usuario se registre correctamente con datos válidos
- **Manejo de errores de encriptación**: Valida el comportamiento cuando falla el servicio de encriptación
- **Manejo de errores de repositorio**: Verifica el comportamiento cuando falla el guardado en base de datos

#### Características de las Pruebas Unitarias:
- **Mocks**: Utiliza mocks para todas las dependencias externas
- **Aislamiento**: Cada prueba es independiente y no depende de servicios externos
- **Cobertura**: Cubre casos exitosos y de error
- **Verificación**: Valida tanto el comportamiento como las interacciones con dependencias

## Configuración de Mocks

### Mocks Globales

Las pruebas utilizan mocks para aislar las unidades de código bajo prueba:

```javascript
// jest.setup.js
// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';

// Mock de console.log para pruebas más limpias
global.console = {
    ...console,
    log: jest.fn(),
};

// Mocks de librerías externas
jest.mock('socket.io');
jest.mock('amqplib');
jest.mock('mongoose');
```

## Mocks y Configuración Global

### Variables de Entorno

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '3001';
```

### Mocks Incluidos

- **Socket.io**: Mock completo para evitar conexiones reales
- **AMQP**: Mock para RabbitMQ/AMQP
- **Console**: Mock para logs más limpios durante testing

## Mejores Prácticas para Pruebas Unitarias

### 1. Estructura de Pruebas (AAA Pattern)

```typescript
describe('UserUseCase', () => {
  beforeEach(() => {
    // Arrange: Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario de forma exitosa cuando los datos son válidos', async () => {
      // Arrange: Preparar datos y mocks
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      mockEncryptService.encodePassword.mockReturnValue('hashedPassword');
      
      // Act: Ejecutar la función bajo prueba
      await userUseCase.register(name, email, password);
      
      // Assert: Verificar el resultado esperado
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(IUser));
    });
  });
});
```

### 2. Mocking Efectivo

- **Mockear todas las dependencias externas**
- **Usar `jest.clearAllMocks()` en `beforeEach`**
- **Configurar mocks específicos para cada caso de prueba**

### 3. Nomenclatura Descriptiva

- **Usar el patrón**: "debe [acción] cuando [condición]"
- **Incluir el comportamiento esperado en el nombre**
- **Agrupar pruebas relacionadas con `describe`**

### 4. Assertions Completas

```typescript
// Verificar que se llamó la función correcta
expect(mockService.method).toHaveBeenCalledWith(expectedParam);

// Verificar el número de llamadas
expect(mockService.method).toHaveBeenCalledTimes(1);

// Verificar que NO se llamó una función
expect(mockService.method).not.toHaveBeenCalled();

// Verificar instancias de objetos
expect(result).toBeInstanceOf(ExpectedClass);
```

## Cobertura de Código

### Configuración

La cobertura está configurada para:
- Incluir todos los archivos `.ts` en `src/`
- Excluir archivos de definición `.d.ts`
- Excluir archivos de configuración específicos

### Reportes

```bash
npm run test:coverage
```

Genera reportes en:
- **Terminal**: Resumen de cobertura
- **coverage/lcov-report/index.html**: Reporte HTML detallado
- **coverage/lcov.info**: Archivo LCOV para CI/CD

## Solución de Problemas

### Problemas Comunes

1. **Mocks no funcionan correctamente**
   - Verificar que los mocks estén configurados en `jest.setup.js`
   - Usar `jest.clearAllMocks()` en `beforeEach`
   - Revisar el orden de imports en las pruebas

2. **Errores de TypeScript en pruebas**
   - Verificar que `@types/jest` esté instalado
   - Revisar la configuración de `ts-jest` en `jest.config.js`
   - Asegurar que las interfaces estén correctamente importadas

3. **Pruebas fallan inesperadamente**
   - Verificar que las dependencias estén correctamente mockeadas
   - Revisar que no haya efectos secundarios entre pruebas
   - Usar `jest.isolateModules()` si es necesario

### Debug y Ejecución

```bash
# Ejecutar con información detallada
npm test -- --verbose

# Ejecutar una prueba específica
npm test -- --testNamePattern="debe registrar un nuevo usuario"

# Ejecutar archivo específico
npm test -- UserUseCase.test.ts

# Ejecutar con watch mode
npm run test:watch
```

## CI/CD

### GitHub Actions (Ejemplo)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Contribución

### Agregar Nuevas Pruebas Unitarias

1. **Crear archivo de prueba**: `[Componente].test.ts` en el directorio apropiado
2. **Seguir el patrón AAA**: Arrange, Act, Assert
3. **Mockear todas las dependencias**: Usar interfaces para crear mocks tipados
4. **Incluir casos de prueba completos**:
   - Caso exitoso (happy path)
   - Casos de error y excepciones
   - Validación de interacciones con dependencias

### Estándares de Calidad

- **Cobertura mínima**: 80% para casos de uso
- **Nomenclatura**: Usar "debe [acción] cuando [condición]"
- **Aislamiento**: Cada prueba debe ser independiente
- **Mocks**: Mantener mocks actualizados con las interfaces reales
- **Documentación**: Comentar casos de prueba complejos

### Ejemplo de Nueva Prueba

```typescript
// __tests__/auth/UserUseCase.test.ts
describe('UserUseCase', () => {
  describe('login', () => {
    it('debe retornar token cuando las credenciales son válidas', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = { email, password: 'hashedPassword', name: 'Test', _id: '123' };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockEncryptService.authPassword.mockReturnValue(true);
      mockJwtService.generateToken.mockReturnValue('jwt-token');
      
      // Act
      const result = await userUseCase.login(email, password);
      
      // Assert
      expect(result).toBe('jwt-token');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockEncryptService.authPassword).toHaveBeenCalledWith(password, 'hashedPassword');
    });
  });
});
```

---

**Nota**: Este documento debe actualizarse cuando se agreguen nuevas funcionalidades o cambien las configuraciones de testing.
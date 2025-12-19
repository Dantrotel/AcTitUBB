# Tests de Frontend - AcTitUBB

Suite de tests para la aplicación Angular del sistema de gestión de proyectos de título.

## 📋 Contenido

- **karma.conf.js** - Configuración de Karma test runner
- **test-examples.spec.ts** - Ejemplos y plantillas de tests
- **run-tests.js** - Script personalizado para ejecutar tests

## 🚀 Ejecución

### Ejecutar todos los tests (single run):
```bash
npm test
# O
node test/run-tests.js single
```

### Ejecutar tests en modo watch (desarrollo):
```bash
npm run test:watch
# O
node test/run-tests.js watch
```

### Ejecutar tests con cobertura:
```bash
npm run test:coverage
# O
node test/run-tests.js coverage
```

### Ejecutar tests para CI/CD:
```bash
npm run test:ci
# O
node test/run-tests.js ci
```

## 📁 Estructura de Tests

```
frontend/src/app/
├── components/
│   ├── login/
│   │   ├── login.component.ts
│   │   └── login.component.spec.ts
│   └── propuestas/
│       ├── propuestas.component.ts
│       └── propuestas.component.spec.ts
├── services/
│   ├── auth.service.ts
│   └── auth.service.spec.ts
├── guards/
│   ├── auth.guard.ts
│   └── auth.guard.spec.ts
└── interceptors/
    ├── auth.interceptor.ts
    └── auth.interceptor.spec.ts
```

## 🧪 Tipos de Tests

### 1. Tests de Componentes
```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener formulario inválido inicialmente', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });
});
```

### 2. Tests de Servicios
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debe hacer login exitosamente', () => {
    const mockResponse = {
      accessToken: 'token123',
      usuario: { email: 'test@test.com' }
    };

    service.login('test@test.com', '1234').subscribe(res => {
      expect(res.accessToken).toBe('token123');
    });

    const req = httpMock.expectOne('/api/v1/users/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

### 3. Tests de Guards
```typescript
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('debe permitir acceso si está autenticado', () => {
    authService.isAuthenticated.and.returnValue(true);
    expect(guard.canActivate()).toBeTruthy();
  });
});
```

### 4. Tests de Formularios Reactivos
```typescript
it('debe validar email correctamente', () => {
  const emailControl = component.loginForm.get('email');
  
  emailControl?.setValue('');
  expect(emailControl?.hasError('required')).toBeTruthy();
  
  emailControl?.setValue('invalid-email');
  expect(emailControl?.hasError('email')).toBeTruthy();
  
  emailControl?.setValue('valid@email.com');
  expect(emailControl?.valid).toBeTruthy();
});
```

## 📊 Cobertura de Código

Los tests generan un reporte de cobertura en `frontend/coverage/index.html`

**Umbrales mínimos configurados:**
- Statements: 70%
- Branches: 60%
- Functions: 70%
- Lines: 70%

Para ver el reporte:
```bash
npm run test:coverage
# Luego abrir: frontend/coverage/index.html
```

## 🔧 Configuración

### karma.conf.js
- **Frameworks**: Jasmine + Angular DevKit
- **Browsers**: Chrome Headless (para CI)
- **Coverage**: Istanbul/NYC
- **Reporters**: Progress, Karma HTML, Coverage

### Personalización
Edita `karma.conf.js` para:
- Cambiar browser de prueba
- Ajustar timeouts
- Modificar umbrales de cobertura
- Añadir plugins adicionales

## 🎯 Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)
```typescript
it('debe calcular correctamente', () => {
  // Arrange
  const value1 = 5;
  const value2 = 10;
  
  // Act
  const result = component.add(value1, value2);
  
  // Assert
  expect(result).toBe(15);
});
```

### 2. Usar beforeEach para setup común
```typescript
describe('MiComponente', () => {
  let component: MiComponente;
  let fixture: ComponentFixture<MiComponente>;
  
  beforeEach(async () => {
    // Setup común para todos los tests
    await TestBed.configureTestingModule({...}).compileComponents();
    fixture = TestBed.createComponent(MiComponente);
    component = fixture.componentInstance;
  });
});
```

### 3. Limpiar después de cada test
```typescript
afterEach(() => {
  httpMock.verify(); // Verificar que no hay peticiones pendientes
  fixture.destroy(); // Limpiar componente
});
```

### 4. Usar spies para dependencias
```typescript
const mockService = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
mockService.method1.and.returnValue(of(mockData));
```

## 🐛 Troubleshooting

### Error: "Can't resolve all parameters"
- Asegúrate de importar todos los módulos necesarios en TestBed
- Verifica que todos los providers estén declarados

### Error: "No provider for HttpClient"
- Importa `HttpClientTestingModule` en el TestBed

### Error: "Can't bind to 'formGroup'"
- Importa `ReactiveFormsModule` o `FormsModule`

### Tests muy lentos
- Usa `ChromeHeadless` en lugar de Chrome
- Reduce el número de tests que corren en watch mode
- Optimiza el setup en beforeEach

### Karma no se detiene
- Verifica que no haya subscripciones sin `unsubscribe`
- Usa `singleRun: true` en karma.conf.js

## 📈 Próximos Pasos

- [ ] Añadir tests para todos los componentes
- [ ] Tests E2E con Playwright o Cypress
- [ ] Tests de accesibilidad (a11y)
- [ ] Tests de rendimiento
- [ ] Integrar con SonarQube
- [ ] Tests visuales con Percy o Chromatic

## 🤝 Contribuir

1. Escribe tests para nuevos componentes/servicios
2. Mantén cobertura > 70%
3. Sigue el patrón AAA
4. Usa nombres descriptivos
5. Un concepto por test

## 📚 Recursos

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Testing Best Practices](https://angular.io/guide/testing-best-practices)

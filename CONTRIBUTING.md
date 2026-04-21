##  Contribución y Desarrollo

### Guía de Contribución

1. **Fork del proyecto**
   ```bash
   git clone https://github.com/tu-usuario/AcTitUBB.git
   cd AcTitUBB
   git remote add upstream https://github.com/Dantrotel/AcTitUBB.git
   ```

2. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Desarrollo con convenciones**
   - Usar TypeScript strict mode
   - Seguir patrones Angular establecidos
   - Escribir tests para nueva funcionalidad
   - Documentar APIs nuevas

4. **Testing antes de commit**
   ```bash
   # Backend
   cd backend && npm test && npm run lint
   
   # Frontend  
   cd frontend && ng test && ng lint
   ```

5. **Commit con mensaje descriptivo**
   ```bash
   git commit -m "feat: agregar sistema de notificaciones push
   
   - Implementar Service Worker para notificaciones
   - Agregar configuración de Firebase
   - Crear componente de configuración de notificaciones
   - Agregar tests unitarios
   
   Closes #123"
   ```

6. **Pull Request**
   - Descripción detallada de cambios
   - Screenshots si hay cambios UI
   - Lista de testing realizado
   - Mencionar issues relacionadas

### Convenciones de Código

#### Frontend (Angular)
```typescript
// Estructura de componentes
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, /* otros imports */],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss']
})
export class FeatureNameComponent implements OnInit, OnDestroy {
  // Propiedades públicas primero
  public data: any[] = [];
  
  // Propiedades privadas después
  private subscription$ = new Subject<void>();
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.subscription$.next();
    this.subscription$.complete();
  }
  
  // Métodos públicos
  public onAction(): void {
    // implementación
  }
  
  // Métodos privados
  private loadData(): void {
    // implementación
  }
}
```

#### Backend (Node.js)
```javascript
// Estructura de controladores
const FeatureController = {
  // GET /api/v1/features
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const features = await FeatureService.getAll(page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Features retrieved successfully',
        data: features,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: features.total
        }
      });
    } catch (error) {
      console.error('Error in FeatureController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
```


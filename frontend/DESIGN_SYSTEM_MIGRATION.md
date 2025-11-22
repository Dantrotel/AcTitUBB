# 🎨 Guía de Migración del Sistema de Diseño AcTitUBB

## 📋 Resumen Ejecutivo

Se ha detectado **inconsistencia severa** en el diseño del frontend. Este documento describe:
- **Problemas identificados**: 30+ archivos con colores duplicados y contradictorios
- **Solución implementada**: Sistema de diseño unificado con CSS Custom Properties
- **Estado actual**: Sistema base creado, páginas pendientes de migración
- **Impacto**: Mejora visual, mantenibilidad y consistencia de marca UBB

---

## 🔴 Problemas Detectados

### 1. **Colores Primarios Conflictivos**
Cada archivo define sus propios colores, causando inconsistencia:

```scss
// login.scss
$ubb-blue: #1e5799;
$ubb-blue-light: #2989d8;

// gestion-usuarios.scss
$primary-color: #004b8d;
$secondary-color: #0066cc;

// ver-detalle.scss
$primary-color: #004b8d;
$accent-color: #00a8ff;  // ¡Tercer azul diferente!

// comision-proyecto.component.scss
background: linear-gradient(135deg, #667eea, #764ba2); // ¡Gradiente morado!
```

### 2. **Definiciones Duplicadas**
Cada archivo redefine los mismos colores de estado:

```scss
// Repetido en 15+ archivos:
$success-color: #28a745;
$warning-color: #ffc107;
$danger-color: #dc3545;
```

### 3. **Mixtura de Metodologías**
- `login.scss`: SCSS variables
- `proyecto-cronograma.scss`: CSS variables (--ubb-primary) ✓
- `gestion-usuarios.scss`: SCSS variables
- `comision-proyecto.scss`: Hex hardcodeado

---

## ✅ Solución Implementada

### Sistema de Diseño en `styles.scss`

Se creó un sistema completo de CSS Custom Properties:

```scss
:root {
  /* === Colores UBB Oficiales === */
  --ubb-primary: #1e5799;        // Azul UBB oficial
  --ubb-primary-light: #2989d8;  // Azul claro
  --ubb-primary-dark: #004b8d;   // Azul oscuro
  --ubb-secondary: #0066cc;      // Azul secundario
  --ubb-accent: #E20613;         // Rojo UBB oficial
  
  /* === Colores de Estado === */
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;
  
  /* === Gradientes === */
  --gradient-primary: linear-gradient(135deg, var(--ubb-primary) 0%, var(--ubb-primary-light) 100%);
  --gradient-secondary: linear-gradient(135deg, var(--ubb-primary-dark) 0%, var(--ubb-secondary) 100%);
  
  /* === Sombras === */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 15px 35px rgba(0, 0, 0, 0.2);
  
  /* === Bordes === */
  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 15px;
  --border-radius-xl: 20px;
  
  /* === Espaciado === */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* === Tipografía === */
  --font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-base: 1rem;
  --font-weight-semibold: 600;
}
```

### Clases Globales de Botones

```scss
.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.btn-secondary { ... }
.btn-success { ... }
.btn-danger { ... }
```

---

## 📝 Estado de Migración

### ✅ Archivos Completados

1. **`styles.scss`** - Sistema base creado
2. **`cambiar-password.scss`** - Migrado completamente

### 🟡 Archivos Pendientes (Alta Prioridad)

#### Páginas Admin (15 archivos)
- `gestion-usuarios.scss` - **968 líneas**, define $primary-color: #004b8d
- `gestion-propuestas.scss` - Define colores locales
- `gestion-profesores.scss` - Define colores locales
- `gestion-calendario.scss` - Define colores locales
- `gestion-extensiones.component.scss`
- `gestion-comision.scss`
- `asignar-profesor.scss`
- `asignaciones.scss`
- `home-admin.scss`
- `fechas-importantes.component.scss`
- `calendario-unificado.component.scss`
- `gestion-periodo-propuestas.component.scss`

#### Páginas Propuestas (7 archivos)
- `ver-detalle.scss` - **441 líneas**, usa #667eea (morado), #00a8ff
- `crear-propuesta.scss`
- `editar-propuesta.scss`
- `lista-propuestas.scss`
- `revisar-propuesta.scss`
- `asignadas.scss`
- `propuestas-todas.scss`

#### Páginas Profesor (4 archivos)
- `home-profesor.scss`
- `cronogramas.scss`
- `reuniones-profesor.component.scss`
- `fechas-importantes-profesor.component.scss`

#### Páginas Estudiante (3 archivos)
- `home.scss`
- `perfil.scss`
- `solicitar-extension.component.scss`

#### Componentes (12 archivos)
- `comision-proyecto.component.scss` - **300+ líneas**, usa #667eea, #764ba2 (morado/púrpura)
- `revision-entrega.component.scss`
- `gestion-hitos.component.scss`
- `fechas-limite-proyecto.component.scss`
- `cronograma-completo.component.scss`
- `documentos-proyecto.component.scss`
- `calendar-modal.component.scss`
- `dashboard-reuniones.component.scss`
- `disponibilidades.component.scss`
- `gestion-reuniones.component.scss`
- `historial-reuniones.component.scss`
- `solicitudes-reunion.component.scss`

#### Otros
- `login.scss` - **500+ líneas**, ya usa UBB colors pero con SCSS vars
- `register.scss`
- `proyecto-cronograma.component.scss` - **Ya usa CSS variables** ✓ (revisar consistencia)

---

## 🔧 Cómo Migrar un Archivo

### Paso 1: Eliminar Variables Locales

**ANTES:**
```scss
@use 'sass:color';

$primary-color: #004b8d;
$secondary-color: #0066cc;
$success-color: #28a745;
```

**DESPUÉS:**
```scss
// Usa el sistema de diseño global de styles.scss
// Todas las variables CSS están disponibles como var(--nombre-variable)
```

### Paso 2: Reemplazar Colores

| ANTES | DESPUÉS |
|-------|---------|
| `$primary-color` | `var(--ubb-primary)` o `var(--ubb-primary-dark)` |
| `$secondary-color` | `var(--ubb-secondary)` |
| `$success-color` | `var(--color-success)` |
| `$warning-color` | `var(--color-warning)` |
| `$danger-color` | `var(--color-danger)` |
| `$light-gray` | `var(--color-gray-50)` |
| `$dark-gray` | `var(--color-gray-800)` |
| `white` | `var(--color-white)` |
| `#667eea` (morado) | `var(--ubb-primary)` |
| `#764ba2` (púrpura) | `var(--ubb-primary)` |

### Paso 3: Reemplazar Gradientes

**ANTES:**
```scss
background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
background: linear-gradient(135deg, #667eea, #764ba2); // ¡Morado fuera de marca!
```

**DESPUÉS:**
```scss
background: var(--gradient-primary);
// o
background: var(--gradient-secondary);
```

### Paso 4: Reemplazar Sombras

**ANTES:**
```scss
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
```

**DESPUÉS:**
```scss
box-shadow: var(--shadow-md);
box-shadow: var(--shadow-xl);
```

### Paso 5: Reemplazar Border Radius

**ANTES:**
```scss
border-radius: 8px;
border-radius: 12px;
border-radius: 20px;
```

**DESPUÉS:**
```scss
border-radius: var(--border-radius-sm);
border-radius: var(--border-radius-md);
border-radius: var(--border-radius-xl);
```

### Paso 6: Reemplazar Espaciado

**ANTES:**
```scss
padding: 0.5rem;
padding: 1rem 2rem;
gap: 0.75rem;
```

**DESPUÉS:**
```scss
padding: var(--spacing-sm);
padding: var(--spacing-md) var(--spacing-xl);
gap: var(--spacing-md);
```

### Paso 7: Usar Clases Globales de Botones

**ANTES:**
```scss
.btn-primary {
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 6px;
  font-size: 16px;
  // ... 20 líneas más
}
```

**DESPUÉS:**
```scss
// ¡Ya no es necesario! Usa la clase global .btn-primary del styles.scss
// Si necesitas personalización:
.btn-primary {
  // Hereda estilos globales
  width: 100%; // Solo agregaa lo específico
}
```

---

## 🎯 Prioridades de Migración

### Prioridad 1 (Crítica) - Páginas Más Usadas
1. `login.scss` - Entrada principal
2. `gestion-usuarios.scss` - Admin frecuente
3. `home-admin.scss` - Dashboard admin
4. `home-profesor.scss` - Dashboard profesor
5. `home.scss` (estudiante) - Dashboard estudiante

### Prioridad 2 (Alta) - Componentes Críticos
6. `comision-proyecto.component.scss` - **Colores morados inconsistentes**
7. `ver-detalle.scss` - Vista propuesta
8. `gestion-propuestas.scss`

### Prioridad 3 (Media) - Resto de Páginas
9-20. Resto de páginas admin
21-30. Resto de componentes

### Prioridad 4 (Baja) - Páginas Especiales
- `register.scss` - Uso esporádico
- Modales y overlays

---

## 🚀 Ejemplo Completo de Migración

### ANTES: gestion-usuarios.scss (fragmento)

```scss
@use 'sass:color';

$primary-color: #004b8d;
$secondary-color: #0066cc;
$accent-color: #ff6b35;
$success-color: #28a745;
$warning-color: #ffc107;
$danger-color: #dc3545;
$light-gray: #f8f9fa;
$dark-gray: #343a40;

.admin-navbar {
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 75, 141, 0.3);
  
  .navbar-brand {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  // ... 15 líneas más
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}
```

### DESPUÉS: gestion-usuarios.scss (migrado)

```scss
// Sistema de diseño unificado - Ver styles.scss para todas las variables

.admin-navbar {
  background: var(--gradient-secondary);
  padding: var(--spacing-md) var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  
  .navbar-brand {
    color: var(--color-white);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
  }
}

// Ya no es necesario definir .btn-primary aquí, usa la clase global
// Si necesitas personalización específica:
.admin-specific-button {
  // Hereda de .btn-primary
  min-width: 200px; // Solo lo específico
}

.card {
  // Usa la clase global .card, o personaliza:
  background: var(--bg-card);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}
```

**Reducción de código:** -50 líneas, mejor mantenibilidad

---

## 📊 Métricas de Impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Definiciones de $primary-color | 15+ archivos | 1 archivo |
| Colores azules diferentes | 6 (#1e5799, #2989d8, #004b8d, #0066cc, #00a8ff, #0052cc) | 4 oficiales |
| Colores fuera de marca | 4 (morados: #667eea, #764ba2) | 0 |
| Líneas de CSS duplicado | ~500 | ~100 |
| Archivos migrados | 0/50 | 2/50 |

---

## ✅ Checklist de Verificación Post-Migración

Después de migrar cada archivo, verificar:

- [ ] Sin variables SCSS locales de colores ($primary-color, etc.)
- [ ] Todos los colores usan `var(--nombre)`
- [ ] Gradientes usan `var(--gradient-*)`
- [ ] Sombras usan `var(--shadow-*)`
- [ ] Border radius usa `var(--border-radius-*)`
- [ ] Espaciado usa `var(--spacing-*)`
- [ ] Sin colores morados/púrpuras (#667eea, #764ba2)
- [ ] Sin hex hardcodeado excepto transparencias
- [ ] Botones usan clases globales cuando sea posible
- [ ] La página se ve visualmente igual o mejor

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Colores Morados en Comisión
**Archivo:** `comision-proyecto.component.scss`
```scss
background: linear-gradient(135deg, #667eea, #764ba2); // ¡Fuera de marca UBB!
```
**Solución:** `background: var(--gradient-primary);`

### Problema 2: Múltiples Azules
**Archivos:** Varios
```scss
$primary-color: #004b8d; // Oscuro
$secondary-color: #0066cc; // Medio
$accent-color: #00a8ff; // Claro
```
**Solución:** Estandarizar:
- Oscuro: `var(--ubb-primary-dark)`
- Medio: `var(--ubb-secondary)`
- Claro: `var(--ubb-primary-light)`

### Problema 3: Transiciones Inconsistentes
```scss
transition: all 0.3s ease;
transition: all 0.2s;
transition: 300ms;
```
**Solución:** `transition: all var(--transition-base);`

---

## 📚 Recursos Adicionales

### Variables CSS Completas
Ver `styles.scss` líneas 1-120 para lista completa de variables.

### Clases Globales Disponibles
Ver `styles.scss` líneas 150-450:
- `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-warning`
- `.card`, `.card-header`, `.card-body`, `.card-footer`
- `.badge-*`, `.form-input`, `.form-label`
- Utilidades: `.text-center`, `.d-flex`, `.gap-md`, etc.

### Paleta UBB Oficial
- **Azul primario:** #1e5799
- **Azul claro:** #2989d8
- **Rojo UBB:** #E20613
- **Gris institucional:** #BBBBBB

---

## 🎓 Siguiente Paso

**Acción Recomendada:** Migrar los archivos de Prioridad 1 (login, homes de admin/profesor/estudiante) en la siguiente sesión.

**Comando de verificación:**
```bash
# Buscar archivos con variables SCSS de colores antiguas
grep -r "\$primary-color" frontend/src/app/pages/
grep -r "#667eea" frontend/src/app/
```

**Tiempo estimado:** 2-3 horas para Prioridad 1 (5 archivos), 8-10 horas total para todos.

---

## 📞 Contacto y Soporte

Si encuentras problemas durante la migración o necesitas clarificación sobre qué variable usar, consulta:
1. Este documento (DESIGN_SYSTEM_MIGRATION.md)
2. `styles.scss` - Sistema base completo
3. `cambiar-password.scss` - Ejemplo de migración completa

**Última actualización:** 2025-01-22
**Versión:** 1.0
**Estado:** Sistema base creado, migración en progreso (2/50 archivos)

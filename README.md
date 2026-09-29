# Sistema de Control de Padrón Electoral y Registro en Tiempo Real

Sistema web para control de padrón electoral y registro de asistencia/votos distribuido, con sincronización en tiempo real entre múltiples operadores mediante Supabase.

## Características Principales

- **Búsqueda por cédula** ultra-rápida con autofoco y Enter para consultar
- **Tres estados visuales**: Habilitado (verde), Ya Registrado (rojo), Desconocido (ámbar)
- **Registro de personas no cargadas** en el padrón (modal para ingresar nombre)
- **Multi-usuario**: Login de operadores, cada registro guarda quién lo realizó
- **Tiempo real**: Sincronización instantánea via Supabase Realtime entre notebooks
- **Importación Excel** masiva con upsert (evita duplicados, respeta registros previos)
- **Modo Demo offline** con datos de prueba para testear sin configurar Supabase
- **Estadísticas en vivo**: Total, Registrados, Pendientes
- **Log de actividad** con timestamp y operador

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, Tailwind CSS (CDN), JavaScript Vanilla (ES6+) |
| Backend/DB | Supabase (PostgreSQL + Realtime) |
| Importación | SheetJS (xlsx CDN) |
| Almacenamiento local | localStorage (config, usuarios, datos demo) |
| Despliegue | Archivo único `index.html` servido estáticamente |

## Estructura del Proyecto

```
├── index.html          # Aplicación completa (HTML + CSS + JS)
└── README.md           # Esta documentación
```

## Requisitos Previos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (requerido por CORS, localStorage, módulos ES)
- Cuenta Supabase (opcional, para modo producción)

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/starnicosvv/Plataforma-de-Automatizaci-n-para-confirmaci-n-de-votos.git
cd Plataforma-de-Automatizaci-n-para-confirmaci-n-de-votos
```

### 2. Iniciar servidor local

**Opción A: Python 3 (recomendado)**
```bash
python -m http.server 8080
```

**Opción B: Node.js (npx)**
```bash
npx serve .
```

**Opción C: PHP**
```bash
php -S localhost:8080
```

**Opción D: VS Code**
- Extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

### 3. Abrir en navegador

```
http://localhost:8080
```

> ⚠️ **NO abrir `index.html` con doble clic** (protocolo `file://` bloquea localStorage, CDN y módulos ES)

## Configuración de Supabase (Producción)

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Copiar **Project URL** y **anon public key** (Settings → API)

### 2. Crear tabla `padron`

```sql
-- Ejecutar en SQL Editor de Supabase
create table padron (
  cedula text primary key,
  nombre text not null,
  orden integer,
  mesa integer,
  referente text,
  ya_registrado boolean default false,
  fecha_registro timestamptz,
  registrado_por text
);

-- Habilitar Realtime
alter publication supabase_realtime add table padron;
```

### 3. Configurar en la app

1. Abrir la app → botón **"Config"** (engranaje)
2. Pegar **URL** y **Anon Key**
3. Click **"Guardar y Conectar"**

### 4. Cambiar a modo Supabase

- Botón **"Modo Demo"** (ámbar) → se vuelve verde **"Supabase"**
- El sistema usa la config guardada automáticamente

## Uso del Sistema

### Primer acceso - Login de Operador

1. Al abrir, aparece modal **"Iniciar Sesión"**
2. Seleccionar usuario existente o crear nuevo (ej: "Mesa 1", "Escuela Norte")
3. El badge superior muestra el operador activo

### Buscar y Registrar

1. Escribir cédula en el campo central → **Enter** o botón **"Consultar"**

**Resultado A - En padrón, no registrado (Verde)**
- Nombre grande en verde
- Botón **"REGISTRAR"** → confirma, muestra toast, limpia campo

**Resultado B - Ya registrado (Rojo)**
- Alerta: "¡ATENCIÓN! ESTA PERSONA YA ESTÁ REGISTRADA"
- Muestra fecha/hora exacta y **quién la registró**
- Botón deshabilitado

**Resultado C - No está en padrón (Ámbar)**
- "NO ENCONTRADA EN PADRÓN" + "Nombre: Desconocido"
- Botón **"REGISTRAR PERSONA DESCONOCIDA"** → modal para ingresar nombre
- Al confirmar: crea registro + marca como registrado

### Cargar Padrón (Excel)

1. Botón **"Cargar Padrón"** → selecciona `.xlsx`/`.xls`
2. Columnas requeridas: `cedula`, `nombre` (case-insensitive)
3. Vista previa de primeras 5 filas
4. **"Importar Padrón"** → proceso en lotes de 500 con barra de progreso
5. **Upsert**: actualiza nombres si cédula existe, **no toca** `ya_registrado` ni `fecha_registro`

### Estadísticas y Actividad

- **Tarjetas superiores**: Total en padrón / Ya Registrados / Pendientes (actualizan en tiempo real)
- **Panel lateral**: Log de consultas y registros con operador y hora

### Multi-operador (Simultáneo)

1. Abrir `http://localhost:8080` en varias notebooks/pestañas
2. Cada una: crear usuario distinto ("Mesa 1", "Mesa 2", "Escuela X")
3. Todos ven actualizaciones instantáneas via Realtime

## Modo Demo (Offline)

- Activo por defecto sin configurar Supabase
- 8 registros de prueba (2 ya registrados)
- Datos persisten en `localStorage` (`padron_demo_data`)
- Funcionalidad completa: búsqueda, registro, importación, stats
- Botón **"Modo Demo"** ↔ **"Supabase"** para alternar

## Estructura de Datos

### Tabla `padron` (Supabase / localStorage)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cedula` | TEXT PK | Número de documento único |
| `nombre` | TEXT | Nombre completo |
| `orden` | INTEGER | N° de orden en mesa (opcional) |
| `mesa` | INTEGER | N° de mesa receptora (opcional) |
| `referente` | TEXT | Nombre del referente (opcional) |
| `ya_registrado` | BOOLEAN | Default: false |
| `fecha_registro` | TIMESTAMPTZ | Nullable, ISO 8601 |
| `registrado_por` | TEXT | Nombre del operador |

### localStorage Keys

| Key | Contenido |
|-----|-----------|
| `padron_supabase_config` | `{url, key}` Supabase |
| `padron_demo_data` | Array de objetos padrón (demo) |
| `padron_users` | Array de usuarios `{id, name, created_at}` |
| `padron_current_user` | `{id, name}` sesión activa |

## Flujo de Datos (Arquitectura)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Navegador  │────▶│  Supabase    │◀───│  Navegador  │
│  (Operador) │     │  PostgreSQL  │    │  (Operador) │
└─────────────┘     │  + Realtime  │    └─────────────┘
       ▲            └──────┬───────┘           ▲
       │                   │                   │
       │   WebSocket       │   WebSocket       │
       │   (Realtime)      │   (Realtime)      │
       └───────────────────┴───────────────────┘
              Sincronización instantánea
```

## API Supabase Utilizada

```javascript
// Cliente
const sbClient = supabase.createClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } }
});

// Consulta única
const { data, error } = await sbClient
  .from('padron')
  .select('*')
  .eq('cedula', cedula)
  .single();

// Upsert masivo (importación)
await sbClient.from('padron').upsert(registros, {
  onConflict: 'cedula',
  ignoreDuplicates: false
});

// Update registro
await sbClient.from('padron').update({
  ya_registrado: true,
  fecha_registro: now,
  registrado_por: usuario
}).eq('cedula', cedula);

// Suscripción Realtime
sbClient.channel('padron-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'padron' }, handleChange)
  .subscribe();
```

## Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Página en blanco | Abierto como `file://` | Usar servidor local (`http://localhost:8080`) |
| "Tracking Prevention blocked" | Navegador bloquea CDN | Servir localmente; desactivar shields en Brave |
| No guarda usuario | localStorage bloqueado | Servir en `http://` no `file://` |
| Error conexión Supabase | Credenciales inválidas | Verificar URL y Anon Key en Config |
| Realtime no funciona | Tabla no en publication | `alter publication supabase_realtime add table padron;` |
| Import falla | Columnas incorrectas | Excel debe tener headers `cedula` y `nombre` |

## Seguridad

- **Anon Key** pública: Solo permisos `select`, `insert`, `update` en `padron` (configurar RLS en Supabase)
- **RLS Recomendado**:
  ```sql
  alter table padron enable row level security;
  
  create policy "Operadores pueden leer" on padron
    for select using (true);
    
  create policy "Operadores pueden insertar/actualizar" on padron
    for insert/update with check (true);
  ```
- Sin datos sensibles en frontend
- Validación de entrada en cliente y servidor

## Personalización

### Cambiar colores/theme
Editar clases Tailwind en `index.html`:
- Primario: `green-600` → `blue-600`, `purple-600`, etc.
- Estados: `green-50`/`red-50`/`amber-50` para tarjetas

### Agregar campos al padrón
1. Alterar tabla Supabase
2. Actualizar `demoData` estructura (línea ~277)
3. Modificar `importExcel()` upsert (línea ~1127)
4. Ajustar `showResultCanRegister()` / `showResultRegistered()`

### Tamaño de lote importación
```javascript
const batchSize = 500; // línea ~1087
```

## Licencia

MIT License - Uso libre para fines electorales, educativos y cívicos.

## Soporte

- Issues: [GitHub Issues](https://github.com/starnicosvv/Plataforma-de-Automatizaci-n-para-confirmaci-n-de-votos/issues)
- Documentación Supabase: [supabase.com/docs](https://supabase.com/docs)
- SheetJS: [sheetjs.com](https://sheetjs.com)

---

**Desarrollado para procesos electorales transparentes y auditables** 🗳️
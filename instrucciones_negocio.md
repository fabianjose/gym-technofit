# 🏋️ GymFlow — Sistema de Gestión de Rutinas para Gimnasio
## Especificaciones Técnicas para Desarrollo

---

## 📌 Resumen del Proyecto

Sistema web diseñado para ser usado en **tablet de autoservicio** dentro de un gimnasio. Permite a los administradores registrar miembros con sus rutinas semanales, y a los usuarios consultar su calendario de actividades por cédula. Incluye catálogo de máquinas con videos demostrativos y notificaciones diarias por WhatsApp.

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | **NestJS** (TypeScript) |
| Frontend | **Next.js** (TypeScript, App Router) |
| Base de datos | **MySQL 8** vía Docker |
| ORM | **TypeORM** |
| Contenedor DB | **Docker Compose** |
| Almacenamiento de archivos | Local filesystem (`/uploads`) o S3-compatible |
| Notificaciones WhatsApp | Evolution API como alternativa open-source |
| Autenticación Admin | JWT + bcrypt |

---

## 🐳 Docker — Base de Datos

Crear archivo `docker-compose.yml` en la raíz del proyecto:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: gymflow_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: gymflow
      MYSQL_USER: gymuser
      MYSQL_PASSWORD: gympassword
    ports:
      - "3306:3306"
    volumes:
      - gymflow_data:/var/lib/mysql

volumes:
  gymflow_data:
```

Variables de entorno del backend (`.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gymuser
DB_PASSWORD=gympassword
DB_DATABASE=gymflow

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=8h

TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Parámetro global: duración del calendario en meses
ROUTINE_DURATION_MONTHS=2
```

---

## 🗄️ Modelo de Base de Datos

### Tabla: `admins`
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(100) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| created_at | DATETIME | |

### Tabla: `members` (Miembros del gimnasio)
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| cedula | VARCHAR(20) UNIQUE NOT NULL | Número de documento |
| full_name | VARCHAR(150) NOT NULL | |
| email | VARCHAR(150) | Opcional |
| whatsapp_number | VARCHAR(20) | Formato internacional: +573001234567 |
| whatsapp_notify_hour | INT (0–23) | Hora de envío diario (ej: 7 para 7am) |
| active | BOOLEAN DEFAULT true | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Tabla: `machines` (Máquinas/Ejercicios)
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(150) NOT NULL | Nombre de la máquina o ejercicio |
| description | TEXT | Descripción breve |
| photo_url | VARCHAR(255) | Ruta de la foto |
| video_url | VARCHAR(255) | Ruta del video demostrativo |
| active | BOOLEAN DEFAULT true | |
| created_at | DATETIME | |

### Tabla: `routine_templates` (Plantilla semanal)
Cada miembro tiene UNA plantilla activa que define su semana base.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| member_id | INT FK → members.id | |
| start_date | DATE | Fecha de inicio del primer ciclo |
| cycle_days | INT DEFAULT 7 | Cada cuántos días se repite (ej: 7 = lunes a domingo, puede ser 8 si va de lunes a lunes) |
| duration_months | INT DEFAULT 2 | Meses que dura el calendario (parámetro configurable) |
| active | BOOLEAN DEFAULT true | Solo una plantilla activa por miembro |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Tabla: `routine_days` (Días de la plantilla base)
Define qué actividades se hacen en cada día del ciclo base.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| template_id | INT FK → routine_templates.id | |
| day_index | INT | 0 = primer día del ciclo, 1 = segundo, ... |
| day_label | VARCHAR(20) | Ej: "Lunes", "Día 1" |
| notes | TEXT | Notas generales del día (descanso, cardio, etc.) |

### Tabla: `routine_day_exercises` (Ejercicios por día base)
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| routine_day_id | INT FK → routine_days.id | |
| machine_id | INT FK → machines.id | |
| sets | INT | Número de series |
| reps | VARCHAR(50) | Ej: "12", "10-12", "Al fallo" |
| weight | VARCHAR(50) | Ej: "20kg", "Corporal" |
| rest_seconds | INT | Descanso entre series en segundos |
| order_index | INT | Orden dentro del día |
| notes | TEXT | Notas específicas del ejercicio |

### Tabla: `calendar_entries` (Calendario generado)
Se genera automáticamente al crear/actualizar la plantilla. También se puede editar manualmente.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| member_id | INT FK → members.id | |
| template_id | INT FK → routine_templates.id | |
| entry_date | DATE | Fecha específica del día |
| day_index | INT | Índice del ciclo al que corresponde |
| is_override | BOOLEAN DEFAULT false | true si fue editado manualmente |
| notes | TEXT | Notas del día en el calendario (puede ser editado) |

### Tabla: `calendar_entry_exercises` (Ejercicios de cada entrada del calendario)
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| calendar_entry_id | INT FK → calendar_entries.id | |
| machine_id | INT FK → machines.id | |
| sets | INT | |
| reps | VARCHAR(50) | |
| weight | VARCHAR(50) | |
| rest_seconds | INT | |
| order_index | INT | |
| notes | TEXT | |

### Tabla: `whatsapp_logs` (Log de mensajes enviados)
| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| member_id | INT FK → members.id | |
| sent_at | DATETIME | |
| status | ENUM('sent','failed') | |
| message_body | TEXT | Mensaje enviado |
| error_message | TEXT | Si falló |

---

## 🔧 Backend — NestJS

### Estructura de Módulos

```
src/
├── auth/               # Login admin, JWT
├── admins/             # CRUD admins
├── members/            # CRUD miembros
├── machines/           # CRUD máquinas + upload de archivos
├── routines/           # Lógica de plantillas y calendario
├── calendar/           # Consulta pública por cédula
├── whatsapp/           # Envío de mensajes + scheduler
├── uploads/            # Manejo de archivos estáticos
└── common/             # Guards, interceptors, DTOs compartidos
```

### Endpoints del Backend

#### Auth
```
POST   /api/auth/login                  → { token }
```

#### Miembros (requiere JWT)
```
GET    /api/members                     → Lista paginada
POST   /api/members                     → Crear miembro
GET    /api/members/:id                 → Ver miembro
PUT    /api/members/:id                 → Editar miembro
DELETE /api/members/:id                 → Desactivar miembro
GET    /api/members/search?cedula=xxx   → Buscar por cédula (público)
```

#### Máquinas (requiere JWT para write)
```
GET    /api/machines                    → Lista (público)
GET    /api/machines/:id                → Ver máquina (público)
POST   /api/machines                    → Crear + subir foto y video
PUT    /api/machines/:id                → Editar
DELETE /api/machines/:id                → Desactivar
POST   /api/machines/:id/photo          → Subir/reemplazar foto
POST   /api/machines/:id/video          → Subir/reemplazar video
```

#### Rutinas (requiere JWT)
```
GET    /api/routines/member/:memberId           → Plantilla activa del miembro
POST   /api/routines/member/:memberId           → Crear plantilla (genera calendario automático)
PUT    /api/routines/template/:templateId       → Editar plantilla base (regenera calendario)
GET    /api/routines/calendar/:memberId         → Ver calendario generado
PUT    /api/routines/calendar/entry/:entryId    → Editar manualmente una entrada del calendario
```

#### Consulta Pública (para tablet de autoservicio)
```
GET    /api/public/routine?cedula=xxx           → Retorna miembro + calendario de 2 meses
GET    /api/public/machines                     → Lista de máquinas con foto y video
```

#### WhatsApp (requiere JWT)
```
GET    /api/whatsapp/logs?memberId=xxx          → Ver historial de mensajes
POST   /api/whatsapp/test/:memberId             → Enviar mensaje de prueba manual
```

### Lógica de Generación del Calendario

Al crear o actualizar una `routine_template`, el sistema debe:

1. Obtener `start_date`, `cycle_days` y `duration_months` de la plantilla.
2. Calcular `end_date = start_date + duration_months meses`.
3. Iterar día a día desde `start_date` hasta `end_date`.
4. Por cada fecha, calcular `day_index = (fecha - start_date).days % cycle_days`.
5. Buscar el `routine_day` con ese `day_index`.
6. Si no hay entradas previas con `is_override = true` para esa fecha, crear/sobreescribir la `calendar_entry` copiando los ejercicios del día base.
7. Si ya existe una entrada con `is_override = true`, **no tocarla** (preservar edición manual).
8. Eliminar entradas futuras sin override antes de regenerar (desde hoy en adelante).

**Regla del `cycle_days`:** Si el administrador indica que el ciclo es de 8 días (lunes a lunes), `cycle_days = 8`. El sistema simplemente aplica el módulo sobre ese número. Esto se configura al crear la plantilla.

### Scheduler de WhatsApp

Usar `@nestjs/schedule` con un cron job:

```typescript
// Corre cada hora, revisa qué miembros deben recibir notificación en esta hora
@Cron('0 * * * *')
async sendDailyRoutines() {
  const currentHour = new Date().getHours();
  const members = await this.membersService.findByNotifyHour(currentHour);
  
  for (const member of members) {
    const todayEntry = await this.calendarService.getTodayEntry(member.id);
    if (todayEntry) {
      const message = this.buildWhatsAppMessage(member, todayEntry);
      await this.whatsappService.send(member.whatsapp_number, message);
    }
  }
}
```

Formato del mensaje de WhatsApp:
```
🏋️ *GymFlow — Rutina de hoy*
👤 Hola, {nombre}!

📅 *{día de la semana}, {fecha}*

{Si hay ejercicios:}
Tus ejercicios de hoy:

1️⃣ *{nombre máquina}*
   • Series: {sets} | Reps: {reps} | Peso: {weight}
   • Descanso: {rest_seconds}s
   📝 {notes si existen}

{notas del día si existen}

💪 ¡A darle duro!
```

---

## 🎨 Frontend — Next.js

### Estructura de Páginas

```
app/
├── page.tsx                        # Pantalla principal de tablet (2 botones)
├── rutina/
│   └── page.tsx                    # Buscar por cédula → ver calendario
├── ejercicios/
│   └── page.tsx                    # Catálogo de máquinas con videos
├── admin/
│   ├── login/page.tsx              # Login administrador
│   ├── dashboard/page.tsx          # Panel principal
│   ├── miembros/
│   │   ├── page.tsx                # Lista de miembros
│   │   ├── nuevo/page.tsx          # Crear miembro
│   │   └── [id]/page.tsx          # Editar miembro + gestionar rutina
│   ├── maquinas/
│   │   ├── page.tsx                # Lista de máquinas
│   │   ├── nueva/page.tsx          # Crear máquina + subir foto/video
│   │   └── [id]/page.tsx          # Editar máquina
│   └── rutinas/
│       └── [memberId]/page.tsx     # Gestionar plantilla y calendario del miembro
```

### Pantalla Principal (Tablet) — `/`

Diseño elegante y a pantalla completa. Fondo oscuro con estética de gimnasio.

- **Botón 1 — "Ver Mi Rutina"**
  - Ícono: 📅 o calendario
  - Redirige a `/rutina`
  - Color primario (naranja, rojo energético, o según branding)

- **Botón 2 — "Ver Ejemplo de Ejercicio"**
  - Ícono: 🎥 o mancuerna
  - Redirige a `/ejercicios`
  - Color secundario

Ambos botones deben ser grandes, táctiles (mínimo 200px de alto), con tipografía bold y clara visible desde lejos.

### Pantalla "Ver Mi Rutina" — `/rutina`

1. Input grande de cédula con teclado numérico on-screen (para tablet sin teclado físico) o teclado nativo.
2. Botón "Buscar".
3. Al encontrar al miembro, mostrar:
   - Nombre del miembro.
   - **Vista de calendario semanal** (tipo grilla de 7 columnas, cada columna = día).
   - Scroll horizontal para navegar semana a semana durante los 2 meses.
   - Cada celda del día muestra:
     - Etiqueta del día (Lunes, Martes…)
     - Lista resumida de ejercicios (nombre de máquina).
     - Al hacer clic/tap en un día, se abre un modal o panel lateral con el detalle completo:
       - Nombre de la máquina.
       - Series, reps, peso, descanso.
       - Notas.
       - Miniatura de foto de la máquina (con enlace a ver video).

### Pantalla "Ver Ejemplo de Ejercicio" — `/ejercicios`

- Grid de tarjetas de máquinas.
- Cada tarjeta muestra:
  - Foto de la máquina.
  - Nombre.
  - Al hacer clic, se abre modal con:
    - Nombre y descripción.
    - Reproductor de video embebido (HTML5 `<video>` tag con controles).

### Panel Admin — `/admin`

#### Dashboard
- Contadores: total miembros activos, máquinas registradas, notificaciones enviadas hoy.
- Accesos rápidos a secciones.

#### Gestión de Miembros (`/admin/miembros`)
Formulario de creación/edición incluye:
- Nombre completo
- Cédula
- Email (opcional)
- Número WhatsApp (con selector de prefijo de país)
- Hora de notificación WhatsApp (selector de 0–23h, con etiqueta "ej: 7 = 7:00am")
- Estado (activo/inactivo)

#### Gestión de Máquinas (`/admin/maquinas`)
Formulario incluye:
- Nombre
- Descripción
- Upload de foto (JPG/PNG, previsualización inmediata)
- Upload de video (MP4, con reproductor de previsualización)
- Estado activo/inactivo

#### Gestión de Rutinas (`/admin/rutinas/[memberId]`)

**Paso 1 — Configurar plantilla:**
- Fecha de inicio del primer ciclo.
- Duración en meses (por defecto toma el valor del `.env` pero es editable por miembro).
- Número de días del ciclo (default 7, editable — para ciclos que no cuadren en semanas exactas).

**Paso 2 — Definir días del ciclo base:**
- Formulario de N días (según `cycle_days`).
- Cada día tiene etiqueta editable (ej: "Lunes", "Día 1") y una lista de ejercicios.
- Por cada ejercicio: selector de máquina (búsqueda por nombre), series, reps, peso, descanso, notas, orden (drag & drop opcional).
- Botón "Añadir ejercicio" por día.
- Botón "Marcar como día de descanso".

**Paso 3 — Vista del calendario generado:**
- Al guardar la plantilla, el sistema genera el calendario completo.
- Se muestra una grilla por semanas con todos los días durante el período.
- Cada celda es editable inline (click en el día → editar ejercicios de ese día específico).
- Indicador visual para distinguir días generados automáticamente vs editados manualmente (ej: borde de color diferente, ícono de "editado").
- Botón "Regenerar desde plantilla" que respeta los días con override manual.

---

## 📤 Subida de Archivos

- El backend debe exponer el directorio `/uploads` como archivos estáticos via NestJS `ServeStaticModule`.
- Estructura de carpetas:
  ```
  uploads/
  ├── machines/
  │   ├── photos/
  │   └── videos/
  ```
- Validaciones de archivo:
  - Fotos: JPG, PNG. Máximo 5MB.
  - Videos: MP4, WebM. Máximo 100MB.
- Usar `multer` para el manejo de uploads en NestJS.
- Guardar en base de datos solo la ruta relativa (ej: `/uploads/machines/photos/machine_1.jpg`).

---

## 🔐 Autenticación Admin

- Login con username + password (bcrypt).
- JWT guardado en `localStorage` del navegador.
- Rutas `/admin/*` protegidas con middleware que verifica token.
- Si el token expira, redirigir automáticamente a `/admin/login`.
- Crear un admin inicial via script de seed o endpoint especial de primer uso.

---

## ✅ Validaciones y Reglas de Negocio

1. Un miembro puede tener solo UNA plantilla activa a la vez. Al crear una nueva, la anterior se desactiva.
2. El `cycle_days` no puede ser 0 ni negativo.
3. El número de WhatsApp debe estar en formato internacional (validar con regex: `^\+[1-9]\d{7,14}$`).
4. La hora de notificación debe ser un entero entre 0 y 23.
5. Al eliminar una máquina, verificar que no esté asignada en rutinas activas. Si lo está, mostrar advertencia y bloquear o desactivar sin eliminar.
6. Los videos en la vista pública nunca deben reproducirse automáticamente (autoplay = false) para no saturar la tablet.
7. La búsqueda por cédula es pública (no requiere login). Solo muestra datos del calendario, no datos de contacto.

---

## 🎨 Guía Visual del Frontend

- **Paleta de colores sugerida:** Fondo oscuro (`#0f0f0f` o `#1a1a2e`), acentos en naranja energético (`#FF6B35`) o rojo (`#E63946`). Texto blanco.
- **Tipografía:** Sans-serif bold para títulos (ej: `Inter`, `Barlow`, `Bebas Neue`).
- **Botones del tablet:** Tamaño mínimo 64px de alto, font-size mínimo 18px, bordes redondeados, sombra sutil.
- **Modo oscuro siempre activo** en la vista de tablet (considerando que puede estar en un ambiente con luz variable del gimnasio).
- **Iconos:** Usar `lucide-react` o `heroicons`.
- El diseño debe ser **responsive** pero optimizado principalmente para tablet (768px–1280px).

---

## 📋 Orden de Desarrollo Sugerido

1. Configurar Docker Compose + variables de entorno.
2. Configurar NestJS con TypeORM y conexión MySQL.
3. Crear migraciones de base de datos (todas las tablas).
4. Módulo `Auth` (login + JWT guard).
5. Módulo `Machines` (CRUD + upload de archivos).
6. Módulo `Members` (CRUD).
7. Módulo `Routines` (plantilla + lógica de generación de calendario).
8. Módulo `Calendar` (consulta pública).
9. Módulo `WhatsApp` (envío + scheduler).
10. Frontend: pantalla principal del tablet (2 botones).
11. Frontend: pantalla "Ver Mi Rutina" (búsqueda + calendario).
12. Frontend: pantalla "Ver Ejemplo de Ejercicio".
13. Frontend: panel admin completo (login, miembros, máquinas, rutinas).
14. Pruebas de integración WhatsApp con número real.
15. Ajustes finales de UI/UX para uso táctil en tablet.

---

## ⚙️ Variables de Entorno Configurables (Parámetros del Sistema)

| Variable | Por defecto | Descripción |
|---|---|---|
| `ROUTINE_DURATION_MONTHS` | 2 | Meses de duración del calendario |
| `WHATSAPP_DEFAULT_HOUR` | 7 | Hora de envío por defecto si no se especifica en el miembro |
| `MAX_VIDEO_SIZE_MB` | 100 | Tamaño máximo de video en MB |
| `MAX_PHOTO_SIZE_MB` | 5 | Tamaño máximo de foto en MB |

---

## 🚀 Comandos para Iniciar el Proyecto

```bash
# Levantar base de datos
docker-compose up -d

# Backend
cd backend
npm install
npm run migration:run
npm run seed          # Crear admin inicial
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```
# GIT
realiza commits periodicos con mensajes descriptivos
---

*Documento generado para desarrollo con vibecoding. Versión 1.0.*
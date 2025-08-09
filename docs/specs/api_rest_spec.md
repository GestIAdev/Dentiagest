Documento de Especificación de la API REST
1. Estructura General y Convenciones
URL Base: https://api.tuapp.com/v1

Formato de Datos: JSON (en las peticiones y respuestas).

Autenticación: Todas las rutas seguras requieren un Authorization: Bearer <token_jwt> en el encabezado de la petición.

2. Módulos y Endpoints Detallados
Aquí se definen las rutas de la API, organizadas por módulos, con una descripción detallada de lo que recibe, lo que devuelve y los códigos de estado.

Módulo de Autenticación (/auth)
POST /auth/register

Propósito: Crear un nuevo usuario.

Recibe: {"username": "string", "password": "string", "email": "string"}.

Devuelve: {"access_token": "string", "token_type": "bearer"}.

Códigos de Estado: 200 (Éxito), 400 (Datos inválidos o usuario ya existe).

POST /auth/login

Propósito: Iniciar sesión y obtener un token de acceso.

Recibe: {"username": "string", "password": "string"}.

Devuelve: {"access_token": "string", "token_type": "bearer"}.

Códigos de Estado: 200 (Éxito), 401 (Credenciales incorrectas).

POST /auth/refresh

Propósito: Renovar un token de acceso expirado.

Recibe: No requiere cuerpo, usa el refresh_token del usuario.

Devuelve: {"access_token": "string", "token_type": "bearer"}.

Códigos de Estado: 200 (Éxito), 401 (Token inválido o expirado).

Módulo de Pacientes (/patients)
GET /patients

Propósito: Obtener una lista de todos los pacientes, con opciones de paginación y búsqueda.

Parámetros de Consulta: ?search=string&page=integer&limit=integer.

Devuelve: Un array de objetos paciente.

"pacientes": [{"id": "uuid", "nombre": "string", "apellido": "string", ...}]

GET /patients/{patient_id}

Propósito: Obtener los detalles de un paciente específico.

Devuelve: Un objeto paciente completo.

{"id": "uuid", "nombre": "string", "apellido": "string", ...}

Códigos de Estado: 200 (Éxito), 404 (Paciente no encontrado).

POST /patients

Propósito: Crear un nuevo paciente.

Recibe: {"nombre": "string", "apellido": "string", "fecha_nacimiento": "YYYY-MM-DD", "telefono": "string"}.

Devuelve: El objeto del paciente recién creado.

PUT /patients/{patient_id}

Propósito: Actualizar los datos de un paciente.

Recibe: Los campos a actualizar del paciente.

Devuelve: El objeto del paciente actualizado.

DELETE /patients/{patient_id}

Propósito: Eliminar un paciente.

Códigos de Estado: 204 (Sin contenido, éxito).

Módulo de Citas (/appointments)
GET /appointments

Propósito: Obtener todas las citas, con filtros por fecha.

Parámetros de Consulta: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD.

Devuelve: Un array de objetos cita.

"citas": [{"id": "uuid", "paciente_id": "uuid", "start_time": "ISO-8601", ...}]

POST /appointments

Propósito: Crear una nueva cita.

Recibe: {"paciente_id": "uuid", "start_time": "ISO-8601", "end_time": "ISO-8601", "motivo": "string"}.

Devuelve: El objeto de la cita recién creada.

Módulo de Historiales (/records)
GET /records/{patient_id}

Propósito: Obtener el historial clínico de un paciente específico.

Devuelve: Un array de objetos de historial.

"historiales": [{"id": "uuid", "paciente_id": "uuid", "diagnostico": "string", ...}]

POST /records

Propósito: Crear una nueva entrada en el historial clínico.

Recibe: {"paciente_id": "uuid", "diagnostico": "string", "tratamiento": "string"}.

Devuelve: El objeto de historial recién creado.

Módulo de IA (/ai)
POST /ai/analysis/image

Propósito: Procesar una imagen para análisis de diagnóstico.

Recibe: {"imagen_base64": "string"}.

Devuelve: {"analisis_ia": "string", "hallazgos": ["string", "string"], "confianza": "integer"}.

POST /ai/assistant/voice

Propósito: Procesar un comando de voz del odontólogo.

Recibe: {"comando_texto": "string"}.

Devuelve: {"accion_confirmada": "boolean", "mensaje": "string"}.
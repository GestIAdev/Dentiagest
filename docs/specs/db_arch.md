Documento de Arquitectura de Base de Datos (PostgreSQL)
1. Resumen y Principios de Diseño
La base de datos está diseñada para ser la fuente única de verdad para toda la aplicación. Se prioriza la seguridad, la integridad de los datos y la escalabilidad.

Encriptación: Los datos sensibles, como las contraseñas, se almacenarán con algoritmos de encriptación seguros (por ejemplo, bcrypt). Los datos clínicos se almacenarán en tablas con acceso controlado y auditoría de cambios.

Normalización: Se utilizarán relaciones y claves foráneas para evitar la duplicación de datos y mantener la coherencia.

Auditoría: Se incluirán campos de auditoría (created_at, updated_at, user_id_created) en las tablas clave para rastrear quién hizo qué y cuándo.

2. Estructura de Tablas y Relaciones
Tabla users (Usuarios)
Almacena la información de los usuarios con un enfoque en la seguridad.

id (UUID): Identificador único del usuario.

username (VARCHAR): Nombre de usuario único.

email (VARCHAR): Correo electrónico único.

password_hash (VARCHAR): Hash de la contraseña encriptada.

is_admin (BOOLEAN): Define si el usuario tiene privilegios de administrador.

is_mfa_enabled (BOOLEAN): Indica si la autenticación de dos factores está activada.

mfa_secret (TEXT): Secreto para la autenticación de dos factores (encriptado).

created_at (TIMESTAMPTZ): Marca de tiempo de creación.

updated_at (TIMESTAMPTZ): Marca de tiempo de última actualización.

Tabla patients (Pacientes)
Contiene la información personal y de contacto de los pacientes.

id (UUID): Identificador único del paciente.

nombre (VARCHAR).

apellido (VARCHAR).

fecha_nacimiento (DATE).

telefono (VARCHAR).

email (VARCHAR).

created_by (UUID): Referencia a users.id.

created_at (TIMESTAMPTZ).

updated_at (TIMESTAMPTZ).

Tabla records (Historiales Clínicos)
Almacena el historial médico detallado de cada paciente.

id (UUID): Identificador único del historial.

patient_id (UUID): Clave foránea que referencia a patients.id.

fecha (DATE): Fecha de la consulta o tratamiento.

diagnostico (TEXT).

tratamiento (TEXT).

created_by (UUID): Referencia a users.id.

created_at (TIMESTAMPTZ).

updated_at (TIMESTAMPTZ).

Tabla appointments (Citas)
Organiza las citas de los pacientes con el dentista.

id (UUID): Identificador único de la cita.

patient_id (UUID): Clave foránea a patients.id.

start_time (TIMESTAMPTZ): Inicio de la cita.

end_time (TIMESTAMPTZ): Finalización de la cita.

motivo (TEXT).

status (VARCHAR): Estado de la cita (programada, completada, cancelada).

created_by (UUID): Referencia a users.id.

created_at (TIMESTAMPTZ).

updated_at (TIMESTAMPTZ).

Tabla media (Archivos Multimedia)
Gestiona las imágenes y radiografías de los pacientes.

id (UUID): Identificador único del archivo.

record_id (UUID): Clave foránea a records.id.

tipo (VARCHAR): Tipo de archivo (imagen, radiografia).

url (TEXT): URL donde se almacena el archivo (ej. en un servicio de almacenamiento en la nube).

descripcion (TEXT).

created_by (UUID): Referencia a users.id.

created_at (TIMESTAMPTZ).
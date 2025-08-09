1. Tabla users (Usuarios)
Almacena la información de los usuarios con un enfoque en la seguridad.

id (UUID): Clave Primaria. Identificador único del usuario. No nulo.

username (VARCHAR(255)): Nombre de usuario. No nulo y único.

email (VARCHAR(255)): Correo electrónico. No nulo y único.

password_hash (VARCHAR(255)): Hash de la contraseña. No nulo.

is_admin (BOOLEAN): Define privilegios de administrador. Valor por defecto: FALSE.

is_mfa_enabled (BOOLEAN): Autenticación de dos factores. Valor por defecto: FALSE.

mfa_secret (TEXT): Secreto MFA. No nulo si is_mfa_enabled es TRUE.

created_at (TIMESTAMPTZ): Marca de tiempo de creación. No nulo.

updated_at (TIMESTAMPTZ): Marca de tiempo de última actualización. No nulo.

2. Tabla patients (Pacientes)
Contiene la información personal de los pacientes.

id (UUID): Clave Primaria. Identificador único del paciente. No nulo.

nombre (VARCHAR(255)): Nombre. No nulo.

apellido (VARCHAR(255)): Apellido. No nulo.

fecha_nacimiento (DATE): Fecha de nacimiento.

telefono (VARCHAR(255)): Teléfono.

email (VARCHAR(255)): Correo electrónico.

created_by (UUID): Clave Foránea que referencia a users.id. No nulo.

created_at (TIMESTAMPTZ): Marca de tiempo de creación. No nulo.

updated_at (TIMESTAMPTZ): Marca de tiempo de última actualización. No nulo.

3. Tabla records (Historiales Clínicos)
Almacena el historial médico detallado de cada paciente.

id (UUID): Clave Primaria. Identificador único del historial. No nulo.

patient_id (UUID): Clave Foránea que referencia a patients.id. No nulo.

fecha (DATE): Fecha de la consulta. No nulo.

diagnostico (TEXT): Diagnóstico. No nulo.

tratamiento (TEXT): Tratamiento.

created_by (UUID): Clave Foránea que referencia a users.id. No nulo.

created_at (TIMESTAMPTZ): Marca de tiempo de creación. No nulo.

updated_at (TIMESTAMPTZ): Marca de tiempo de última actualización. No nulo.

4. Tabla appointments (Citas)
Organiza las citas de los pacientes.

id (UUID): Clave Primaria. Identificador único de la cita. No nulo.

patient_id (UUID): Clave Foránea a patients.id. No nulo.

start_time (TIMESTAMPTZ): Inicio de la cita. No nulo.

end_time (TIMESTAMPTZ): Finalización de la cita. No nulo.

motivo (TEXT): Motivo de la consulta.

status (VARCHAR(50)): Estado de la cita. Valor por defecto: 'programada'. No nulo.

created_by (UUID): Clave Foránea que referencia a users.id. No nulo.

created_at (TIMESTAMPTZ): Marca de tiempo de creación. No nulo.

updated_at (TIMESTAMPTZ): Marca de tiempo de última actualización. No nulo.

5. Tabla media (Archivos Multimedia)
Gestiona imágenes y radiografías.

id (UUID): Clave Primaria. Identificador único del archivo. No nulo.

record_id (UUID): Clave Foránea a records.id. No nulo.

tipo (VARCHAR(50)): Tipo de archivo. Ej: 'imagen', 'radiografia'. No nulo.

url (TEXT): URL del archivo. No nulo.

descripcion (TEXT): Descripción del archivo.

created_by (UUID): Clave Foránea que referencia a users.id. No nulo.

created_at (TIMESTAMPTZ): Marca de tiempo de creación. No nulo.
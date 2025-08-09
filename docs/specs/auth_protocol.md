Estrategia de Autenticación y Seguridad
Este documento detalla los principios y las implementaciones de seguridad para proteger la aplicación y los datos de los usuarios.

1. Autenticación de Usuarios
Hasheo de Contraseñas: Las contraseñas de los usuarios nunca se almacenarán en texto plano. Se utilizará el algoritmo de hasheo bcrypt para encriptarlas. bcrypt es un estándar de la industria que incluye un "salt" automáticamente para evitar ataques de diccionarios y de tablas rainbow.

Tokens de Autenticación (JWT): El sistema utilizará JSON Web Tokens (JWT) para la gestión de sesiones. Esto permite una autenticación segura y sin estado.

Los tokens de acceso (access_token) tendrán una vida útil corta (ej. 15 minutos) para minimizar el riesgo en caso de ser robados.

Los tokens de refresco (refresh_token) tendrán una vida útil más larga y solo se usarán para generar nuevos tokens de acceso.

Autenticación en Dos Pasos (MFA): Se ofrecerá MFA como una opción para los usuarios.

El sistema generará un secreto de MFA que se almacenará encriptado en la base de datos.

El usuario lo vinculará con una aplicación como Google Authenticator.

Para el login, se requerirá un código de un solo uso además de la contraseña.

2. Control de Acceso y Roles
Autorización Basada en Roles: Se implementará un sistema de roles para controlar el acceso a la API.

admin: Acceso total. Puede ver métricas, gestionar usuarios y la configuración de la clínica.

odontologo: Acceso a la ficha de pacientes, historiales, agenda y funcionalidades de IA.

recepcionista: Acceso a la agenda y a la información de contacto de los pacientes, pero no a sus historiales clínicos.

Protección de Endpoints: Cada endpoint de la API estará protegido por un decorador que valide si el usuario tiene el token y el rol correctos. Por ejemplo, el endpoint de métricas solo será accesible para usuarios con rol admin.

3. Seguridad de los Datos (HIPAA-Compliance-like)
Aunque no estamos obligados a cumplir con HIPAA en Argentina, usaremos sus principios como guía para la seguridad de los datos de salud.

Datos en Tránsito: Toda la comunicación entre el frontend y el backend será a través de HTTPS/TLS. El certificado SSL garantizará que los datos estén encriptados durante la transmisión.

Datos en Reposo: Los datos sensibles de los pacientes se almacenarán en la base de datos de forma segura, con controles de acceso estrictos.

Auditoría de Acceso: Cualquier acceso o modificación a los historiales clínicos será registrado en un log de auditoría. Este log incluirá el user_id, patient_id y timestamp de la acción.

4. Prácticas de Desarrollo Seguro
Validación de Entradas: Todas las entradas del usuario (formularios, datos de la API) serán validadas y sanitizadas para prevenir ataques como la inyección de SQL o Cross-Site Scripting (XSS).

Gestión de Errores: Los mensajes de error de la API no revelarán información sensible sobre el servidor o la base de datos.

Dependencias Actualizadas: Se utilizarán herramientas para monitorear y actualizar automáticamente las librerías del proyecto, minimizando las vulnerabilidades de seguridad conocidas.
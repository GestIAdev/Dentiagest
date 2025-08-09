Requerimientos No Funcionales
Este documento detalla las condiciones y restricciones del sistema, centrándose en la calidad y la seguridad. Son los "requisitos de rendimiento" de nuestro software.

1. Seguridad y Privacidad (Prioridad Máxima)
Protección de Datos:

Todas las contraseñas de los usuarios deben almacenarse como hashes encriptados utilizando algoritmos robustos (como bcrypt).

Los datos de salud de los pacientes deben almacenarse en tablas con control de acceso estricto y ser accedidos solo por usuarios autorizados.

La comunicación entre el frontend y el backend debe ser siempre a través de HTTPS, garantizando la encriptación de los datos en tránsito.

Autenticación:

El sistema debe implementar un sistema de autenticación de dos factores (MFA) como opción para los usuarios.

Los tokens de acceso (JWT) deben tener una vida útil corta y deben poder ser revocados.

Auditoría:

Cualquier modificación en el historial clínico de un paciente debe ser registrada en un log de auditoría con la fecha, la hora y el usuario que realizó el cambio.

2. Fiabilidad y Escalabilidad
Disponibilidad: El sistema debe tener un tiempo de actividad mínimo del 99,9% para evitar interrupciones en el flujo de trabajo de la clínica.

Respaldo de Datos: Se deben implementar copias de seguridad automáticas y periódicas de la base de datos para prevenir la pérdida de datos.

Tolerancia a Fallos: La arquitectura de la aplicación debe estar diseñada para recuperarse de errores sin que el sistema se caiga por completo.

Escalabilidad Horizontal: La arquitectura debe permitir añadir más servidores fácilmente si la base de usuarios crece. Los contenedores de Docker facilitarán este proceso.

3. Rendimiento y Usabilidad
Tiempo de Respuesta: La aplicación debe ser rápida y responsiva. Las consultas a la base de datos y las llamadas a la API deben responder en menos de 500 milisegundos.

Procesamiento Asíncrono: Las tareas pesadas (como el análisis de radiografías con IA) deben ejecutarse en segundo plano (con Redis) para no bloquear la interfaz de usuario.

Interfaz de Usuario (UI): La interfaz debe ser intuitiva y fácil de usar, con una curva de aprendizaje mínima para el odontólogo.

4. Mantenimiento y Despliegue
Código Limpio: El código debe ser modular y bien documentado para facilitar futuras actualizaciones y correcciones de errores.

Despliegue Continuo (CI/CD): Se deben implementar procesos automatizados para el despliegue del código en producción. Docker y Docker Compose son la base para esto.

Manejo de Errores: El sistema debe tener un registro de errores robusto para facilitar la depuración y la resolución de problemas.
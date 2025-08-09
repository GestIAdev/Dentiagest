Documento de Flujo de Usuario Detallado
1. Resumen y Principios de Diseño
El diseño del flujo de usuario se centra en la eficiencia y la intuición. La aplicación está diseñada para adaptarse al rol del usuario, ya sea un odontólogo que trabaja solo o en una clínica con varios miembros en el equipo. El objetivo es que las tareas diarias se realicen con el menor número de clics posible.

2. Flujo de Usuario - Odontólogo (En Solitario o con Equipo)
El flujo del odontólogo se enfoca en la interacción clínica, la toma de decisiones asistida por IA y, si trabaja solo, también en la gestión administrativa.

Paso 1: Inicio de Sesión y Acceso a la Agenda

El usuario ingresa su username y password en el formulario de login.

La app valida las credenciales a través del endpoint /auth/login.

Si la autenticación es exitosa, el usuario es redirigido a la pantalla principal, que es la Agenda Diaria.

Si la autenticación de dos factores está activada, se le solicita un código adicional.

Paso 2: Gestión de la Agenda de Citas

Desde la agenda, puede ver las citas del día (llamada GET a /appointments?date=YYYY-MM-DD).

Puede crear una nueva cita o un nuevo paciente directamente desde la agenda, sin necesidad de cambiar de pantalla. La app realiza las llamadas POST correspondientes a /patients y /appointments.

Paso 3: Preparación de la Consulta y Acceso a Ficha Clínica

El odontólogo hace clic en una cita para ver los detalles del paciente.

La app carga la ficha del paciente a través de una llamada GET a /patients/{patient_id}, que incluye su información personal y su historial clínico.

Paso 4: Registro en el Historial con Asistente de Voz

Desde la ficha del paciente, activa el asistente de voz.

El audio se convierte en texto y se envía a la API de IA.

La IA procesa el comando (promt_ia_logi.md) y el backend actualiza la base de datos a través de una llamada POST a /records, registrando los hallazgos y tratamientos en tiempo real.

Paso 5: Visualización de Imágenes y Simulaciones

El odontólogo sube radiografías o fotos a través de la interfaz. Estas imágenes se envían al endpoint /media y se asocian al historial.

Para el análisis de diagnóstico, la app envía la radiografía a /ai/analysis/image y muestra los resultados de la IA en una vista superpuesta.

Para la simulación estética, la app hace una llamada a /ai/simulation/image y muestra la imagen generada, permitiendo comparar el antes y el después.

3. Flujo de Usuario - Recepcionista (Rol Especializado)
El rol de la recepcionista se enfoca principalmente en las tareas administrativas, utilizando la misma interfaz de manera optimizada.

Paso 1: Gestión de la Agenda y Recordatorios

Su pantalla principal es la Agenda Diaria.

Puede crear citas y pacientes, y visualizar los detalles de cada cita.

La aplicación se encarga de enviar recordatorios automáticos de citas, liberándola de esta tarea manual.

Paso 2: Búsqueda y Gestión de Pacientes

Utiliza la barra de búsqueda para encontrar pacientes rápidamente.

Puede editar la información de contacto o los datos personales de un paciente, haciendo una llamada PUT a /patients/{patient_id}.

4. Flujo de Usuario - Administrador
El rol del administrador se centra en el rendimiento y la configuración de la clínica.

Paso 1: Acceso a Métricas y Reportes

El administrador accede a un dashboard especializado (/admin/dashboard) que muestra métricas clave (KPIs) del rendimiento de la clínica.

La app hace varias llamadas GET a endpoints de métricas (/metrics/revenue, /metrics/appointments) para visualizar ingresos, número de citas, etc.

Paso 2: Gestión de la Suscripción

Navega a la sección de "Facturación" para ver el estado de la suscripción, el consumo de APIs de IA y las facturas anteriores.

Tiene el control total para decidir si renueva el servicio para el próximo mes.
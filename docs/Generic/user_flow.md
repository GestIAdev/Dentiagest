Documento de Flujo de Usuario (User Flow)
1. Resumen y Principios de Diseño
El flujo de usuario está diseñado para ser intuitivo y eliminar pasos innecesarios. El objetivo es que el odontólogo pueda realizar sus tareas diarias con el menor número de clics posible.

2. Flujo Principal del Usuario
Este es el viaje típico que un usuario (recepcionista o odontólogo) haría en la aplicación.

Paso 1: Inicio de Sesión y Acceso al Panel de Control

El usuario ingresa su username y password en el formulario de login.

La app valida las credenciales a través del endpoint /auth/login.

Si el login es exitoso, se le redirige al Panel de Control (/dashboard).

Si la autenticación de dos factores está activada, se le solicita un código adicional antes de acceder.

Paso 2: Gestión de la Agenda de Citas

Desde el Panel de Control, el usuario accede a la agenda de citas (/appointments).

La app hace una llamada GET al endpoint /appointments para mostrar la lista de citas del día.

Para crear una nueva cita, el usuario llena un formulario y la app hace una llamada POST a /appointments.

Paso 3: Búsqueda y Gestión de Pacientes

El usuario busca un paciente por nombre en la barra de búsqueda del Panel de Control.

La app hace una llamada GET al endpoint /patients con un filtro de búsqueda.

Al seleccionar un paciente, se le redirige a su página de perfil (/patients/{patient_id}), que muestra su información personal y su historial clínico.

Paso 4: Registro en el Historial con Asistente de Voz

El usuario navega a la ficha del paciente (/records/{patient_id}).

Activa el asistente de voz y empieza a dictar los hallazgos y tratamientos.

El audio se convierte en texto y se envía a la API de IA.

La IA procesa el comando y el backend actualiza la base de datos a través de una llamada POST a /records.

Paso 5: Visualización de Imágenes y Simulaciones

Desde la ficha del paciente, el usuario sube radiografías o fotos a través de la interfaz.

Estas imágenes se envían al endpoint /media y se asocian al historial.

Para la simulación estética, el usuario selecciona una foto y activa la IA, que procesa la imagen a través del endpoint /ai/analysis/image y muestra el resultado en pantalla.
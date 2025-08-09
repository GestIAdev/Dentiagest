Especificaciones de Componentes y Frontend
Este documento fusiona la guía de estilo, la gestión de estado y el diseño lógico en un único manual de referencia para el desarrollo del frontend. El objetivo es que Claude tenga toda la información que necesita para construir la interfaz de usuario de manera coherente y eficiente.

1. Estructura de Archivos y Componentes
La estructura de carpetas seguirá una convención estándar de React para facilitar la escalabilidad.

src/components: Aquí se almacenarán todos los componentes reutilizables (botones, tarjetas, etc.).

src/pages: Aquí irán los componentes que representan las vistas principales (por ejemplo, Dashboard.jsx, LoginPage.jsx).

src/context: Contendrá los archivos del Context API para la gestión del estado global.

src/hooks: Para los hooks personalizados.

src/styles: Archivo de configuración de Tailwind CSS.

2. Guía de Estilo y Paleta de Colores
Se seguirán las reglas de diseño ya definidas en la style_component_guide.md. La paleta de colores, tipografía y los estilos de los componentes (botones, tarjetas, modales) se implementarán a través de la configuración de Tailwind.

3. Estrategia de Gestión de Estado
Se aplicará la estrategia detallada en state_management_strategy.md.

Estado Global del Usuario: Gestionado por un AuthContext, que almacenará el token JWT, el rol del usuario y su información básica.

Estado Local: Se usará useState para el estado interno de los componentes (por ejemplo, el texto de un input, el estado de un modal).

Estado del Servidor (opcional): Se sugiere el uso de React Query para la gestión del estado que proviene de la API, encargándose del caching y las actualizaciones.

4. Especificaciones de Componentes y Props
A continuación, se detallan algunos de los componentes principales y los props que recibirán.

<Button>:

props: type (primario, secundario, alerta), onClick (función de manejo), disabled (booleano).

<Card>:

props: children (el contenido del interior), onClick (opcional).

<Navbar>:

props: user (objeto de usuario con nombre y rol), onLogout (función de cierre de sesión).

<Dashboard> (página):

Contenido: Se basará en el logical_mockups.md.

props: Recibirá los datos de citas y resúmenes del día del estado global de la aplicación.

<PatientProfile> (página):

Contenido: Estará dividido en pestañas, como se detalla en el logical_mockups.md.

props: Recibirá el patient_id para realizar la llamada a la API y obtener los datos del paciente.
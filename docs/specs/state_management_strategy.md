Estrategia de Gestión de Estado
Este documento define cómo se manejarán, actualizarán y sincronizarán los datos en la interfaz de usuario. Una buena estrategia de estado es la clave para una aplicación de React que sea fácil de mantener y escalar.

1. Tipos de Estado en la Aplicación
Vamos a dividir el estado en tres categorías principales.

Estado Local del Componente: Datos que solo son relevantes para un componente específico. Por ejemplo, el texto de un campo de búsqueda o si un modal está abierto. Se gestiona con el hook useState de React.

Estado Global del Usuario: Datos que deben estar disponibles en toda la aplicación, como la información del usuario autenticado (access_token, username, rol).

Estado Global de la Aplicación: Datos que se comparten entre varios componentes y que son fundamentales para la lógica del negocio. Por ejemplo, la lista de pacientes, las citas del día o los historiales clínicos.

2. Herramientas de Gestión de Estado
Para gestionar estos tipos de estado, utilizaremos una combinación de las herramientas que ya tenemos.

Para el Estado Global del Usuario y la Aplicación
React Context API: Esta es la herramienta nativa de React y es perfecta para el estado global del usuario. Crearemos un AuthContext para almacenar el token de acceso, el rol del usuario y su información básica. Esto nos permite acceder a estos datos desde cualquier componente sin tener que pasarlos como "props" a cada uno.

Redux Toolkit (Opcional): Si el estado global de la aplicación se vuelve muy complejo, podemos considerar el uso de Redux Toolkit. Es una librería estándar para gestionar estados complejos de manera predecible, pero para el MVP, la Context API debería ser suficiente.

Para el Estado de Servidor
React Query (Opcional): Para la gestión de datos que se obtienen del backend (como la lista de pacientes o las citas), podemos usar una librería como React Query. Esta herramienta se encarga de la sincronización, el caching, la paginación y la gestión de errores de las llamadas a la API, simplificando enormemente el trabajo.

3. Flujo de Datos y Sincronización
El flujo de datos en nuestra aplicación seguirá un patrón unidireccional, lo que significa que el estado solo se actualiza en un sentido.

Obtención de Datos: Un componente realiza una llamada a la API (usando useEffect o una librería como React Query).

Actualización del Estado: La respuesta de la API se utiliza para actualizar el estado global de la aplicación (usando el Context API o Redux).

Sincronización de la UI: Cualquier componente que necesite esos datos se suscribe a ese estado y se actualiza automáticamente cuando cambia.
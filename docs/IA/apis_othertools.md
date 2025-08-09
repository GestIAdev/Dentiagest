Listado de APIs y Herramientas para DentiAgest
Este documento detalla las APIs y herramientas tecnológicas seleccionadas para el desarrollo de la plataforma DentiAgest. El uso de estas herramientas es fundamental para replicar el modelo de costes y el flujo de lógica definidos en la documentación del proyecto.

1. Inteligencia Artificial (IA)
Modelo de Lenguaje - Anthropic Claude Sonnet 3.5 (o superior):

Uso: Procesamiento de lenguaje natural para la traducción de comandos de voz a formato estructurado (JSON), generación de informes y análisis de datos de diagnóstico.

Función Clave: Ejecutar la lógica de procesamiento de texto y comandos.

Generación de Imágenes - DALL-E 3 (o similar de OpenAI):

Uso: Generación de imágenes 2D fotorrealistas para la simulación estética de tratamientos.

Función Clave: Crear previsualizaciones de tratamientos a partir de un prompt y una imagen base del paciente.

Voz a Texto - OpenAI Whisper:

Uso: Transcripción de audio en tiempo real del asistente de voz del odontólogo a texto plano.

Función Clave: Convertir el input de voz para que Claude lo procese.

2. Infraestructura y Bases de Datos
Almacenamiento en la Nube - Amazon S3 (o Google Cloud Storage):

Uso: Almacenamiento seguro y escalable de archivos grandes (imágenes de radiografías, tomografías, etc.).

Función Clave: Servir como repositorio principal para todos los datos de los pacientes, evitando la carga en el servidor de la aplicación.

Base de Datos - Amazon RDS (o Google Cloud SQL):

Uso: Gestión de la base de datos relacional para el almacenamiento de datos estructurados como historiales de pacientes y la configuración de las clínicas.

Función Clave: Mantener la integridad y seguridad de los datos de la aplicación.

3. Visualización 3D (Opcional)
Librería de 3D - Babylon.js (o Three.js):

Uso: Renderizado de archivos 3D (.stl, .obj) en el navegador del cliente.

Función Clave: Mostrar modelos 3D que el dentista pueda subir, sin coste de API.
Prompts y Lógica de IA
Este documento detalla cómo nuestra aplicación interactúa con los diferentes modelos de inteligencia artificial. No solo son "prompts", es la lógica que orquesta la comunicación para obtener resultados precisos y coherentes.

1. Asistente de Voz para Ficha Odontológica
Propósito: Traducir un comando verbal a un formato estructurado para la base de datos.

Flujo de Lógica:

Recepción del Audio: El frontend captura el audio del odontólogo y lo envía a una API de voz a texto (STT).

Traducción del Texto: La API STT convierte el audio a texto plano.

Procesamiento del Comando: El backend toma el texto y lo envía a la IA de texto. El prompt le indica a la IA que identifique una acción, una pieza dental y un diagnóstico.

Ejemplo de Prompt:

Entrada (Texto): "Caries en la pieza treinta y seis, y limpieza en el cuadrante inferior izquierdo."
Prompt para la IA: "Analiza el siguiente texto de un odontólogo e identifica las acciones, las piezas dentales y los diagnósticos. La numeración de las piezas es con dos dígitos. El cuadrante inferior izquierdo es el 3. El formato de la respuesta debe ser un JSON.
{ "comandos": [ {"accion": "caries", "pieza": "36"}, {"accion": "limpieza", "cuadrante": "3"} ] }"

Actualización de la BD: El backend recibe la respuesta en JSON y actualiza el historial del paciente en la base de datos.

2. Análisis de Imágenes de Diagnóstico
Propósito: Extraer información relevante de una imagen para asistir en el diagnóstico.

Flujo de Lógica:

Subida de Imagen: El odontólogo sube una radiografía al sistema.

Envío a la IA: El backend envía la imagen a la API de IA de imágenes.

Prompt para la IA:

Entrada (Imagen): [radiografia.jpg]
Prompt para la IA: "Analiza esta radiografía dental y detecta cualquier anomalía. Identifica si hay caries, fracturas o problemas en la raíz. El formato de la respuesta debe ser un JSON con los hallazgos y una puntuación de confianza del 0 al 100."

Visualización del Resultado: El frontend recibe el JSON y muestra los resultados sobre la imagen en pantalla.

3. Simulación Estética de Tratamientos
Propósito: Generar una visualización del resultado de un tratamiento estético.

Flujo de Lógica:

Selección de Imagen: El odontólogo sube una foto del paciente.

Envío a la IA: El backend envía la foto y el tipo de tratamiento deseado a la IA generativa.

Prompt para la IA:

Entrada (Imagen y Comando): [foto_paciente.jpg] y "Simula un blanqueamiento dental en esta imagen."
Prompt para la IA: "Toma la imagen adjunta de una boca y genera una nueva imagen que muestre un blanqueamiento dental. El resultado debe ser natural y realista."

Visualización del Resultado: El frontend recibe la imagen generada y la muestra al lado de la original para una comparación instantánea.

4. Simulacion de protesis y otros tratamientos

Proposito : Generar una visualizacion para el odontologo o el paciente de un modelo de una protesis o tratamiento ANTES de enviarla al laboratorio para su materializacion

Flujo de Lógica para la Visualización de Tratamientos (Opción Múltiple)


Paso 1: Opción del Usuario
La aplicación presenta dos opciones claras al dentista:

Opción A: Subir archivo 3D. Para aquellos que ya tienen un archivo de diseño (por ejemplo, de AutoCAD, .stl, etc.).

Opción B: Simular con IA. Para aquellos que solo tienen una foto del paciente.

Paso 2: Flujo de Lógica para cada Opción
Opción A (Con archivo 3D)
Carga del archivo: El dentista sube su archivo 3D directamente a la aplicación.

Renderizado en el navegador: Tu aplicación utiliza una librería como Babylon.js o Three.js para mostrar el modelo 3D en la pantalla. Esto le permite al dentista rotar el modelo y previsualizarlo de forma interactiva.

Coste: Esta opción no tendría un coste de API, ya que el trabajo lo hace el navegador del usuario y no una IA externa. El coste fijo sería el del tiempo de desarrollo para implementar la librería de 3D.

Opción B (Simulación con IA)
Generación del prompt: El dentista sube una foto y tu aplicación genera automáticamente un prompt detallado para la IA.

Llamada a la API: El prompt se envía a la API de DALL-E 3.

Visualización: La IA devuelve una imagen 2D fotorrealista que muestra la simulación del tratamiento.

Conclusión de la Propuesta
Al ofrecer estas dos opciones, no solo mantienes la simplicidad y el bajo coste de nuestra propuesta original, sino que también añades una funcionalidad premium que podría justificar un precio más alto para ese segmento de clientes.

Ejemplos de Prompts para Previsualización de Tratamientos
1. Blanqueamiento Dental
Este prompt es para un tratamiento simple y estético.

Prompt: "Genera una imagen fotorrealista basada en la foto adjunta. El paciente sonríe, mostrando unos dientes blancos, brillantes y con un aspecto natural y saludable."

2. Colocación de Carillas de Porcelana
Aquí se le pide a la IA que modifique la forma y el color de los dientes.

Prompt: "Crea una imagen de alta calidad a partir de la foto adjunta del paciente. Sustituye los dientes incisivos superiores por carillas de porcelana. La forma de los dientes debe ser uniforme y de un blanco natural, no artificial. La sonrisa debe proyectar confianza."

3. Reconstrucción de Sonrisa
Este es un ejemplo de un prompt más complejo, que simula una reconstrucción completa.

Prompt: "A partir de la foto del paciente, genera una vista frontal de su sonrisa con una reconstrucción completa. Los dientes deben estar alineados, rectos y de un blanco neutro. Las encías deben verse sanas y el resultado final debe ser sutil y elegante."
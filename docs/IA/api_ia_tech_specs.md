Especificaciones Técnicas de Integración con APIs de IA
Este documento detalla la configuración y la lógica de integración entre el backend de FastAPI y las APIs de IA externas. El objetivo es que la comunicación sea segura, eficiente y robusta.

1. Configuración de Credenciales y Seguridad
Las claves de API nunca deben estar en el código. Se almacenarán como variables de entorno y se accederán a ellas a través de un archivo .env.

OPENAI_API_KEY: Clave de acceso para la API de OpenAI.

AI_PROVIDER_URL: URL base de la API de IA (ej. https://api.openai.com/v1/).

2. Módulos y Endpoints de Integración
El backend tendrá un módulo de IA que encapsulará toda la lógica de comunicación con las APIs externas.

Endpoint Interno del Backend: POST /ai/assistant/voice

Propósito: Procesar un comando de voz del odontólogo.

Lógica:

El backend recibe el texto del comando.

Construye una petición HTTP para la API de IA, incluyendo la clave de API en el encabezado Authorization.

Envía la petición a la URL de OpenAI para el modelo de lenguaje (ej. https://api.openai.com/v1/chat/completions).

El prompt de la petición seguirá la estructura definida en promt_ia_logi.md.

El backend recibe la respuesta, extrae la información relevante (en formato JSON) y la utiliza para actualizar la base de datos.

Manejo de Errores: Si la API de IA devuelve un error (ej. 401 por una clave incorrecta o 500 por un error interno), el backend debe registrar el error y devolver un mensaje de error claro al frontend (500 Internal Server Error).

Endpoint Interno del Backend: POST /ai/analysis/image

Propósito: Analizar una imagen para un diagnóstico.

Lógica:

El backend recibe la imagen en formato Base64.

Construye la petición HTTP para la API de IA de visión (ej. https://api.openai.com/v1/images/generations).

El prompt para la IA de visión también se construirá siguiendo la lógica de promt_ia_logi.md.

Manejo de errores: Se aplicará la misma lógica que para el asistente de voz.

3. Formatos de Petición y Respuesta
La comunicación con las APIs de IA utilizará el protocolo HTTP.

Encabezados: Todas las peticiones deben incluir Content-Type: application/json y Authorization: Bearer OPENAI_API_KEY.

Cuerpo de la Petición (ejemplo para asistente de voz):

JSON

{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "Analiza el texto de un odontólogo y devuelve JSON..."},
    {"role": "user", "content": "Caries en la pieza 36..."}
  ],
  "temperature": 0.5
}
Cuerpo de la Respuesta (ejemplo de la API de IA):

JSON

{
  "choices": [
    {"message": {"content": "{\"comandos\": [{\"accion\": \"caries\", \"pieza\": \"36\"}]}"}}
  ]
}
Este documento, junto con el promt_ia_logi.md, le da a Claude un manual completo y específico para integrar las funcionalidades de IA.
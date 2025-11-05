# 🦷 Portal del Paciente - DentalCoin

## Descripción
Portal web standalone para pacientes del sistema DentalCoin. Una aplicación mobile-first que permite a los pacientes conectar su wallet MetaMask y gestionar sus recompensas por higiene dental.

## Características Principales

### 🔗 Conexión de Wallet
- Integración completa con MetaMask
- Conexión/desconexión segura
- Detección automática de wallet

### 🎮 Gamificación Dental
- Registro de cepillado diario
- Seguimiento de streaks
- Sistema de puntos de lealtad
- Recompensas automáticas en DentalCoin

### 📱 Diseño Mobile-First
- Optimizado para dispositivos móviles
- Interfaz intuitiva y moderna
- Diseño responsive

### 🛡️ Seguridad
- Comunicación directa con blockchain
- Sin almacenamiento de datos sensibles
- Encriptación end-to-end

## Instalación y Uso

### Prerrequisitos
- Node.js 16+
- MetaMask instalado en el navegador

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Construir para producción
npm run build
```

### Uso
1. Abrir la aplicación en el navegador
2. Hacer clic en "🔗 CONECTAR WALLET"
3. Aprobar la conexión en MetaMask
4. Comenzar a registrar higiene dental
5. Ganar recompensas automáticamente

## Arquitectura

### Tecnologías
- **React 18** - Framework frontend
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Ethers.js** - Integración Web3
- **Heroicons** - Iconografía

### Estructura de Archivos
```
patient-portal/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.tsx          # Componente principal
│   ├── index.tsx        # Punto de entrada
│   ├── index.css        # Estilos globales
│   └── types/
│       └── global.d.ts  # Tipos globales
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Funcionalidades

### Conexión de Wallet
- Detección automática de MetaMask
- Solicitud de permisos de conexión
- Manejo de errores de conexión
- Desconexión segura

### Sistema de Recompensas
- Registro de actividades de higiene
- Cálculo automático de recompensas
- Seguimiento de streaks
- Sistema de puntos de lealtad

### Interfaz de Usuario
- Diseño moderno y atractivo
- Animaciones suaves
- Estados de carga
- Manejo de errores

## Desarrollo

### Scripts Disponibles
- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone la configuración de Create React App

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CHAIN_ID=1
```

## Despliegue

### Construcción para Producción
```bash
npm run build
```

### Despliegue en Vercel/Netlify
1. Subir el contenido de la carpeta `build`
2. Configurar como SPA (Single Page Application)
3. Configurar redireccionamiento a `index.html`

### Configuración HTTPS
Es obligatorio usar HTTPS para aplicaciones Web3.

## Seguridad

### Mejores Prácticas
- Nunca almacenar claves privadas
- Validar todas las transacciones
- Usar conexiones HTTPS
- Implementar rate limiting
- Validar inputs del usuario

### Manejo de Errores
- Errores de conexión de wallet
- Errores de red
- Errores de transacción
- Estados de carga apropiados

## Soporte

Para soporte técnico o preguntas:
- Email: soporte@dentiagest.com
- Documentación: [Link a documentación completa]

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado por Dentiagest** 🦷⚡
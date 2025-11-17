const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'selene', 'src', 'core', 'Server.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Buscar el pattern donde se aplica el middleware de GraphQL
const pattern = `      // Store cleanup function for graceful shutdown
      (this as any).wsCleanup = serverCleanup;

      // Apply GraphQL middleware to Express app`;

const replacement = `      // Store cleanup function for graceful shutdown
      (this as any).wsCleanup = serverCleanup;

      // 🔐 AUTH MIDDLEWARE - Extract JWT and add user to request
      const { authMiddleware } = await import("../graphql/authMiddleware.js");
      console.log("🔐 Setting up HTTP authentication middleware...");
      this.app!.use("/graphql", authMiddleware);

      // Apply GraphQL middleware to Express app`;

if (content.includes(pattern)) {
  content = content.replace(pattern, replacement);
  console.log('✅ Auth middleware import pattern found and replaced');
} else {
  console.log('❌ Pattern not found');
}

// Ahora reemplaza el contexto para incluir user
const contextPattern = `              quantumEngine: this.quantumEngine, // ⚛️ PHASE E: Add quantum engine for enhanced processing
              req: req,`;

const contextReplacement = `              quantumEngine: this.quantumEngine, // ⚛️ PHASE E: Add quantum engine for enhanced processing
              user: req.user, // 🔐 AUTHENTICATED USER FROM MIDDLEWARE
              req: req,`;

if (content.includes(contextPattern)) {
  content = content.replace(contextPattern, contextReplacement);
  console.log('✅ Context user mapping pattern found and replaced');
} else {
  console.log('❌ Context pattern not found');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ File patched successfully');

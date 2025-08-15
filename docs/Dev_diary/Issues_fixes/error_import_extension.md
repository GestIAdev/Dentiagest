# Error de importación en módulos TypeScript/React

## Descripción del error

Al compilar el proyecto, aparece el siguiente error:

```
ERROR in ./src/useAppointments.ts 5:0-48
Module not found: Error: Can't resolve './context/AuthContext' in 'C:\Users\Raulacate\Desktop\Proyectos programacion\Dentiagest\frontend\src'
```

## Causa

En algunos entornos (Webpack, Vite, etc.), cuando los archivos `.ts` o `.tsx` están directamente en `/src` y no en subcarpetas convencionales, el import requiere la extensión explícita del archivo. Si no se incluye, el bundler no resuelve el módulo correctamente.

## Solución

- **Agregar la extensión al import:**
  - Si el archivo es `useAppointments.ts`, el import debe ser:
    ```js
    import { useAppointments } from './useAppointments.ts';
    ```
  - Si el archivo es `AuthContext.tsx`, el import debe ser:
    ```js
    import { useAuth } from './context/AuthContext.tsx';
    ```

- **Verificar la ubicación real de los archivos:**
  - Si los archivos están en subcarpetas (por ejemplo, `hooks/`), el import debe reflejar la ruta completa y la extensión.

## Ejemplo de error y solución aplicada

- Error:
  ```js
  import { useAppointments } from './useAppointments'; // ❌
  import { useAuth } from './context/AuthContext'; // ❌
  ```
- Solución:
  ```js
  import { useAppointments } from './useAppointments.ts'; // ✅
  import { useAuth } from './context/AuthContext.tsx'; // ✅
  ```

## Nota divertida

> "Claude Sonnet se volvió loco y empezó a insultar a Webpack. ¡No dejes que te pase lo mismo! Documenta y comparte este tip para que nadie pierda horas por culpa de los imports."

---

**Archivo generado por GitHub Copilot a petición del equipo DentiaGest.**

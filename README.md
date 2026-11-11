# PULSO

App web instalable (PWA) para registrar entrenamientos de gimnasio. Diseño: Figma «PULSO — App de entrenamiento».

## Cómo correrla

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # versión final en dist/
npm run preview  # probar la versión final
```

## Cómo está organizada

- `src/index.css`: tokens del sistema de diseño (colores, radios, espacios) y estilos de componentes.
- `src/db/`: datos guardados en el teléfono (IndexedDB con Dexie), catálogo de ejercicios y lógica de sesiones.
- `src/screens/`: una pantalla por archivo, con el número de la pantalla de Figma en los comentarios.
- `vite.config.ts`: configuración de la PWA (manifest, íconos y funcionamiento sin conexión).

## Fase 1 (esta versión)

Los datos se guardan solo en el teléfono. En la fase 2 se conectan cuentas y base de datos (Supabase) para que los datos no se pierdan al cambiar de teléfono.

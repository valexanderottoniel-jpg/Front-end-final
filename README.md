# FerreControl — Frontend alternativo para compañero

Frontend independiente, diseñado en React + TypeScript y Vite, con interfaz clara azul y navegación simple. **No es el frontend del otro estudiante.**

## Funciones conectadas al backend proporcionado
- Buscar artículos activos: `GET /articulos/mostrarActivosFiltro?nombre=...`
- Artículos por categoría: `GET /articulos/reporteArticuloCategoria`
- Facturas por cliente: `GET /clientes/reporteClienteFactura`

La búsqueda usa el parámetro `nombre` requerido por el controlador. El reporte de facturas combina nombre y apellido en la interfaz y presenta el total con dos decimales.

## Instrucciones Windows / PowerShell
1. Iniciar **su propio backend** Spring Boot en `http://localhost:8080` y verificar conexión a MySQL.
2. Abrir esta carpeta en VS Code.
3. En la terminal ejecutar `npm.cmd install`.
4. Ejecutar `npm.cmd run dev`.
5. Abrir `http://localhost:5174`.

Se utiliza el proxy de Vite `/api` para evitar problemas de CORS durante el desarrollo. Si cambia el puerto del backend, editar `vite.config.ts`.

## Exportaciones
- **Excel (CSV)**: genera CSV UTF-8 compatible con Excel.
- **Imprimir / PDF**: abre el diálogo de impresión del navegador; seleccionar «Guardar como PDF» (A4 horizontal).

**Nota:** CSV no es un archivo XLSX nativo y el PDF se genera desde el navegador. Si la rúbrica exige exportaciones XLSX/PDF programáticas, estas funciones necesitan ampliación.

## Nota de seguridad
No incluir la contraseña de MySQL en GitHub. El ZIP de este frontend no incluye configuración del backend ni credenciales.

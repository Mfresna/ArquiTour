# Frontend — ArquiTour

## Descripción general

El **frontend de ArquiTour** está desarrollado con:
 - **Angular 17**
 -  **TypeScript**
 -  **CSS**

Se realizó siguiendo una arquitectura modular, escalable y orientada a componentes.

El sistema se conecta con la **[API REST](./docs/BACKEND.md) de ArquiTour (Spring Boot)** para realizar todas las operaciones, incluyendo autenticación, gestión de usuarios, obras, estudios y favoritos.



## Estructura del proyecto

```plaintext
frontend/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes reutilizables (cards, menús, formularios)
│   │   ├── pages/             # Vistas principales (Inicio, Obras, Login, Perfil)
│   │   ├── services/          # Comunicación con el backend (HttpClient)
│   │   ├── guards/            # Protección de rutas según roles (JWT)
│   │   ├── interceptors/      # Interceptores HTTP (manejo de tokens, errores)
│   │   └── models/            # Interfaces y tipos TypeScript (DTOs)
│   ├── assets/                # Íconos, imágenes y estilos globales
│   ├── environments/          # Configuración para desarrollo y producción
│   └── main.ts                # Punto de entrada de la aplicación
│
├── angular.json               # Configuración de Angular CLI
├── package.json               # Dependencias y scripts npm
```


## Requisitos previos

Antes de ejecutar el proyecto, asegurate de tener instalado:

- **[Node.js](https://nodejs.org/)**  - ```Descargar desde la Web```

- **[Angular CLI](https://angular.io/cli)** - ```En la terminar ejecutar npm install -g @angular\cli```


## Primer Despligue

1. **Abrí la terminal** en la carpeta raíz del proyecto.
2. **Entrá al directorio del frontend:**
   ```bash
   cd frontend
3. **Instalá las dependencias:** Solo la primera vez
   ```bash
   npm install
4. **Ejecutá el servidor:**
   ```bash
   npm start
    ```

## Pasar a Produccion

1. **Configurar API** en `src/environments/environment.prod.ts`
   ```ts
   export const environment = {
     apiUrl: 'https://TU_BACKEND_PROD.com/api'
   };
    ```

2. **Compilar**
    ```bash
    npm install
    npm run build -- --configuration production
    ```
    Genera la carpeta dist/app

3. **Integrar al BackEnd:**
    Copiar el contendido de `\dist/app` a `backend/src/main/resources/static/`

4. **Crear un paquete JAR**
    ```bash
    cd backend
    mvn clean package
    java -jar target/*.jar
    ```

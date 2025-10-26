# Despliegue de Desarrollo

1. **Abrí la terminal** en la carpeta raíz del proyecto.
2. **Entrá al directorio del backend:**
   ```bash
   cd backend
4. **Ejecutá el servidor sin Test:**
   ```bash
   mvnw spring-boot:run -Dmaven.test.skip=true
    ```
5. **Entrá al directorio del frontend:**
   ```bash
   cd frontend
6. **Instalá las dependencias:** Solo la primera vez
   ```bash
   npm install
7. **Ejecutá el servidor:**
   ```bash
   npm start
    ```
---

## Script para ejecucion Automatica

1. En un block de notas en la raiz del proyecto creo un archivo con la extencion `.bat` 

    ```bash
        @echo off
        title ArquiTour - Entorno de Desarrollo
        color 0a

        echo ==========================================
        echo      Iniciando entorno de desarrollo
        echo ==========================================

        :: FRONTEND
        echo Verificando dependencias del Frontend...
        cd frontend

        if exist node_modules (
            echo ✅ Dependencias ya instaladas.
        ) else (
            echo 📦 Instalando dependencias de Angular...
            call npm install
        )

        echo Iniciando servidor Angular...
        start cmd /k "npm start"

        cd ..

        :: BACKEND
        echo.
        echo Verificando build del Backend...
        cd backend

        if exist target (
            echo ✅ Build existente detectado.
        ) else (
            echo 🔧 Compilando proyecto backend...
            call mvnw clean package -DskipTests
        )

        echo Iniciando servidor Spring Boot...
        call mvnw spring-boot:run -DskipTests

        pause

    ```


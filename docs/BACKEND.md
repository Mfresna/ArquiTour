# Backend — ArquiTour

> API REST desarrollada con **Spring Boot 3.4**, que provee todos los servicios de la plataforma **ArquiTour**, un sistema de Obras de Arquitectura a nivel mundial con geoposicionamiento.


## Descripción general

El backend de **ArquiTour** está construido en **Java 24** utilizando el framework **Spring Boot**, con una arquitectura modular, segura y escalable. Utilizando **JWT** para la seguridad y el inicio de sesion.  
Se encarga de gestionar la autenticación, usuarios, obras, estudios de arquitectura, favoritos y notificaciones, a través de una **API REST documentada con Swagger UI**.

### Tecnologías principales Implementadas

- **Spring Boot 3.4.x**
- **Spring Data JPA (MySQL)**
- **Spring Security + JWT**
- **OpenAPI / Swagger UI**
- **API de OSM (Open Street Map)**
- **Java 24**

---

## 🧱 Estructura del proyecto

```plaintext
backend/
├── src/
│   └── main/
│       ├── java/com/arquitour/
│       │   ├── config/           # Configs (CORS, Swagger, JWT)
│       │   ├── controller/       # Controladores REST
│       │   ├── dto/              # Data Transfer Objects
│       │   ├── model/            # Entidades JPA
│       │   ├── repository/       # Repositorios de base de datos
│       │   ├── security/         # Seguridad y autenticación JWT
│       │   └── service/          # Lógica de negocio
│       └── resources/
│           ├── application.yml       # Configuración base
│           ├── application-dev.yml   # Configuración de desarrollo
│           ├── application-prod.yml  # Configuración de producción
│           └── static/               # (Opcional) Build del frontend Angular
│
├── pom.xml               # Dependencias Maven
├── .env                  # Variables locales (no se sube al repo)
└── .env.example          # Ejemplo de variables para desarrollo
```
---

## Servicios

🔹 Swagger UI - `http://localhost:8080/swagger-ui.html`

🔹 API base - `http://localhost:8080/`

---

## Despliegue
1. **Abrí la terminal** en la carpeta raíz del proyecto.
2. **Entrá al directorio del backend:**
   ```bash
   cd backend
4. **Ejecutá el servidor sin Test:**
   ```bash
   mvnw spring-boot:run -DskipTests
    ```

---

## Pasar a Produccion
1. **integrar el Frontend con el Backend:** Copiar el contendido de `\dist/app` a `backend/src/main/resources/static/`
2. **Crear el paquete JAR**:
    ```bash
    mvnw clean package -DskipTests
    ```
# 5ArquiTour — Redefiniendo la forma de encontrar arquitectura  

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot-6DB33F)
![Frontend](https://img.shields.io/badge/frontend-Angular-DD0031)
![Database](https://img.shields.io/badge/database-MySQL-4479A1)
![JWT](https://img.shields.io/badge/security-JWT-orange)


## 🚀 Sobre ArquiTour

**ArquiTour** es el trabajo final integrador de la carrera de TUP de la UTN. Producto orientado a **digitalizar y conectar el mundo de la arquitectura**.  

La plataforma permite **gestionar, explorar y visualizar obras arquitectónicas** a nivel global, integrando información técnica, estudios responsables y geolocalización, teniendo en cuenta la **participacion social** en la ardua tarea de descubrir obras arquitectonicas

Creemos que la arquitectura merece una vitrina moderna, accesible y colaborativa por sobre todas las cosas.

Por eso, nuestro objetivo es simple: **llevar el patrimonio arquitectónico del mundo al alcance de todos** — arquitectos, estudiantes y entusiastas — con la posibilidad de encontrar joyas arquitectonicas cerca nuestro.

---

## 🧩 Stack Tecnológico Empleado

ArquiTour combina una arquitectura moderna de **frontend y backend desacoplados**, aplicando los conocimientos aprendidos durante los 2 años de la carrera de Tecnicatura en Programacion de la UTN

| Capa | Tecnologías |
|------|--------------|
| **Frontend** | Angular 20, TypeScript, CSS |
| **Backend** | Java 24, Spring Boot 3.4.5, Spring Security, JWT |
| **Base de datos** | MySQL |
| **ORM & Data Layer** | Spring Data JPA |
| **Documentación API** | OpenAPI / Swagger UI |

---

## 🎯 Objetivo del Proyecto

ArquiTour nace con la misión de **facilitar la busqueda de obras de arquitectura** geoposicionadas, ofreciendo:
- Un **espacio centralizado** donde visualizar obras con su ficha técnica, imágenes y posicionamiento.
- Gestión de **roles y permisos** (Usuarios, Arquitectos, Administradores).
- Control de **estudios de arquitectura** asociados a cada obra.
- Visualización filtrada por **estado, año, ubicación o estudio**.
- Capacidad de **guardar obras favoritas** para una experiencia personalizada.

Ademas se desafia a crear una aplicacion colaborativa en donde no solo los encargados de mantener la plataforma sean los encargados de descubrir la Arquitectura, sino por el contrario, en un proceso enriquecedor, **los propios usuarios son los encargados de darle valor a la aplicacion mediante el descubrimiento y la publicacion de obras de arquitectura**

---

## 👥 Roles del Sistema

| Rol | Descripción | Permisos principales |
|------|--------------|----------------------|
| 🧍‍♀️ **Registrado** | Usuario con cuenta activa | Ver obras, gestionar favoritos, filtrar resultados |
| 🏗️ **Arquitecto** | Validado por un administrador | Cargar y editar obras, administrar su estudio |
| 🧑‍💼 **Administrador** | Control total del sistema | Aprobar solicitudes, gestionar obras y usuarios |
| 👑 **Administrador Maestro** | Usuario raíz | Privilegios inalterables, primera cuenta del sistema |

---

## 📂 Estructura del Proyecto

```plaintext
arquitour/
├── README.md                      # Documentación general del proyecto
├── .gitignore                     # Archivos y carpetas ignorados por Git
│
├── frontend/                      # Aplicación Angular (interfaz de usuario)
│   ├── src/                       # Código fuente del frontend
│   ├── angular.json               # Configuración principal de Angular
│   ├── package.json               # Dependencias y scripts de npm
│   └── proxy.conf.json            # Redirección de /api → backend (para evitar CORS)
│
└── backend/                       # API REST (Spring Boot)
    ├── src/
    │   └── main/
    │       ├── java/              # Controladores, servicios y entidades
    │       └── resources/
    │           └── application.yml # Configuración de Spring Boot
    │
    ├── pom.xml                    # Archivo de configuración Maven
    ├── .env                       # Variables de entorno locales (no se sube)
    └── .env.example               # Ejemplo de variables para desarrollo
```

## 📘 Informacion Especifica

- [Frontend](./docs/FRONTEND.md)
- [Backend](./docs/BACKEND.md)
- [Despliegue](./docs/DESPLIEGUE.md)

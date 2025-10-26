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
    echo Dependencias ya instaladas.
) else (
    echo Instalando dependencias de Angular...
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
    echo Build existente detectado.
) else (
    echo Compilando proyecto backend...
    call mvnw clean package -DskipTests
)

echo Iniciando servidor Spring Boot...
call mvnw spring-boot:run -DskipTests

pause
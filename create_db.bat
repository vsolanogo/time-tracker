@echo off
echo ========================================
echo     SCRIPT FOR CREATING THE DATABASE
echo ========================================
echo.

:: --- НАЛАШТУВАННЯ ПІДКЛЮЧЕННЯ ---
:: ЗАМІНІТЬ НА СВОЇ (повинні співпадати з drop_db.bat)
set DB_NAME=time_tracker
set DB_USER=postgres
set DB_PASSWORD=passwordSuperUser1111
set DB_HOST=localhost
set DB_PORT=5433

:: --- ПОВНИЙ ШЛЯХ ДО PSQL ---

set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"
:: -----------------------------

echo Connecting to PostgreSQL...
echo Attempting to create database "%DB_NAME%"...

:: Встановлюємо пароль у змінну середовища для поточної сесії
set PGPASSWORD=%DB_PASSWORD%

:: Виконуємо SQL-команду для створення бази даних.
:: Також підключаємось до службової бази "postgres".
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;"

:: Перевіряємо результат
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Database "%DB_NAME%" has been created successfully.
) else (
    echo.
    echo ERROR: Failed to create database. Check connection settings, permissions, or if the database already exists.
)

echo.
pause

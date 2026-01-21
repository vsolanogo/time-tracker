@echo off
echo ========================================
echo     SCRIPT FOR DELETING THE DATABASE
echo ========================================
echo.

:: --- НАЛАШТУВАННЯ ПІДКЛЮЧЕННЯ ---
:: Замініть значення на свої (мають збігатися з create_db.bat)
set DB_NAME=time_tracker
set DB_USER=postgres
set DB_PASSWORD=passwordSuperUser1111
set DB_HOST=localhost
set DB_PORT=5433

:: --- ПОВНИЙ ШЛЯХ ДО PSQL ---
:: Замініть "18" на вашу версію PostgreSQL!
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"
:: -----------------------------

echo Connecting to PostgreSQL...
echo Attempting to delete database "%DB_NAME%"...

:: Встановлюємо пароль у змінну середовища для поточної сесії
set PGPASSWORD=%DB_PASSWORD%

:: Виконуємо SQL-команду для видалення бази даних.
:: Використовуємо "IF EXISTS" щоб уникнути помилки, якщо база вже видалена.
%PSQL_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"

:: Перевіряємо результат
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Database "%DB_NAME%" has been deleted successfully.
) else (
    echo.
    echo ERROR: Failed to delete database. Check connection settings, permissions, or if the database is in use.
)

echo.
pause
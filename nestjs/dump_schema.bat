@echo off
echo ========================================
echo   SCRIPT FOR DUMPING DATABASE SCHEMA
echo ========================================
echo.

:: --- НАЛАШТУВАННЯ ПІДКЛЮЧЕННЯ ---
:: Переконайтеся, що вони збігаються з вашими іншими скриптами
set DB_NAME=time_tracker
set DB_USER=postgres
set DB_PASSWORD=passwordSuperUser1111
set DB_HOST=localhost
set DB_PORT=5433

:: --- ПОВНІ ШЛЯХИ ДО УТИЛІТ POSTGRESQL ---
:: Замініть "18" на вашу версію PostgreSQL!
:: pg_dump.exe зазвичай знаходиться в тій самій папці, що й psql.exe
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PG_DUMP_PATH="C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
:: -----------------------------

echo Checking for pg_dump.exe...
IF NOT EXIST %PG_DUMP_PATH% (
    echo ERROR: pg_dump.exe not found at the specified path:
    echo %PG_DUMP_PATH%
    echo Please check the PG_DUMP_PATH variable in this script.
    echo.
    pause
    exit /b 1
)
echo pg_dump.exe found.
echo.

:: Встановлюємо пароль у змінну середовища для поточної сесії
set PGPASSWORD=%DB_PASSWORD%

:: --- СТВОРЕННЯ ІМЕНІ ФАЙЛУ З ДАТОЮ ТА ЧАСОМ (ВИПРАВЛЕНИЙ МЕТОД) ---
:: Використовуємо стандартні змінні %DATE% та %TIME%
:: і замінюємо символи, недопустимі в імені файлу (/ : , пробіл).
:: Цей метод надійніший за wmic і працює на всіх системах Windows.
set "FILE_DATE=%date:/=_%"
set "FILE_TIME=%time::=-%"
set "FILE_TIME=%FILE_TIME: =_%"
set "FILE_TIME=%FILE_TIME:,=_%"
set "TIMESTAMP=%FILE_DATE%_%FILE_TIME%"
set "OUTPUT_FILE=schema_%TIMESTAMP%.sql"

echo ========================================================
echo Dumping schema for database "%DB_NAME%"...
echo Output will be saved to: %OUTPUT_FILE%
echo ========================================================
echo.

:: --- ОСНОВНА КОМАНДА ---
:: --schema-only: вивантажує лише схему (CREATE TABLE, INDEX тощо), без даних
:: --no-owner: не включає команди зміни власника
:: --no-privileges: не включає команди GRANT/REVOKE
%PG_DUMP_PATH% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --schema-only --no-owner --no-privileges > %OUTPUT_FILE%

echo.
echo ========================================================
echo Schema dump complete!
echo File saved as: %OUTPUT_FILE%
echo ========================================================

echo.
pause
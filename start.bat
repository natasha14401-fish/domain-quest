@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден. Установите с https://nodejs.org и повторите.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Установка зависимостей...
  call npm install
  if errorlevel 1 (
    echo Ошибка npm install
    pause
    exit /b 1
  )
)
echo Запуск Domain Quest...
call npm run dev
pause

@echo off
echo ========================================
echo Setting up Persistent Ganache
echo ========================================
echo.

echo 1. Creating persistent database directory...
if not exist "ganache-db" mkdir ganache-db

echo 2. Deploying contracts to Ganache...
truffle migrate --reset --network development

echo.
echo 3. Building the application...
cd app
npm run build

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Now start Ganache with these settings:
echo - Port: 7545
echo - Network ID: 5777
echo - Database Path: ./ganache-db
echo.
echo Then run: npm run dev
echo.
pause 
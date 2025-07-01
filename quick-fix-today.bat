@echo off
echo ========================================
echo Quick Fix - Getting Data Back Today
echo ========================================
echo.

echo 1. Deploying contracts...
truffle migrate --reset --network development

echo.
echo 2. Building application...
cd app
npm run build

echo.
echo 3. Starting development server...
npm run dev

echo.
echo ========================================
echo Done! Your app should work now.
echo ========================================
echo.
pause 
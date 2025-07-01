@echo off
echo Starting daily setup for Organ Donation Platform...
echo.

echo 1. Deploying contracts to Ganache...
truffle migrate --reset --network development

echo.
echo 2. Building the application...
cd app
npm run build

echo.
echo 3. Starting the development server...
npm run dev

echo.
echo Setup complete! Your application should be running.
echo Open http://localhost:8080 in your browser
pause 
@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   PUBBLICA PRODOTTI - Sito Amazon
echo ========================================
echo.

echo [1/3] Importo i prodotti da links.txt...
python importa_da_links.py
if %errorlevel% neq 0 (
    echo ERRORE durante l'importazione!
    pause
    exit /b 1
)

echo.
echo [2/3] Salvo le modifiche...
git add products.json
git commit -m "Aggiorna prodotti"
if %errorlevel% neq 0 (
    echo Nessuna modifica da pubblicare.
    pause
    exit /b 1
)

echo.
echo [3/3] Pubblico online...
git push origin principale

echo.
echo [4/4] Avvio deploy su Vercel...
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_22VOV9qaqZd3q5R29Og9AnQ1zUOJ/CWvlm6whgd"

echo.
echo ========================================
echo   FATTO! Sito aggiornato con successo.
echo   Fai Ctrl+F5 sul browser per vedere.
echo ========================================
echo.
pause

@echo off
chcp 65001 >nul
echo ========================================
echo   PUBBLICA PRODOTTI - Sito Amazon
echo ========================================

cd /d "%~dp0"

echo [1/3] Importo i prodotti da links.txt...
python importa_da_links.py
if errorlevel 1 (
    echo ERRORE durante l'importazione.
    pause
    exit /b 1
)

echo [2/3] Salvo le modifiche...
git add -A
git diff --cached --quiet && (
    echo Nessuna modifica da pubblicare.
) || (
    git commit -m "Aggiorna prodotti"
)

echo [3/3] Pubblico su Vercel...
git push origin main
if errorlevel 1 (
    echo ERRORE durante il push.
    pause
    exit /b 1
)

echo.
echo FATTO! Sito aggiornato con successo.
pause

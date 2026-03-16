@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   PUBBLICA PRODOTTI - Sito Amazon
echo ========================================
echo.

REM Passo 1: Importa links.txt nel JSON
echo [1/4] Importo i prodotti da links.txt...
python importa_da_links.py
if %errorlevel% neq 0 (
    echo ERRORE durante l'importazione!
    pause
    exit /b 1
)

REM Passo 2: Valida il JSON
echo.
echo [2/4] Verifico che il JSON sia corretto...
python -m json.tool products.json > NUL
if %errorlevel% neq 0 (
    echo ERRORE: products.json non valido!
    pause
    exit /b 1
)
echo OK - JSON valido.

REM Passo 3: Commit
echo.
echo [3/4] Salvo su GitHub...
git add products.json
git commit -m "Aggiorna prodotti"
if %errorlevel% neq 0 (
    echo Nessuna modifica da pubblicare oppure errore git.
    pause
    exit /b 1
)

REM Passo 4: Push
echo.
echo [4/4] Pubblico online (Vercel)...
git push
if %errorlevel% neq 0 (
    echo ERRORE durante il push!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   FATTO! Sito aggiornato con successo.
echo   Fai Ctrl+F5 sul browser per vedere.
echo ========================================
echo.
pause

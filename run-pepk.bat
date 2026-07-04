@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

echo === STEP 1: Exportando chave de assinatura ===
echo.
echo Digite a Keystore Password: psihumanis2026
echo Digite a Key Password: psihumanis2026
echo.

"%JAVA_HOME%\bin\java.exe" -jar "C:\Users\miche\Desktop\PsicoFlow-Completo\pepk.jar" --keystore="C:\Users\miche\Desktop\PsicoFlow-Completo\android\app\psi-humanis-release.keystore" --alias=psi-humanis --output="C:\Users\miche\Desktop\PsicoFlow-Completo\upload-key.zip" --encryption-key-path="C:\Users\miche\Desktop\PsicoFlow-Completo\encryption_public_key.pem" --include-cert --rsa-aes-encryption

if exist "C:\Users\miche\Desktop\PsicoFlow-Completo\upload-key.zip" (
    echo.
    echo SUCESSO! upload-key.zip criado!
    explorer "C:\Users\miche\Desktop\PsicoFlow-Completo"
) else (
    echo.
    echo FALHOU!
)
pause

@echo off
title Exportando chave de assinatura PsiHumanis
color 0A
echo.
echo ============================================
echo   EXPORTACAO DA CHAVE - PEPK Tool
echo ============================================
echo.
echo Senha do Keystore: psihumanis2026
echo Senha da Key:      psihumanis2026
echo.
echo Digite as senhas quando solicitado abaixo:
echo.

"C:\Program Files\Android\Android Studio\jbr\bin\java.exe" -jar "C:\Users\miche\Desktop\PsicoFlow-Completo\pepk.jar" --keystore="C:\Users\miche\Desktop\PsicoFlow-Completo\android\app\psi-humanis-release.keystore" --alias=psi-humanis --output="C:\Users\miche\Desktop\PsicoFlow-Completo\upload-key.zip" --encryption-key-path="C:\Users\miche\Desktop\PsicoFlow-Completo\encryption_public_key.pem" --include-cert --rsa-aes-encryption

echo.
if exist "C:\Users\miche\Desktop\PsicoFlow-Completo\upload-key.zip" (
    echo ============================================
    echo   SUCESSO! upload-key.zip criado!
    echo ============================================
    explorer "C:\Users\miche\Desktop\PsicoFlow-Completo"
) else (
    echo ============================================
    echo   FALHA! Tente novamente.
    echo ============================================
)
echo.
pause

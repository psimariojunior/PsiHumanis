const { execSync } = require('child_process');
const path = require('path');

const JAVA = 'C:\\Program Files\\Android\\Android Studio\\jbr\\bin';
const ROOT = 'C:\\Users\\miche\\Desktop\\PsicoFlow-Completo';
const KS = path.join(ROOT, 'android', 'app', 'psi-humanis-release.keystore');

try {
  // Step 1: Convert JKS to PKCS12
  console.log('Step 1: Converting keystore to PKCS12...');
  execSync(`"${JAVA}\\keytool.exe" -importkeystore -srckeystore "${KS}" -srcalias psi-humanis -srcstorepass psihumanis2026 -srckeypass psihumanis2026 -destkeystore "${path.join(ROOT, 'upload.p12')}" -deststorepass psihumanis2026 -destkeypass psihumanis2026 -deststoretype PKCS12 -noprompt`, { stdio: 'inherit' });
  console.log('PKCS12 created OK');

  // Step 2: Extract private key with openssl
  console.log('Step 2: Extracting private key...');
  execSync(`"${JAVA}\\openssl.exe" pkcs12 -in "${path.join(ROOT, 'upload.p12')}" -passin pass:psihumanis2026 -nocerts -out "${path.join(ROOT, 'upload-key.pem')}" -nodes`, { stdio: 'inherit' });
  console.log('Private key extracted OK');

  console.log('Done! Files created: upload.p12, upload-key.pem');
} catch (e) {
  console.error('Error:', e.message);
}

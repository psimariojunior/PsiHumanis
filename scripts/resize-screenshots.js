const sharp = require('sharp');
const path = require('path');

const src = 'C:\\Users\\miche\\Desktop\\PsicoFlow-Completo\\playstore-assets';
const dst = 'C:\\Users\\miche\\Desktop\\PsicoFlow-Completo\\public\\screenshots';

async function resize(file, out) {
  await sharp(path.join(src, file)).resize({ width: 408, kernel: 'lanczos3' }).toFile(path.join(dst, out));
  console.log(out);
}

(async () => {
  await resize('06-agenda.png', 'agenda.png');
  await resize('07-pacientes.png', 'pacientes.png');
  await resize('09-sala-virtual.png', 'sala-virtual.png');
  await resize('08-prontuarios.png', 'prontuarios.png');
  console.log('Done!');
})();

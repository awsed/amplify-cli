const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

function run(info) {
  const { filePath, password } = info;
  const pemFileContent = getPemFileContent(filePath, password);
  const Certificate = getCertificate(pemFileContent);
  const PrivateKey = getPrivateKey(pemFileContent);
  return {
    Certificate,
    PrivateKey,
  };
}

function getPemFileContent(infp, pswd) {
  const outfp = path.join(os.tmpdir(), 'temp.pem');
  const cmd = `openssl pkcs12 -in ${infp} -out ${outfp} -nodes -passin pass:${pswd}`;
  execSync(cmd);
  const content = fs.readFileSync(outfp, 'utf8');
  fs.removeSync(outfp);
  return content;
}

function getCertificate(pemFileContent) {
  let certificate;
  const beginMark = '-----BEGIN CERTIFICATE-----';
  const beginIndex = pemFileContent.indexOf(beginMark) + beginMark.length;
  if (beginIndex > -1) {
    const endMark = '-----END CERTIFICATE-----';
    const endIndex = pemFileContent.indexOf(endMark, beginIndex);
    if (endIndex > -1) {
      certificate = pemFileContent.slice(beginIndex, endIndex).replace(/\s/g, '');
      certificate = beginMark + os.EOL + certificate + os.EOL + endMark;
    }
  }
  return certificate;
}

function getPrivateKey(pemFileContent) {
  let privateKey;
  const beginMark = '-----BEGIN PRIVATE KEY-----';
  const beginIndex = pemFileContent.indexOf(beginMark) + beginMark.length;
  if (beginIndex > -1) {
    const endMark = '-----END PRIVATE KEY-----';
    const endIndex = pemFileContent.indexOf(endMark, beginIndex);
    if (endIndex > -1) {
      privateKey = pemFileContent.slice(beginIndex, endIndex).replace(/\s/g, '');
      privateKey = beginMark + os.EOL + privateKey + os.EOL + endMark;
    }
  }
  return privateKey;
}

module.exports = {
  run,
};

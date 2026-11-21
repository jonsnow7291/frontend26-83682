import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  // Misma origen: nginx reenvía /clinica/v1 al backend (ver nginx.conf), así no depende del puerto publicado.
  apiUrlAuth: '/clinica/v1'
};

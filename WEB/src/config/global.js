export const global = {
  API_KEY: 'ifsp2026',
  API_URL: ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:9000'
    : 'https://sentinel-service.duckdns.org',
  // IDs confirmados na tabela funcao. Adm (1) é provisionado somente no banco.
  PUBLIC_ROLES: [
    { id: 3, tipo: 'Desenvolvedor' },
    { id: 4, tipo: 'Analista' },
  ],
};

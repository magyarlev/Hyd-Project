export const environment = {
  production: true,
  apiUrl:
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/api`
      : '/api',
};

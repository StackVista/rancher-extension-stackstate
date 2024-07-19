
export function handleGrowl(store, config) {
  const error = config.error?.data || config.error;

  store.dispatch(`growl/${ config.type || 'error' }`, {
    title:   error.title || 'Error',
    message: error.message,
    timeout: 5000,
  }, { root: true });
}

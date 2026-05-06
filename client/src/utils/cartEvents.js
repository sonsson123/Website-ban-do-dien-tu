export const CART_UPDATED_EVENT = 'cartUpdated';

export const emitCartUpdated = (totalItems = 0) => {
  if (typeof window === 'undefined' || !window.dispatchEvent) return;
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { totalItems }
    })
  );
};

export const subscribeCartUpdated = (callback) => {
  if (typeof window === 'undefined' || !window.addEventListener) {
    return () => {};
  }
  const handler = (event) => {
    if (typeof callback === 'function') {
      callback(event?.detail?.totalItems ?? 0);
    }
  };
  window.addEventListener(CART_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
};

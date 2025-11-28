/**
 * Utility to clean up problematic service workers that may be causing console errors.
 * This is particularly useful when hosting providers inject service workers that fail.
 */

/**
 * Unregisters all service workers for the current scope
 */
export const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        // Only unregister service workers that are not from our own domain
        // or that are causing issues (like the wsimg.com one)
        const scope = registration.scope;
        const isExternalServiceWorker = 
          scope.includes('wsimg.com') || 
          scope.includes('traffic-assets') ||
          !scope.includes(window.location.origin);
        
        if (isExternalServiceWorker) {
          console.log('Unregistering external service worker:', scope);
          await registration.unregister();
        }
      }
    } catch (error) {
      console.warn('Error unregistering service workers:', error);
    }
  }
};

/**
 * Suppresses console errors from failed service worker fetch events
 * This prevents non-critical errors from cluttering the console
 */
export const suppressServiceWorkerErrors = (): void => {
  // Handle unhandled promise rejections from service workers
  // This catches the "Uncaught (in promise) no-response" errors
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    const errorMessage = typeof event.reason === 'object' && event.reason !== null
      ? JSON.stringify(event.reason)
      : reason;
    
    // Check if this is a service worker error we want to suppress
    const shouldSuppress = 
      errorMessage.includes('tccl.min.js') ||
      errorMessage.includes('wsimg.com') ||
      errorMessage.includes('traffic-assets') ||
      errorMessage.includes('no-response') ||
      (errorMessage.includes('FetchEvent') && errorMessage.includes('network error'));
    
    if (shouldSuppress) {
      // Suppress these non-critical errors
      event.preventDefault();
      // Optionally log at debug level (won't show in console by default)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Suppressed service worker error:', errorMessage);
      }
    }
  });

  // Also intercept console.error for service worker related errors
  // This is a more targeted approach that only affects specific error patterns
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    const errorMessage = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    // Only suppress known service worker errors that are not critical
    const shouldSuppress = 
      errorMessage.includes('tccl.min.js') ||
      errorMessage.includes('wsimg.com/traffic-assets') ||
      (errorMessage.includes('FetchEvent') && errorMessage.includes('network error response')) ||
      (errorMessage.includes('no-response') && errorMessage.includes('sw.js')) ||
      (errorMessage.includes('ERR_FAILED') && errorMessage.includes('tccl.min.js'));
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, log at debug level instead
      console.debug('Suppressed service worker error:', ...args);
    }
  };
};

/**
 * Initialize service worker cleanup
 * Call this on app startup
 */
export const initServiceWorkerCleanup = async (): Promise<void> => {
  // Suppress errors first
  suppressServiceWorkerErrors();
  
  // Then try to unregister problematic service workers
  await unregisterServiceWorkers();
};


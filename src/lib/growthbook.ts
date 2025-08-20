import { GrowthBook } from '@growthbook/growthbook';

export const growthbook = new GrowthBook({
  apiHost: 'https://cdn.growthbook.io',
  clientKey: 'sdk-8HZJoOSWK69cjYJ',
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // For React Native, we'll use console.log for now
    // You can integrate with your analytics service here
    console.log('Experiment viewed:', {
      experiment_id: experiment.key,
      variation_id: result.key,
    });

    // If you want to integrate with a specific analytics service,
    // you can add that logic here
  },
});

// Add fallback test features only when remote features fail
export const addFallbackTestFeatures = () => {
  if (__DEV__) {
    // Only add fallback features if no remote features are loaded
    const currentFeatures = growthbook.getFeatures();
    if (Object.keys(currentFeatures).length === 0) {
      console.log('No remote features loaded, adding fallback test features');
      growthbook.setFeatures({
        'new-ui-feature': {
          defaultValue: true,
        },
        'max-items-per-page': {
          defaultValue: 25,
        },
        'simple-test': {
          defaultValue: true,
        },
      });
    } else {
      console.log('Remote features loaded successfully, not overriding with test features');
    }
  }
};

// Set user attributes for testing
export const setUserAttributes = () => {
  // Set minimal attributes that won't interfere with feature flags
  growthbook.setAttributes({
    id: 'test-user-123',
    device: 'react-native',
    version: '1.0.0',
    // Remove environment and isBetaUser to avoid conflicts with feature flag rules
  });
  console.log('User attributes set for testing:', growthbook.getAttributes());
};

// Initialize GrowthBook with timeout and better error handling
export const initGrowthBook = async (): Promise<void> => {
  try {
    // Set user attributes first
    setUserAttributes();

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('GrowthBook initialization timeout')), 10000);
    });

    const initPromise = growthbook.loadFeatures();

    await Promise.race([initPromise, timeoutPromise]);
    console.log('GrowthBook features loaded successfully');

    // Check what features were loaded
    const loadedFeatures = growthbook.getFeatures();
    console.log('Loaded features:', Object.keys(loadedFeatures));

    // Log specific feature details for debugging
    if (loadedFeatures['see-all-properties']) {
      console.log('see-all-properties loaded with config:', loadedFeatures['see-all-properties']);
    }

    // Only add fallback features if none were loaded
    addFallbackTestFeatures();
  } catch (error) {
    console.error('Failed to load GrowthBook features:', error);
    // Don't throw - let the app continue without GrowthBook

    // Add fallback features only when remote loading fails
    addFallbackTestFeatures();
  }
};

import { useGrowthBook as useGrowthBookBase } from '@growthbook/growthbook-react';

export const useGrowthBook = () => {
  const growthbook = useGrowthBookBase();

  return {
    growthbook,
    // Helper method to check if a feature is enabled
    isFeatureEnabled: (featureKey: string): boolean => {
      try {
        if (!growthbook) {
          console.log(`GrowthBook not available for feature: ${featureKey}`);
          return false;
        }

        if (!growthbook.ready) {
          console.log(`GrowthBook not ready yet for feature: ${featureKey}`);
          return false;
        }

        // Get current user attributes for debugging
        const attributes = growthbook.getAttributes();
        console.log(`Checking feature ${featureKey} with attributes:`, attributes);

        // Check if the feature exists by trying to get its value
        try {
          const result = growthbook.isOn(featureKey);
          console.log(`Feature ${featureKey}: ${result}`);

          // Additional debugging for see-all-properties
          if (featureKey === 'see-all-properties') {
            const feature = growthbook.getFeatures()[featureKey];
            console.log(`see-all-properties feature details:`, feature);
            console.log(
              `see-all-properties raw value:`,
              growthbook.getFeatureValue(featureKey, 'NOT_FOUND')
            );
          }

          return result;
        } catch (featureError) {
          console.log(`Feature not found or error: ${featureKey}`, featureError);
          return false;
        }
      } catch (error) {
        console.warn(`Error checking feature ${featureKey}:`, error);
        return false;
      }
    },

    // Helper method to get feature value
    getFeatureValue: <T>(featureKey: string, fallback: T): T => {
      try {
        if (!growthbook) {
          console.log(`GrowthBook not available for feature: ${featureKey}`);
          return fallback;
        }

        if (!growthbook.ready) {
          console.log(`GrowthBook not ready yet for feature: ${featureKey}`);
          return fallback;
        }

        // Try to get the feature value, it will return fallback if feature doesn't exist
        const value = growthbook.getFeatureValue(featureKey, fallback);
        console.log(`Feature ${featureKey} value:`, value);
        return value as T;
      } catch (error) {
        console.warn(`Error getting feature value for ${featureKey}:`, error);
        return fallback;
      }
    },

    // Simple method to get a random variation (for now)
    getRandomVariation: <T>(variations: T[]): T => {
      if (!variations || variations.length === 0) {
        throw new Error('Variations array cannot be empty');
      }
      const randomIndex = Math.floor(Math.random() * variations.length);
      return variations[randomIndex];
    },
  };
};

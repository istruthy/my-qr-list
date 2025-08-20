# Feature Flags with GrowthBook

This project uses GrowthBook for feature flag management. Here's how to use and test the feature flags.

## Current Setup

The app is configured with:
- **API Host**: `https://cdn.growthbook.io`
- **Client Key**: `sdk-8HZJoOSWK69cjYJ`
- **Dev Mode**: Enabled

## Test Features (Development Only)

When running in development mode, the following test features are automatically added:

### Boolean Features
- `new-ui-feature`: Always `true` in development
- `see-all-properties`: Always `false` in development  
- `simple-test`: Always `true` in development

### Value Features
- `max-items-per-page`: Always `25` in development

## How to Test

1. **Run the app** - The test features will be automatically loaded
2. **Check the console** - Look for logs showing feature flag values
3. **Use the FeatureFlagExample component** - It displays all feature flag states

## Debugging

The enhanced component now shows:
- GrowthBook ready state
- Raw feature data
- Individual feature flag values
- Console logs for each feature check

## Common Issues

### No values showing up?
- Check if GrowthBook is ready (`growthbook.ready`)
- Verify the feature key exists
- Look at console logs for debugging info

### Features returning undefined?
- The feature might not exist in your GrowthBook account
- Check if you're using the correct feature key
- Verify the feature is published and active

## Adding Real Features

To add features to your GrowthBook account:

1. Go to [GrowthBook Dashboard](https://app.growthbook.io)
2. Create a new feature flag
3. Use the same feature key in your code
4. Publish the feature flag

## Testing with Real Features

Replace the test feature keys with your actual feature keys:

```typescript
// Instead of 'new-ui-feature', use your real feature key
const isFeatureEnabled = isFeatureEnabled('your-actual-feature-key');
```

## User Attributes

The app sets these test user attributes:
- `id`: 'test-user-123'
- `environment`: 'development'
- `device`: 'react-native'
- `version`: '1.0.0'
- `isBetaUser`: true

You can modify these in `src/lib/growthbook.ts` to test different user segments.

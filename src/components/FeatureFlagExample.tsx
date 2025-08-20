import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGrowthBook } from '../hooks/useGrowthBook';

export const FeatureFlagExample: React.FC = () => {
  const { growthbook, isFeatureEnabled, getFeatureValue, getRandomVariation } = useGrowthBook();
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');
  const [rawFeatures, setRawFeatures] = useState<any>({});
  const [manualTestResult, setManualTestResult] = useState<string>('');

  const refreshFeatures = () => {
    if (growthbook && growthbook.ready) {
      const features = growthbook.getFeatures();
      setRawFeatures(features);

      // Manual test of see-all-properties
      try {
        const isOn = growthbook.isOn('see-all-properties');
        const rawValue = growthbook.getFeatureValue('see-all-properties', 'NOT_FOUND');
        const feature = features['see-all-properties'];

        setManualTestResult(
          JSON.stringify(
            {
              isOn,
              rawValue,
              feature,
              attributes: growthbook.getAttributes(),
            },
            null,
            2
          )
        );

        console.log('Manual test - see-all-properties:', { isOn, rawValue, feature });
      } catch (error) {
        setManualTestResult(`Error: ${error}`);
        console.error('Manual test error:', error);
      }
    }
  };

  useEffect(() => {
    // Add some debugging information
    if (growthbook) {
      setDebugInfo(`GrowthBook ready: ${growthbook.ready ? 'Yes' : 'No'}`);

      // Get all available features for debugging
      if (growthbook.ready) {
        const features = growthbook.getFeatures();
        setRawFeatures(features);
        console.log('Available GrowthBook features:', features);

        // Specific debugging for see-all-properties
        if (features['see-all-properties']) {
          console.log('see-all-properties feature found:', features['see-all-properties']);
          console.log('Raw value:', growthbook.getFeatureValue('see-all-properties', 'NOT_FOUND'));
          console.log('Is on:', growthbook.isOn('see-all-properties'));
        } else {
          console.log('see-all-properties feature NOT found in loaded features');
        }
      }
    } else {
      setDebugInfo('GrowthBook not available');
    }
  }, [growthbook]);

  // Test with some common feature flag patterns
  const isNewUIFeatureEnabled = isFeatureEnabled('new-ui-feature');
  const isSeeAllPropertiesEnabled = isFeatureEnabled('see-all-properties');
  const maxItemsPerPage = getFeatureValue('max-items-per-page', 10);

  // Test with some features that might exist by default
  const isDevModeEnabled = isFeatureEnabled('dev-mode');
  const isBetaEnabled = isFeatureEnabled('beta-features');

  // Test with a simple boolean feature
  const simpleFeature = isFeatureEnabled('simple-test');

  // Example variation usage (simplified for now)
  const buttonColor = getRandomVariation(['blue', 'green', 'red']);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GrowthBook Feature Flags Demo</Text>

      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Debug Info:</Text>
        <Text>{debugInfo}</Text>
        <Text>GrowthBook Instance: {growthbook ? 'Available' : 'Not Available'}</Text>
        <Text>Ready State: {growthbook?.ready ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>Feature Flags (Your Test Features):</Text>
        <Text>
          New UI Feature: {String(isNewUIFeatureEnabled)}{' '}
          {isNewUIFeatureEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
        <Text>
          See All Properties: {String(isSeeAllPropertiesEnabled)}{' '}
          {isSeeAllPropertiesEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
        <Text>Max Items Per Page: {String(maxItemsPerPage)}</Text>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>Common Feature Flags:</Text>
        <Text>
          Dev Mode: {String(isDevModeEnabled)} {isDevModeEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
        <Text>
          Beta Features: {String(isBetaEnabled)} {isBetaEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
        <Text>
          Simple Test: {String(simpleFeature)} {simpleFeature ? '✅ Enabled' : '❌ Disabled'}
        </Text>
      </View>

      <View style={styles.experimentSection}>
        <Text style={styles.sectionTitle}>Variations:</Text>
        <Text>Button Color: {buttonColor}</Text>
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Manual Test:</Text>
        <TouchableOpacity style={styles.button} onPress={refreshFeatures}>
          <Text style={styles.buttonText}>Test see-all-properties</Text>
        </TouchableOpacity>
        {manualTestResult ? (
          <Text style={styles.codeText}>{manualTestResult}</Text>
        ) : (
          <Text>Press the button to test manually</Text>
        )}
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Raw GrowthBook Features:</Text>
        <Text style={styles.codeText}>
          {Object.keys(rawFeatures).length > 0
            ? JSON.stringify(rawFeatures, null, 2)
            : 'No features loaded yet'}
        </Text>
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Specific Feature Debug:</Text>
        <Text>see-all-properties exists: {rawFeatures['see-all-properties'] ? 'Yes' : 'No'}</Text>
        {rawFeatures['see-all-properties'] && (
          <Text style={styles.codeText}>
            see-all-properties config: {JSON.stringify(rawFeatures['see-all-properties'], null, 2)}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  debugSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 4,
  },
  featureSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  experimentSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
});

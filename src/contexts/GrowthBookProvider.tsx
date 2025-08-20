import React, { useEffect, useState } from 'react';
import { GrowthBookProvider as GrowthBookProviderBase } from '@growthbook/growthbook-react';
import { growthbook, initGrowthBook } from '../lib/growthbook';
import { View, ActivityIndicator } from 'react-native';

interface GrowthBookProviderProps {
  children: React.ReactNode;
}

export const GrowthBookProvider: React.FC<GrowthBookProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initGrowthBook();
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <GrowthBookProviderBase growthbook={growthbook}>{children}</GrowthBookProviderBase>;
};

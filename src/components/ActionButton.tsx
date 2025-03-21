import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps, useTheme } from 'react-native-paper';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'error' | 'outline';
  size?: 'xs' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  style,
  labelStyle,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  ...props
}) => {
  const theme = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'outline':
        return theme.colors.outline;
      case 'secondary':
        return theme.colors.secondary;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'xs':
        return styles.extraSmallButton;
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getLabelStyle = () => {
    switch (size) {
      case 'xs':
        return styles.extraSmallLabel;
      case 'small':
        return styles.smallLabel;
      case 'large':
        return styles.largeLabel;
      default:
        return styles.mediumLabel;
    }
  };

  return (
    <Button
      mode={variant === 'outline' ? 'outlined' : 'contained'}
      style={[
        styles.button,
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        variant !== 'outline' && { backgroundColor: getVariantColor() },
        style,
      ]}
      labelStyle={[getLabelStyle(), labelStyle]}
      icon={icon}
      {...props}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    borderRadius: 40,
  },
  fullWidth: {
    marginHorizontal: 0,
  },
  // Size variants
  extraSmallButton: {
    padding: 4,
  },
  smallButton: {
    padding: 8,
  },
  mediumButton: {
    padding: 16,
  },
  largeButton: {
    padding: 24,
  },
  // Label size variants
  extraSmallLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediumLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  largeLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
});

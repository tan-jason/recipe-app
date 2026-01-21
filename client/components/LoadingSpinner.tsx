import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'blue' | 'white';
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const startAnimation = () => {
      spinValue.setValue(0);
      animationRef.current = Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animationRef.current.start(({ finished }) => {
        if (finished) {
          startAnimation();
        }
      });
    };

    startAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { width: 24, height: 24, borderWidth: 2 },
    md: { width: 32, height: 32, borderWidth: 2 },
    lg: { width: 48, height: 48, borderWidth: 3 },
  };

  const colorMap: Record<string, string> = {
    primary: '#000000',
    blue: '#3B82F6',
    white: '#FFFFFF',
  };

  return (
    <Animated.View
      style={[
        sizeStyles[size],
        {
          borderRadius: 9999,
          borderTopColor: colorMap[color],
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    />
  );
};

export default LoadingSpinner;

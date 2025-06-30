import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

export default function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.8)).current;
  const dot2 = useRef(new Animated.Value(0.8)).current;
  const dot3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container} accessible accessibilityRole="progressbar">
      <Animated.View style={[styles.dot, { transform: [{ scale: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ scale: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ scale: dot3 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f9c200',
    marginRight: 10,
  },
});

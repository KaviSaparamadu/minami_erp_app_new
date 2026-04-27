import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { isDarkMode } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo scale and fade in
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotating background circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Text fade in
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-finish after 3.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(onFinish);
    }, 3500);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, textOpacityAnim, rotateAnim, onFinish]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
      ]}
    >
      {/* Animated background circles */}
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle1,
          {
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle2,
          {
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-360deg'],
                }),
              },
            ],
          },
        ]}
      />

      {/* Logo/Icon Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.logoBox, { borderColor: isDarkMode ? '#E91E63' : '#E91E63' }]}>
          <View style={styles.logoInner} />
        </View>
      </Animated.View>

      {/* Text "G PiT" */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacityAnim,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.mainText,
            {
              color: isDarkMode ? '#FFFFFF' : '#000000',
              transform: [
                {
                  scaleY: textOpacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          G PiT
        </Animated.Text>
        <Animated.Text
          style={[
            styles.subText,
            {
              color: isDarkMode ? '#999999' : '#666666',
              opacity: textOpacityAnim,
            },
          ]}
        >
          Enterprise Management System
        </Animated.Text>
      </Animated.View>

      {/* Bottom loader dots */}
      <Animated.View
        style={[
          styles.loaderContainer,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <DotLoader />
      </Animated.View>
    </View>
  );
};

function DotLoader() {
  const dots = Array.from({ length: 4 });
  const animValues = dots.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    animValues.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 150),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((_, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.loaderDot,
            {
              opacity: animValues[idx].interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  translateY: animValues[idx].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 10000,
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  bgCircle1: {
    width: 300,
    height: 300,
    top: '20%',
    left: '-5%',
  },
  bgCircle2: {
    width: 400,
    height: 400,
    bottom: '-10%',
    right: '-10%',
  },
  logoContainer: {
    marginBottom: 40,
    zIndex: 10,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E91E63',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    zIndex: 10,
  },
  mainText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E91E63',
  },
});

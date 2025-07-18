import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image, ScrollView, DeviceEventEmitter, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ArrowRight, ArrowDown, CheckCircle, Navigation, Sparkles, ImageIcon, Locate } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { CameraView } from 'expo-camera';
import { Eye } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const halls = [
  { label: 'Hall A', value: 'hall_a' },
  { label: 'Hall B', value: 'hall_b' },
  { label: 'Hall C', value: 'hall_c' },
];

const exhibitsByHall = {
  hall_a: [
    { label: 'The Giant Zoetrope', value: 'zoetrope' },
    { label: 'Professor Crackitt\'s Light Fantastic Mirror Maze', value: 'mirror' },
    { label: 'Laser Maze Challenge', value: 'laser' },
    { label: 'Scientist for a Day', value: 'scientist' },
  ],
  hall_b: [
    { label: 'Earth Alive', value: 'earth_alive' },
    { label: 'The Science of Fear', value: 'science_fear' },
    { label: 'Energy Store', value: 'energy_store' },
  ],
  hall_c: [
    { label: 'Going Viral', value: 'going_viral' },
    { label: 'E-mmersive Experiential Environment', value: 'emmersive' },
  ],
};

const exhibitDescriptions: { [key: string]: string } = {
  zoetrope: 'Experience the magic of early animation with our interactive giant zoetrope featuring mesmerizing moving images.',
  mirror: 'Navigate through a dazzling maze of lights and mirrors in this mind-bending optical illusion experience.',
  laser: 'Test your agility and stealth skills in this exciting laser obstacle course challenge.',
  scientist: 'Become a real scientist for a day with hands-on experiments and interactive learning stations.',
  earth_alive: 'Discover the wonders of our living planet through immersive displays and interactive exhibits.',
  science_fear: 'Explore the fascinating science behind fear, phobias, and the human nervous system.',
  energy_store: 'Learn about renewable energy, power generation, and sustainable technologies for the future.',
  going_viral: 'Understand how viruses spread and the science behind pandemics in this timely exhibit.',
  emmersive: 'Step into a fully immersive digital environment with cutting-edge VR and AR technology.',
};

const exhibitImages: { [key: string]: string } = {
  zoetrope: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/zoetrope/banners/zoetrope-banner.jpg',
  mirror: 'https://img.jakpost.net/c/2018/04/06/2018_04_06_43556_1523009900._medium.jpg',
  laser: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/laser-maze-challenge/teasers/lasermaze-teaser.jpg',
  scientist: 'https://heartlandertourist.wordpress.com/wp-content/uploads/2017/04/20160809_130510.jpg',
  earth_alive: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/earth-alive/highlights/gaia.jpg',
  science_fear: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/phobia/teasers/phobia-teaser.jpg',
  energy_store: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/energy/energy-carousel-images/energy-exhibition---future-power.jpg',
  going_viral: 'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/going-viral-travelling-exhibition/dsc_5729.jpg',
  emmersive: 'https://www.littledayout.com/wp-content/uploads/Science-Centre-Singapore-31.jpg',
};

const practicalLocations = [
  { label: 'Restroom', value: 'restroom' },
  { label: 'Elevator', value: 'elevator' },
  { label: 'Food Stall', value: 'food' },
  { label: 'First Aid Room', value: 'first_aid' },
];

const navigationData: { [key: string]: { distance: string; directions: string[]; isCrossHall: boolean } } = {
  // HALL A
  'zoetrope-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the left', 'You will find the nearest restroom on your left'],
    isCrossHall: false
  },
  'zoetrope-elevator': {
    distance: '10 meters',
    directions: ['Walk 10 meters to the left', 'The nearest elevator will be on your left'],
    isCrossHall: false
  },
  'zoetrope-food': {
    distance: '25 meters',
    directions: ['Walk 10 meters to the left to reach the elevator', 'Take the elevator to the upper floor', 'Walk 15 meters to reach the nearest food stall'],
    isCrossHall: false
  },
  'zoetrope-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
  'mirror-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the right', 'You will find the nearest restroom on your right'],
    isCrossHall: false
  },
  'mirror-elevator': {
    distance: '10 meters',
    directions: ['Walk 10 meters to the front', 'The nearest elevator will be ahead of you'],
    isCrossHall: false
  },
  'mirror-food': {
    distance: '23 meters',
    directions: ['Walk 10 meters to the front to reach the elevator', 'Take the elevator to the upper floor', 'Walk 13 meters to reach the nearest food stall'],
    isCrossHall: false
  },
  'mirror-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
  'laser-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the right', 'You will find the nearest restroom on your right'],
    isCrossHall: false
  },
  'laser-elevator': {
    distance: '10 meters',
    directions: ['Walk 10 meters to the front', 'The nearest elevator will be ahead of you'],
    isCrossHall: false
  },
  'laser-food': {
    distance: '20 meters',
    directions: ['Walk 10 meters to the front to reach the elevator', 'Take the elevator to the upper floor', 'Walk 10 meters to reach the nearest food stall'],
    isCrossHall: false
  },
  'laser-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
  'scientist-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the left', 'You will find the nearest restroom on your left'],
    isCrossHall: false
  },
  'scientist-elevator': {
    distance: '7 meters',
    directions: ['Walk 7 meters to the right', 'The nearest elevator will be on your right'],
    isCrossHall: false
  },
  'scientist-food': {
    distance: '15 meters',
    directions: ['Walk 7 meters to the right to reach the elevator', 'Take the elevator to the upper floor', 'Walk 8 meters to reach the nearest food stall'],
    isCrossHall: false
  },
  'scientist-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
  
  // HALL B
  'earth_alive-elevator': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the left', 'The nearest elevator will be on your left'],
    isCrossHall: false
  },
  'earth_alive-restroom': {
    distance: '10 meters',
    directions: ['Walk 10 meters to the front', 'You will find the nearest restroom ahead of you'],
    isCrossHall: false
  },
  'earth_alive-first_aid': {
    distance: '15 meters',
    directions: ['Walk 15 meters to the front', 'The First Aid Room will be ahead of you'],
    isCrossHall: false
  },
  'earth_alive-food': {
    distance: 'Go to Hall A',
    directions: ['Go to Hall A for nearest Food Stall'],
    isCrossHall: true
  },
  'science_fear-elevator': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the front', 'The nearest elevator will be ahead of you'],
    isCrossHall: false
  },
  'science_fear-restroom': {
    distance: '3 meters',
    directions: ['Walk 3 meters to the back', 'You will find the nearest restroom behind you'],
    isCrossHall: false
  },
  'science_fear-first_aid': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the back', 'The First Aid Room will be behind you'],
    isCrossHall: false
  },
  'science_fear-food': {
    distance: 'Go to Hall A',
    directions: ['Go to Hall A for nearest Food Stall'],
    isCrossHall: true
  },
  'energy_store-elevator': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the right', 'The nearest elevator will be on your right'],
    isCrossHall: false
  },
  'energy_store-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the left', 'You will find the nearest restroom on your left'],
    isCrossHall: false
  },
  'energy_store-first_aid': {
    distance: '7 meters',
    directions: ['Walk 7 meters to the left', 'The First Aid Room will be on your left'],
    isCrossHall: false
  },
  'energy_store-food': {
    distance: 'Go to Hall A',
    directions: ['Go to Hall A for nearest Food Stall'],
    isCrossHall: true
  },
  
  // HALL C
  'going_viral-restroom': {
    distance: '10 meters',
    directions: ['Walk 10 meters to the front', 'You will find the nearest restroom ahead of you'],
    isCrossHall: false
  },
  'going_viral-elevator': {
    distance: '10 meters',
    directions: ['Walk 10 meters slightly to the left', 'The nearest elevator will be on your left'],
    isCrossHall: false
  },
  'going_viral-food': {
    distance: 'Go to Hall A',
    directions: ['Go to Hall A for nearest Food Stall'],
    isCrossHall: true
  },
  'going_viral-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
  'emmersive-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the right', 'You will find the nearest restroom on your right'],
    isCrossHall: false
  },
  'emmersive-elevator': {
    distance: '7 meters',
    directions: ['Walk 7 meters to the right', 'The nearest elevator will be on your right'],
    isCrossHall: false
  },
  'emmersive-food': {
    distance: 'Go to Hall A',
    directions: ['Go to Hall A for nearest Food Stall'],
    isCrossHall: true
  },
  'emmersive-first_aid': {
    distance: 'Go to Hall B',
    directions: ['Go to Hall B for nearest First Aid Room'],
    isCrossHall: true
  },
};

export default function NavigationSystem() {
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [destination, setDestination] = useState(null);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalDistance, setTotalDistance] = useState('');
  const [isCrossHallNavigation, setIsCrossHallNavigation] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [detectedLocation, setDetectedLocation] = useState<{ hall: string; exhibit: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [locationDetected, setLocationDetected] = useState(false);
  const cameraRef = React.useRef(null);

  const [openHall, setOpenHall] = useState(false);
  const [openCurrent, setOpenCurrent] = useState(false);
  const [openDestination, setOpenDestination] = useState(false);

  // Animation values
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageAnim] = useState(new Animated.Value(0));
  const [detectAnim] = useState(new Animated.Value(1));

  const currentExhibits = selectedHall ? exhibitsByHall[selectedHall as keyof typeof exhibitsByHall] : [];

  // On mount, check for a stored location from features.tsx and set hall/exhibit accordingly
  useEffect(() => {
    (async () => {
      const storedLocation = await AsyncStorage.getItem('ssc_current_location');
      if (storedLocation) {
        try {
          const { hall, exhibit } = JSON.parse(storedLocation);
          if (hall && exhibit) {
            setSelectedHall(hall);
            setCurrentLocation(exhibit);
          }
        } catch (e) {}
      }
    })();
    // Listen for custom event for instant sync in SPA
    const subscription = DeviceEventEmitter.addListener('ssc_location_changed', (event) => {
      if (event && event.hall && event.exhibit) {
        setSelectedHall(event.hall);
        setCurrentLocation(event.exhibit);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (routeSteps.length > 0) {
      // Fade in navigation instructions
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [routeSteps]);

  // Fix handleHallChange and handleCurrentLocationChange parameter types
  const handleHallChange = React.useCallback((hall: string | null) => {
    setSelectedHall(hall);
    setCurrentLocation(null);
    setRouteSteps([]);
    setCurrentStep(0);
    setTotalDistance('');
    setIsCrossHallNavigation(false);
    setImageError({});
    setDetectedLocation(null);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
    imageAnim.setValue(0);
  }, [fadeAnim, slideAnim, imageAnim]);

  // Fix handleHallChange and handleCurrentLocationChange parameter types
  const handleCurrentLocationChange = React.useCallback((location: string | null) => {
    setCurrentLocation(location);
    setRouteSteps([]);
    setCurrentStep(0);
    setTotalDistance('');
    setIsCrossHallNavigation(false);
    setDetectedLocation(null);
    
    // Reset navigation animations
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
  }, [fadeAnim, slideAnim]);

  // New location detection logic
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setLocationDetected(true);
      setSelectedHall('hall_a' as any);
      setCurrentLocation('zoetrope' as any);
    }, 2000);
  };

  const handleStartNavigation = () => {
    if (!currentLocation || !destination) return;

    const key = `${currentLocation}-${destination}`;
    const route = navigationData[key] || null;

    if (route) {
      setRouteSteps(route.directions);
      setTotalDistance(route.distance);
      setIsCrossHallNavigation(route.isCrossHall);
      setCurrentStep(0);
    } else {
      const noRouteMessage = ['No route available between selected locations.'];
      setTotalDistance('');
      setIsCrossHallNavigation(false);
      setCurrentStep(0);
    }
  };
  

  const handleNextStep = () => {
    if (currentStep < routeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      
      // Animate step transition
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleReset = () => {
    setSelectedHall(null);
    setCurrentLocation(null);
    setDestination(null);
    setRouteSteps([]);
    setCurrentStep(0);
    setTotalDistance('');
    setIsCrossHallNavigation(false);
    setImageError({});
    setDetectedLocation(null);
    
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
    imageAnim.setValue(0);
  };

  const handleImageError = (exhibitValue: string) => {
    setImageError(prev => ({
      ...prev,
      [exhibitValue]: true
    }));
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const isNavigationComplete = currentStep >= routeSteps.length - 1 && !isCrossHallNavigation;

  // Add proper null checking and improve function structure
  const getCurrentExhibitLabel = React.useCallback(() => {
    if (!currentLocation || !currentExhibits.length) return '';
    
    const exhibit = currentExhibits.find((ex) => ex.value === currentLocation);
    return exhibit?.label || '';
  }, [currentLocation, currentExhibits]);

  return (
  <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
    <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Hall A Navigation</Text>
        <Text style={styles.headerSubtitle}>Interactive Exhibit Guide</Text>
      </View>
    </LinearGradient>
    <FlatList
      data={[{}]}
      keyExtractor={() => 'main'}
      contentContainerStyle={{ padding: 20 }}
      renderItem={() => (
        <>
          <View style={styles.currentLocationSection}>
            <Text style={styles.sectionTitle}>Select Your Location</Text>
            <DropDownPicker
              open={openHall}
              setOpen={setOpenHall}
              items={halls}
              value={selectedHall}
              setValue={val => handleHallChange(val as unknown as string | null)}
              placeholder="Choose a hall"
              style={styles.dropdown}
              containerStyle={{ marginBottom: 20 }}
              zIndex={4000}
              zIndexInverse={500}
            />
            <DropDownPicker
              open={openCurrent}
              setOpen={setOpenCurrent}
              items={currentExhibits}
              value={currentLocation}
              setValue={val => handleCurrentLocationChange(val as unknown as string | null)}
              placeholder={selectedHall ? "Select your current exhibit" : "Please select a hall first"}
              style={[styles.dropdown, !selectedHall && styles.disabledDropdown]}
              disabled={!selectedHall}
              containerStyle={{ marginBottom: 20 }}
              zIndex={3000}
              zIndexInverse={1000}
            />
            <DropDownPicker
              open={openDestination}
              setOpen={setOpenDestination}
              items={practicalLocations}
              value={destination}
              setValue={setDestination}
              placeholder="Select what you need"
              style={styles.dropdown}
              containerStyle={{ marginBottom: 20 }}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.startButton,
              { marginTop: 115 },
              (!selectedHall || !currentLocation || !destination) && styles.disabledButton
            ]}
            onPress={handleStartNavigation}
            disabled={!selectedHall || !currentLocation || !destination}
          >
            <Text style={styles.startButtonText}>Get Directions</Text>
          </TouchableOpacity>
          {routeSteps.length > 0 && (
            <View style={styles.navigationInfo}>
              <Text style={styles.navigationTitle}>Directions</Text>
              {totalDistance && (
                <View style={styles.navigationItem}>
                  <Text style={styles.navigationText}>Distance: {totalDistance}</Text>
                </View>
              )}
              <View style={styles.navigationItem}>
                <Text style={styles.navigationText}>{routeSteps[currentStep]}</Text>
              </View>
              {currentStep < routeSteps.length - 1 ? (
                <TouchableOpacity style={styles.nextExhibitButton} onPress={handleNextStep}>
                  <Text style={styles.nextExhibitButtonText}>Next Step</Text>
                </TouchableOpacity>
              ) : !isCrossHallNavigation ? (
                <View style={styles.arrivalContainer}>
                  <Text style={styles.arrivalText}>You've arrived at your destination!</Text>
                </View>
              ) : (
                <View style={styles.crossHallContainer}>
                  <Text style={styles.crossHallText}>Continue to the specified hall</Text>
                </View>
              )}
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>New Navigation</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    />
  </View>
);

}

const styles = StyleSheet.create({
  header: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  currentLocationSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledDropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  navigationInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  navigationText: {
    fontSize: 14,
    color: '#666',
  },
  nextExhibitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#FF8C42',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  nextExhibitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  arrivalContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  arrivalText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  crossHallContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  crossHallText: {
    color: '#FF8C42',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
  },
});
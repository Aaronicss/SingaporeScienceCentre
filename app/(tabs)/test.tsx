import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image, ScrollView, DeviceEventEmitter, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const halls = [
  { label: 'Hall A', value: 'hall_a' },
  { label: 'Hall B', value: 'hall_b' },
  { label: 'Hall C', value: 'hall_c' },
];

const exhibitsByHall: { [key: string]: { label: string; value: string }[] } = {
  hall_a: [
    { label: 'The Giant Zoetrope', value: 'zoetrope' },
    { label: 'Professor Crackitt\'s Light Fantastic Mirror Maze', value: 'mirror' },
    { label: 'Laser Maze Challenge', value: 'laser' },
    { label: 'Scientist for a Day', value: 'scientist' },
  ],
  hall_b: [
    { label: 'Earth Alive', value: 'earth_alive' },
    { label: 'The Science of Fear', value: 'science_fear' },
    { label: 'Energy Story', value: 'energy_story' },
  ],
  hall_c: [
    { label: 'Going Viral', value: 'going_viral' },
    { label: 'E-mmersive Experiential Environment', value: 'emmersive' },
  ],
};

const practicalLocations = [
  { label: 'Restroom', value: 'restroom' },
  { label: 'Elevator', value: 'elevator' },
  { label: 'Food Stall', value: 'food' },
  { label: 'First Aid Room', value: 'first_aid' },
];

// Image mapping function
const getRouteImagePath = (hall: string, currentLocation: string, destination: string): string | null => {
  if (!hall || !currentLocation || !destination) return null;
  
  const hallFormatted = hall.replace('_', '-');
  
  const locationFormatted = currentLocation.replace('_', '-');
  
  const destinationFormatted = destination.replace('_', '-');
  
  const filename = `${hallFormatted}-${locationFormatted}-to-${destinationFormatted}.png`;
  
  return filename;
};

const imageMap: { [key: string]: string } = {
  // Hall A images
  'hall-a-zoetrope-to-restroom.png': 'https://i.imgur.com/M62VRuu.png',
  'hall-a-zoetrope-to-elevator.png': 'https://i.imgur.com/CdiNqCm.png',
  'hall-a-zoetrope-to-food.png': 'https://i.imgur.com/MVUN5mQ.png',
  'hall-a-mirror-to-restroom.png': 'https://i.imgur.com/8kW2SMx.png',
  'hall-a-mirror-to-elevator.png': 'https://i.imgur.com/m1ogE2f.png',
  'hall-a-mirror-to-food.png': 'https://i.imgur.com/BlJEgY3.png',
  'hall-a-laser-to-restroom.png': 'https://i.imgur.com/FwMShkU.png',
  'hall-a-laser-to-elevator.png': 'https://i.imgur.com/EYDZ2HN.png',
  'hall-a-laser-to-food.png': 'https://i.imgur.com/LQ4umik.png',
  'hall-a-scientist-to-restroom.png': 'https://i.imgur.com/PNvgeId.png',
  'hall-a-scientist-to-elevator.png': 'https://i.imgur.com/RGet2V3.png',
  'hall-a-scientist-to-food.png': 'https://i.imgur.com/B40NqQE.png',
  
  // Hall B images
  'hall-b-earth-alive-to-elevator.png': 'https://i.imgur.com/WSnATeY.png',
  'hall-b-earth-alive-to-restroom.png': 'https://i.imgur.com/Z70BnlJ.png',
  'hall-b-earth-alive-to-first-aid.png': 'https://i.imgur.com/XoiNVLL.png',
  'hall-b-science-fear-to-elevator.png': 'https://i.imgur.com/8rOPg8O.png',
  'hall-b-science-fear-to-restroom.png': 'https://i.imgur.com/JzWf0Pq.png',
  'hall-b-science-fear-to-first-aid.png': 'https://i.imgur.com/4pRrcEm.png',
  'hall-b-energy-story-to-elevator.png': 'https://i.imgur.com/tsFzbfB.png',
  'hall-b-energy-story-to-restroom.png': 'https://i.imgur.com/AfmBCZU.png',
  'hall-b-energy-story-to-first-aid.png': 'https://i.imgur.com/AfmBCZU.png',
  
  // Hall C images
  'hall-c-going-viral-to-restroom.png': 'https://i.imgur.com/irHM0tI.png',
  'hall-c-going-viral-to-elevator.png': 'https://i.imgur.com/pmOsyg7.png',
  'hall-c-emmersive-to-restroom.png': 'https://i.imgur.com/fUH5ll1.png',
  'hall-c-emmersive-to-elevator.png': 'https://i.imgur.com/2eAgFq8.png',
  
};

type NavigationRoute = {
  distance: string;
  directions: string[];
  isCrossHall: boolean;
};

const navigationData: { [key: string]: NavigationRoute } = {
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
  'energy_story-elevator': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the right', 'The nearest elevator will be on your right'],
    isCrossHall: false
  },
  'energy_story-restroom': {
    distance: '5 meters',
    directions: ['Walk 5 meters to the left', 'You will find the nearest restroom on your left'],
    isCrossHall: false
  },
  'energy_story-first_aid': {
    distance: '7 meters',
    directions: ['Walk 7 meters to the left', 'The First Aid Room will be on your left'],
    isCrossHall: false
  },
  'energy_story-food': {
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
  const [imageError, setImageError] = useState({});
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [locationDetected, setLocationDetected] = useState(false);
  const [currentRouteImage, setCurrentRouteImage] = useState<string | null>(null);
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

  const currentExhibits = selectedHall ? exhibitsByHall[selectedHall] : [];

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

      // Animate route image
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [routeSteps]);

  // Update route image when selections change
  useEffect(() => {
    if (selectedHall && currentLocation && destination) {
      const imagePath = getRouteImagePath(selectedHall, currentLocation, destination);
      const imageSource = imagePath ? imageMap[imagePath] : null;
      setCurrentRouteImage(imageSource || null);
    } else {
      setCurrentRouteImage(null);
    }
  }, [selectedHall, currentLocation, destination]);

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
    setCurrentRouteImage(null);
    
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
    imageAnim.setValue(0);
  }, [fadeAnim, slideAnim, imageAnim]);

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
      setRouteSteps(['No route available between selected locations.'] as any);
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
    setCurrentRouteImage(null);
    
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
    if (!currentLocation || !currentExhibits || currentExhibits.length === 0) return '';
    
    const exhibit = currentExhibits.find((ex: any) => ex.value === currentLocation);
    if (exhibit && exhibit.label) {
      return (exhibit as any).label;
    }
    return '';
  }, [currentLocation, currentExhibits]);

  return (
  <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
    <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Hall Navigation</Text>
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
              setValue={setSelectedHall}
              onChangeValue={handleHallChange}
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
              setValue={setCurrentLocation}
              onChangeValue={handleCurrentLocationChange}
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

          {/* Route Image Preview */}
          {currentRouteImage && (
            <Animated.View 
              style={[
                styles.routeImageContainer,
                {
                  opacity: imageAnim,
                  transform: [{
                    translateY: imageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.routeImageTitle}>Route Preview</Text>
              <Image 
                source={currentRouteImage ? { uri: currentRouteImage } : undefined}
                style={styles.routeImage}
                resizeMode="contain"
                onError={() => console.log('Failed to load route image')}
              />
            </Animated.View>
          )}

          <TouchableOpacity
            style={[
              styles.startButton,
              { marginTop: currentRouteImage ? 20 : 115 },
              (!selectedHall || !currentLocation || !destination) && styles.disabledButton
            ]}
            onPress={handleStartNavigation}
            disabled={!selectedHall || !currentLocation || !destination}
          >
            <Text style={styles.startButtonText}>Get Directions</Text>
          </TouchableOpacity>
          {routeSteps.length > 0 && (
            <Animated.View 
              style={[
                styles.navigationInfo,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideTransform }]
                }
              ]}
            >
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
            </Animated.View>
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
  routeImageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  routeImageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  routeImage: {
    width: width - 72,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
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

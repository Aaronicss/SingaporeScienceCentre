import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Footprints,
  Ruler,
  ChevronRight,
  Eye,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const hallAExhibits = [
  {
    id: 1,
    name: 'The Giant Zoetrope',
    description:
      'Experience the magic of animation through this giant spinning optical illusion device.',
    image:
      'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 20, y: 30 },
  },
  {
    id: 2,
    name: "Professor Crackitt's Light Fantastic Mirror Maze",
    description: 'Navigate through an amazing maze of mirrors and lights.',
    image:
      'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 60, y: 45 },
  },
  {
    id: 3,
    name: 'Scientist for a Day',
    description: 'Experience life as a scientist through hands-on experiments.',
    image:
      'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 40, y: 70 },
  },
  {
    id: 4,
    name: 'Laser Maze Challenge',
    description: 'Test your agility and stealth skills in this exciting laser obstacle course challenge.',
    image:
      'https://www.science.edu.sg/images/default-source/scs-images/whats-on/exhibitions/laser-maze-challenge/teasers/lasermaze-teaser.jpg',
    mapPosition: { x: 80, y: 25 },
  },
];

export default function CameraToNavigationScreen() {
  const cameraRef = useRef(null);
  const router = useRouter();

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [currentExhibitIndex, setCurrentExhibitIndex] = useState(0);

  const currentExhibit = hallAExhibits[currentExhibitIndex];
  const nextExhibitIndex = (currentExhibitIndex + 1) % hallAExhibits.length;
  const nextExhibit = hallAExhibits[nextExhibitIndex];

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setTimeout(async () => {
      setIsDetecting(false);
      setLocationDetected(true);
      const exhibitKey = currentExhibit.name === 'The Giant Zoetrope' ? 'zoetrope' : currentExhibit.name === "Professor Crackitt's Light Fantastic Mirror Maze" ? 'mirror' : currentExhibit.name === 'Scientist for a Day' ? 'scientist' : currentExhibit.name === 'Laser Maze Challenge' ? 'laser' : '';
      await AsyncStorage.setItem('ssc_current_location', JSON.stringify({ hall: 'hall_a', exhibit: exhibitKey }));
      DeviceEventEmitter.emit('ssc_location_changed', { hall: 'hall_a', exhibit: exhibitKey });
    }, 2000);
  };

  const handleNextExhibit = async () => {
    setCurrentExhibitIndex(nextExhibitIndex);
    const next = hallAExhibits[nextExhibitIndex];
    const exhibitKey = next.name === 'The Giant Zoetrope' ? 'zoetrope' : next.name === "Professor Crackitt's Light Fantastic Mirror Maze" ? 'mirror' : next.name === 'Scientist for a Day' ? 'scientist' : next.name === 'Laser Maze Challenge' ? 'laser' : '';
    await AsyncStorage.setItem('ssc_current_location', JSON.stringify({ hall: 'hall_a', exhibit: exhibitKey }));
    DeviceEventEmitter.emit('ssc_location_changed', { hall: 'hall_a', exhibit: exhibitKey });
  };

  const getNavigationInfo = () => {
    const current = currentExhibit.mapPosition;
    const next = nextExhibit.mapPosition;
    const deltaX = next.x - current.x;
    const deltaY = next.y - current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const steps = Math.round(distance * 2);

    let direction = '';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'East' : 'West';
    } else {
      direction = deltaY > 0 ? 'South' : 'North';
    }

    return { distance: Math.round(distance), steps, direction };
  };

  const navigationInfo = getNavigationInfo();

  if (!locationDetected) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.cameraOverlay}>
          <View style={styles.detectionFrame} />
          <Text style={styles.cameraInstructions}>
            Point camera at your surroundings to detect location
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detectButton}
          onPress={handleDetectLocation}
          disabled={isDetecting}
        >
          <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.detectButtonGradient}>
            <Eye color="white" size={20} />
            <Text style={styles.detectButtonText}>
              {isDetecting ? 'Detecting Location...' : 'Detect My Location'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Hall A Navigation</Text>
            <Text style={styles.headerSubtitle}>Interactive Exhibit Guide</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.currentLocationSection}>
          <View style={styles.locationHeader}>
            <MapPin color="#FF6B35" size={20} />
            <Text style={styles.currentLocationTitle}>You are currently in:</Text>
          </View>
          <Text style={styles.currentExhibitName}>
            "{currentExhibit.name}"
          </Text>
        </View>

        <View style={styles.exhibitDetailsSection}>
          <Image source={{ uri: currentExhibit.image }} style={styles.exhibitImage} />
          <Text style={styles.exhibitName}>{currentExhibit.name}</Text>
          <Text style={styles.exhibitDescription}>{currentExhibit.description}</Text>

          <TouchableOpacity style={styles.nextExhibitButton} onPress={handleNextExhibit}>
            <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.detectButtonGradient}>
              <Navigation color="white" size={20} />
              <Text style={styles.detectButtonText}>Go to Next Exhibit</Text>
              <ChevronRight color="white" size={20} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.navigationInfo}>
            <Text style={styles.navigationTitle}>To reach "{nextExhibit.name}":</Text>
            <View style={styles.navigationDetails}>
              <View style={styles.navigationItem}>
                <Ruler color="#666" size={16} />
                <Text style={styles.navigationText}>Distance: {navigationInfo.distance}m</Text>
              </View>
              <View style={styles.navigationItem}>
                <Footprints color="#666" size={16} />
                <Text style={styles.navigationText}>Steps: ~{navigationInfo.steps}</Text>
              </View>
              <View style={styles.navigationItem}>
                <Navigation color="#666" size={16} />
                <Text style={styles.navigationText}>Direction: {navigationInfo.direction}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Hall A Map */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Hall A Map</Text>
          <View style={styles.mapContainer}>
            <View style={styles.map}>
              {/* Map background */}
              <View style={styles.mapBackground} />
              
              {/* Hall A label */}
              <Text style={styles.hallLabel}>HALL A</Text>
              
              {/* Exhibit positions */}
              {hallAExhibits.map((exhibit, index) => (
                <View
                  key={exhibit.id}
                  style={[
                    styles.mapMarker,
                    {
                      left: `${exhibit.mapPosition.x}%`,
                      top: `${exhibit.mapPosition.y}%`,
                    },
                    index === currentExhibitIndex && styles.currentMapMarker
                  ]}
                >
                  <View style={[
                    styles.markerDot,
                    index === currentExhibitIndex && styles.currentMarkerDot
                  ]} />
                  <Text style={[
                    styles.markerLabel,
                    index === currentExhibitIndex && styles.currentMarkerLabel
                  ]}>
                    {index + 1}
                  </Text>
                </View>
              ))}
              
              {/* Path line to next exhibit */}
              <View
  style={[
    styles.pathLine,
    {
      left: `${currentExhibit.mapPosition.x}%` as `${number}%`,
      top: `${currentExhibit.mapPosition.y}%` as `${number}%`,
      width: `${Math.abs(nextExhibit.mapPosition.x - currentExhibit.mapPosition.x)}%` as `${number}%`,
      height: `${Math.abs(nextExhibit.mapPosition.y - currentExhibit.mapPosition.y)}%` as `${number}%`,
    }
  ]}
/>
</View>
            
            {/* Map Legend */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={styles.currentLegendDot} />
                <Text style={styles.legendText}>Current Location</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.otherLegendDot} />
                <Text style={styles.legendText}>Other Exhibits</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>

  );
}


const styles = StyleSheet.create({
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  detectionFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FF6B35',
    borderRadius: 12,
    marginBottom: 20,
  },
  cameraInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  detectButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  detectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  detectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentLocationTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  currentExhibitName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  exhibitDetailsSection: {
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
  exhibitImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  exhibitName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exhibitDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  nextExhibitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },
  navigationInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  navigationDetails: {
    gap: 8,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationText: {
    fontSize: 14,
    color: '#666',
  },
  mapSection: {
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
  mapContainer: {
    alignItems: 'center',
  },
  map: {
    width: width - 80,
    height: 200,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
  },
  hallLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  currentMapMarker: {
    zIndex: 10,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCC',
    borderWidth: 2,
    borderColor: 'white',
  },
  currentMarkerDot: {
    backgroundColor: '#FF6B35',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 2,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  currentMarkerLabel: {
    color: '#FF6B35',
  },
  pathLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  otherLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCC',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 20,
  },

});

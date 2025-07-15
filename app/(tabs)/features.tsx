import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, Footprints, Ruler, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Hall A exhibits data
const hallAExhibits = [
  {
    id: 1,
    name: 'The Giant Zoetrope',
    description: 'Experience the magic of animation through this giant spinning optical illusion device that brings static images to life.',
    image: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 20, y: 30 }
  },
  {
    id: 2,
    name: 'Professor Crackitt\'s Light Fantastic Mirror Maze',
    description: 'Navigate through an amazing maze of mirrors and lights in this optical adventure that challenges your perception.',
    image: 'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 60, y: 45 }
  },
  {
    id: 3,
    name: 'Scientist for a Day',
    description: 'Experience life as a scientist through hands-on experiments and research in our interactive laboratory setting.',
    image: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 40, y: 70 }
  },
  {
    id: 4,
    name: 'Urban Mutations',
    description: 'Explore how cities evolve and adapt to changing environmental and social conditions in this interactive urban planning experience.',
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
    mapPosition: { x: 80, y: 25 }
  }
];

export default function Features() {
  const router = useRouter();
  const [currentExhibitIndex, setCurrentExhibitIndex] = useState(0);
  
  const currentExhibit = hallAExhibits[currentExhibitIndex];
  const nextExhibitIndex = (currentExhibitIndex + 1) % hallAExhibits.length;
  const nextExhibit = hallAExhibits[nextExhibitIndex];

  // Calculate navigation info to next exhibit
  const getNavigationInfo = () => {
    const current = currentExhibit.mapPosition;
    const next = nextExhibit.mapPosition;
    
    const deltaX = next.x - current.x;
    const deltaY = next.y - current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const steps = Math.round(distance * 2); // Approximate steps
    
    let direction = '';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'East' : 'West';
    } else {
      direction = deltaY > 0 ? 'South' : 'North';
    }
    
    return {
      distance: Math.round(distance),
      steps,
      direction
    };
  };

  const navigationInfo = getNavigationInfo();

  const handleNextExhibit = () => {
    setCurrentExhibitIndex(nextExhibitIndex);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Hall A Navigation</Text>
            <Text style={styles.headerSubtitle}>Interactive Exhibit Guide</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location */}
        <View style={styles.currentLocationSection}>
          <View style={styles.locationHeader}>
            <MapPin color="#FF6B35" size={20} />
            <Text style={styles.currentLocationTitle}>You are currently in:</Text>
          </View>
          <Text style={styles.currentExhibitName}>"{currentExhibit.name}"</Text>
        </View>

        {/* Hall A Exhibits List */}
        <View style={styles.exhibitsListSection}>
          <Text style={styles.sectionTitle}>Hall A Exhibits</Text>
          <View style={styles.exhibitsList}>
            {hallAExhibits.map((exhibit, index) => (
              <View 
                key={exhibit.id} 
                style={[
                  styles.exhibitListItem,
                  index === currentExhibitIndex && styles.currentExhibitItem
                ]}
              >
                <View style={[
                  styles.exhibitDot,
                  index === currentExhibitIndex && styles.currentExhibitDot
                ]} />
                <Text style={[
                  styles.exhibitListText,
                  index === currentExhibitIndex && styles.currentExhibitText
                ]}>
                  {exhibit.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Current Exhibit Details */}
        <View style={styles.exhibitDetailsSection}>
          <Image source={{ uri: currentExhibit.image }} style={styles.exhibitImage} />
          
          <View style={styles.exhibitInfo}>
            <Text style={styles.exhibitName}>{currentExhibit.name}</Text>
            <Text style={styles.exhibitDescription}>{currentExhibit.description}</Text>
          </View>

          {/* Navigation Button */}
          <TouchableOpacity 
            style={styles.nextExhibitButton}
            onPress={handleNextExhibit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.buttonGradient}
            >
              <Navigation color="white" size={20} />
              <Text style={styles.buttonText}>Go to Next Exhibit</Text>
              <ChevronRight color="white" size={20} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Navigation Info */}
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
                    left: `${currentExhibit.mapPosition.x}%`,
                    top: `${currentExhibit.mapPosition.y}%`,
                    width: Math.abs(nextExhibit.mapPosition.x - currentExhibit.mapPosition.x) + '%',
                    height: Math.abs(nextExhibit.mapPosition.y - currentExhibit.mapPosition.y) + '%',
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  content: {
    flex: 1,
    padding: 20,
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
  exhibitsListSection: {
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
  exhibitsList: {
    gap: 12,
  },
  exhibitListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currentExhibitItem: {
    backgroundColor: '#FFF5F2',
  },
  exhibitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
  },
  currentExhibitDot: {
    backgroundColor: '#FF6B35',
  },
  exhibitListText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  currentExhibitText: {
    color: '#FF6B35',
    fontWeight: '600',
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
  exhibitInfo: {
    marginBottom: 20,
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
  },
  nextExhibitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
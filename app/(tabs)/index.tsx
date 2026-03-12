import { LinearGradient } from 'expo-linear-gradient';
import { Info, MapPin, ShoppingCart, User, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const PRODUCTS = [
  { id: '1', name: 'A-L Kachha', image: require('@/assets/images/a-l-kachha.jpg'), category: 'Kachha' },
  { id: '2', name: 'A-T Wash', image: require('@/assets/images/a-t-wash.jpg'), category: 'Wash' },
  { id: '3', name: 'Lite Kachha', image: require('@/assets/images/lite-kachha.jpg'), category: 'Kachha' },
  { id: '4', name: 'M-T Wash', image: require('@/assets/images/m-t-wash.jpg'), category: 'Wash' },
  { id: '5', name: 'Scrap Tin', image: require('@/assets/images/scrap-tin.jpg'), category: 'Scrap' },
  { id: '6', name: 'Sec Kachha', image: require('@/assets/images/sec-kachha.jpg'), category: 'Kachha' },
  { id: '7', name: 'S-L Kachha', image: require('@/assets/images/s-l-kachha.jpg'), category: 'Kachha' },
  { id: '8', name: 'S-L Wash', image: require('@/assets/images/s-l-wash.jpg'), category: 'Wash' },
  { id: '9', name: 'S-T Wash', image: require('@/assets/images/s-t-wash.jpg'), category: 'Wash' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const renderProductCard = (product: any) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/(tabs)/tin-details', params: { name: product.name } })}
    >
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.productImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.mainWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Patil Tin Suppliers</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6c757d" />
              <Text style={styles.locationText}>Surat, Gujarat</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <User size={24} color="#343a40" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Product Grid */}
          <View style={styles.grid}>
            {PRODUCTS.map(renderProductCard)}
          </View>
        </ScrollView>
      </View>

      {/* Product Details Modal */}
      <Modal
        visible={selectedProduct !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedProduct(null)}
            >
              <X size={24} color="#343a40" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={selectedProduct?.image} style={styles.modalImage} resizeMode="cover" />

              <View style={styles.modalDetails}>
                <Text style={styles.modalCategory}>{selectedProduct?.category}</Text>
                <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>

                <View style={styles.divider} />

                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailText}>
                  Premium quality {selectedProduct?.name} tin material designed for high durability and industrial use.
                  Supplied by Patil Tin Suppliers, ensuring the best standards in Gujarat.
                </Text>

                <View style={styles.specGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Quality</Text>
                    <Text style={styles.specValue}>Grade A</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Type</Text>
                    <Text style={styles.specValue}>{selectedProduct?.category}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Inquire Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainWrapper: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 4,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    margin: 20,
    borderRadius: 20,
    padding: 30,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 25,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#dc3545',
    fontWeight: '700',
    fontSize: 14,
  },
  bannerImageContainer: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  seeAllText: {
    color: '#dc3545',
    fontSize: 15,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'flex-start',
  },
  card: {
    width: isWeb ? (width > 1000 ? '23%' : '31%') : (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: isWeb ? '1%' : 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc3545',
    textTransform: 'uppercase',
  },
  cardInfo: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  infoButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
    width: isWeb ? '50%' : '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalImage: {
    width: '100%',
    height: 350,
  },
  modalDetails: {
    padding: 30,
  },
  modalCategory: {
    color: '#dc3545',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 25,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 24,
  },
  specGrid: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  specItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  specLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  orderButton: {
    backgroundColor: '#dc3545',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
});

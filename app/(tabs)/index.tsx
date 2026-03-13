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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Patil Tin Suppliers</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color="#6c757d" />
              <Text style={styles.headerSub}>Surat, Gujarat</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <User size={22} color="#1a1a1a" />
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
              <X size={24} color="#1a1a1a" />
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
                  <LinearGradient colors={['#dc3545', '#9b1b28']} style={styles.orderGradient}>
                    <Text style={styles.orderButtonText}>Inquire Now</Text>
                  </LinearGradient>
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
    backgroundColor: '#f1f3f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '700',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  seeAllText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
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
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: isWeb ? '1%' : 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
    height: '40%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#dc3545',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardInfo: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
  },
  infoButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    height: '92%',
    width: isWeb ? '50%' : '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 10,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalImage: {
    width: '100%',
    height: 380,
  },
  modalDetails: {
    padding: 30,
  },
  modalCategory: {
    color: '#dc3545',
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 8,
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 30,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 26,
    fontWeight: '500',
  },
  specGrid: {
    flexDirection: 'row',
    marginTop: 35,
    gap: 15,
  },
  specItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  specLabel: {
    fontSize: 11,
    color: '#adb5bd',
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  specValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  orderButton: {
    marginTop: 40,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  orderGradient: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

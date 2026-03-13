import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Package, RefreshCw, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = Platform.OS === 'web' ? 'http://localhost:5001/api' : 'http://192.168.0.67:5001/api';

type TinSummary = {
  type: string;
  total_quantity: number;
};

export default function TinsScreen() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<TinSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      // We'll fetch all and group on client for now, or use a dedicated endpoint if available
      const response = await fetch(`${API_URL}/tins`);
      const data = await response.json();
      
      // Aggregate by type
      const grouping: Record<string, number> = {};
      data.forEach((entry: any) => {
        const qty = parseFloat(entry.quantity) || 0;
        const type = entry.tin_type || 'Unknown';
        if (entry.status === 'Cash in') {
          grouping[type] = (grouping[type] || 0) + qty;
        } else {
          grouping[type] = (grouping[type] || 0) - qty;
        }
      });

      const summaryList = Object.entries(grouping).map(([type, total_quantity]) => ({
        type,
        total_quantity: Math.abs(total_quantity),
      }));

      setSummaries(summaryList);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSummaries();
    }, [])
  );

  const filteredSummaries = summaries.filter(s => 
    (s?.type || 'Unknown').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tins Stock</Text>
          <Text style={styles.headerSub}>Real-time inventory</Text>
        </View>
        <TouchableOpacity onPress={fetchSummaries} style={styles.refreshButton}>
          <RefreshCw size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Search size={20} color="#adb5bd" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by tin type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#adb5bd"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCol, { flex: 3 }]}>TIN TYPE</Text>
              <Text style={[styles.headerCol, { flex: 1, textAlign: 'right' }]}>STOCK QTY</Text>
            </View>

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#dc3545" />
              </View>
            ) : (
              <View>
                {filteredSummaries.map((item) => (
                  <View key={item.type} style={styles.tableRow}>
                    <View style={styles.nameContainer}>
                      <View style={styles.iconBox}>
                        <Package size={20} color="#dc3545" />
                      </View>
                      <Text style={styles.rowColText}>{item.type}</Text>
                    </View>
                    <View style={styles.qtyContainer}>
                      <Text style={styles.qtyText}>
                        {item.total_quantity.toLocaleString()}
                      </Text>
                      <Text style={styles.unitsText}>Units</Text>
                    </View>
                  </View>
                ))}
                {filteredSummaries.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No stock data found</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    marginTop: 2,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe3e3',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f1f3f5',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  headerCol: {
    fontSize: 11,
    fontWeight: '800',
    color: '#adb5bd',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 22,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rowColText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  qtyContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  unitsText: {
    fontSize: 10,
    color: '#adb5bd',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  loaderContainer: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    fontWeight: '600',
  },
});

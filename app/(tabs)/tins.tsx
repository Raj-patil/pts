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
        <Text style={styles.headerTitle}>Available Tins Stock</Text>
        <TouchableOpacity onPress={fetchSummaries} style={styles.refreshButton}>
          <RefreshCw size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#adb5bd" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tins..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#adb5bd"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCol, { flex: 3 }]}>Tin Type</Text>
            <Text style={[styles.headerCol, { flex: 1, textAlign: 'right' }]}>Stock Qty</Text>
          </View>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#dc3545" />
            </View>
          ) : (
            <FlatList
              data={filteredSummaries}
              keyExtractor={(item) => item.type}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <View style={styles.nameContainer}>
                    <Package size={16} color="#6c757d" style={{ marginRight: 10 }} />
                    <Text style={styles.rowColText}>{item.type}</Text>
                  </View>
                  <Text style={styles.qtyText}>
                    {item.total_quantity}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No stock data found</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 70,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#343a40',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  headerCol: {
    fontSize: 12,
    fontWeight: '800',
    color: '#495057',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  rowColText: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '600',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
    color: '#343a40',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    fontWeight: '600',
  },
});

import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart3, Home, Layout, Package, Receipt } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const WebNavbar = () => (
    <View style={styles.webNavbar}>
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={styles.brandContainer} 
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Layout size={24} color="#dc3545" />
          <Text style={styles.brandText}>Patil Tin Suppliers</Text>
        </TouchableOpacity>
        
        <View style={styles.linksContainer}>
          <TouchableOpacity 
            style={styles.navLink} 
            onPress={() => router.push('/(tabs)')}
          >
            <Home size={18} color="#343a40" />
            <Text style={styles.navLinkText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navLink}
            onPress={() => router.push('/(tabs)/tins')}
          >
            <Package size={18} color="#343a40" />
            <Text style={styles.navLinkText}>Tins</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navLink}
            onPress={() => router.push('/(tabs)/revenue')}
          >
            <BarChart3 size={18} color="#343a40" />
            <Text style={styles.navLinkText}>Revenue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navLink}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <Receipt size={18} color="#343a40" />
            <Text style={styles.navLinkText}>Expenses</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {isWeb && <WebNavbar />}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#dc3545',
          tabBarInactiveTintColor: '#adb5bd',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: isWeb ? { display: 'none' } : { 
            height: Platform.OS === 'ios' ? 85 : 70, 
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f1f3f5',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: -5,
          }
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tins"
          options={{
            title: 'Tins',
            tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="revenue"
          options={{
            title: 'Revenue',
            tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Expenses',
            tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tin-details"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  webNavbar: {
    height: 70,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    justifyContent: 'center',
    zIndex: 100,
  },
  navContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#343a40',
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  navLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#343a40',
  }
});

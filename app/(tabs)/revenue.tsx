import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3, Search, Database, Calendar, PieChart, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = Platform.OS === 'web' ? 'http://localhost:5001/api' : 'http://192.168.0.67:5001/api';

type Transaction = {
    id: number;
    name: string;
    tin_type: string;
    amount: number;
    date: string;
    type: 'tin' | 'expense';
};

type DailyTrend = {
    date: string;
    credit: number;
    debit: number;
};

type RevenueSummary = {
    total_revenue: number;
    credited: number;
    debited: number;
    credited_data: Transaction[];
    debited_data: Transaction[];
    daily_trends: DailyTrend[];
};

export default function RevenueScreen() {
    const [summary, setSummary] = useState<RevenueSummary>({
        total_revenue: 0,
        credited: 0,
        debited: 0,
        credited_data: [],
        debited_data: [],
        daily_trends: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [viewType, setViewType] = useState<'overview' | 'credited' | 'debited'>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRevenue = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/revenue`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchRevenue();
        }, [])
    );

    const formatCurrency = (amt: number) => {
        return `₹ ${parseFloat((amt || 0).toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const currentListData = (viewType === 'credited' ? summary.credited_data : summary.debited_data) || [];
    const filteredData = Array.isArray(currentListData) ? currentListData.filter(item => 
        (item?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.tin_type || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    // Custom Bar Chart Component
    const MonthlyBarChart = () => {
        const trends = summary.daily_trends || [];
        if (trends.length === 0) return null;

        const maxVal = Math.max(...trends.map(t => Math.max(t.credit, t.debit)), 100);
        const chartHeight = 150;

        return (
            <View style={styles.chartCard}>
                <View style={styles.chartHeaderRow}>
                    <Text style={styles.chartTitle}>7-Day Cash Flow Trend</Text>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#28a745' }]} />
                            <Text style={styles.legendText}>In</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
                            <Text style={styles.legendText}>Out</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.chartBody}>
                    <View style={styles.yAxis}>
                        <Text style={styles.axisLabel}>{formatCurrency(maxVal).split('.')[0]}</Text>
                        <Text style={styles.axisLabel}>{formatCurrency(maxVal/2).split('.')[0]}</Text>
                        <Text style={styles.axisLabel}>0</Text>
                    </View>
                    
                    <View style={styles.barsArea}>
                        {trends.map((day, idx) => {
                            const dateObj = new Date(day.date);
                            const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const creditHeight = (day.credit / maxVal) * chartHeight;
                            const debitHeight = (day.debit / maxVal) * chartHeight;

                            return (
                                <View key={idx} style={styles.barGroup}>
                                    <View style={styles.barStack}>
                                        <View style={[styles.bar, { height: creditHeight, backgroundColor: '#28a745', borderTopLeftRadius: 6, borderTopRightRadius: 6 }]} />
                                        <View style={[styles.bar, { height: debitHeight, backgroundColor: '#dc3545', borderTopLeftRadius: 6, borderTopRightRadius: 6 }]} />
                                    </View>
                                    <Text style={styles.barLabel}>{dayLabel}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        );
    };

    const renderOverview = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Total Revenue Card */}
            <View style={styles.mainCard}>
                <LinearGradient colors={['#dc3545', '#9b1b28']} style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <TrendingUp size={24} color="#dc3545" />
                        </View>
                        <Text style={styles.cardLabel}>Total Revenue</Text>
                    </View>
                    <Text style={styles.cardAmount}>{formatCurrency(summary.total_revenue)}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>Overall earnings from Tin sales</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Credited & Debited Row */}
            <View style={styles.row}>
                <TouchableOpacity 
                    style={styles.statCard} 
                    onPress={() => { setViewType('credited'); setSearchQuery(''); }}
                >
                    <View style={[styles.statIcon, { backgroundColor: '#e6f4ea' }]}>
                        <ArrowUpRight size={20} color="#1e7e34" />
                    </View>
                    <Text style={styles.statLabel}>Credited</Text>
                    <Text style={[styles.statAmount, { color: '#1e7e34' }]}>{formatCurrency(summary.credited)}</Text>
                    <Text style={styles.statSub}>Click for details</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.statCard} 
                    onPress={() => { setViewType('debited'); setSearchQuery(''); }}
                >
                    <View style={[styles.statIcon, { backgroundColor: '#fdf2f2' }]}>
                        <ArrowDownRight size={20} color="#dc3545" />
                    </View>
                    <Text style={styles.statLabel}>Debited</Text>
                    <Text style={[styles.statAmount, { color: '#dc3545' }]}>{formatCurrency(summary.debited)}</Text>
                    <Text style={styles.statSub}>Click for details</Text>
                </TouchableOpacity>
            </View>

            {/* Dynamic Chart */}
            <MonthlyBarChart />

            {/* Top Analytics Cards */}
            <View style={styles.analyticsSection}>
                <Text style={styles.sectionTitle}>Deep Analysis</Text>
                <View style={styles.analyticsCard}>
                    <View style={styles.analyticsHeader}>
                        <PieChart size={20} color="#dc3545" />
                        <Text style={styles.analyticsTitle}>Summary Stats</Text>
                    </View>
                    <View style={styles.analyticsItem}>
                        <Text style={styles.analyticsLabel}>Total Transactions</Text>
                        <Text style={styles.analyticsValue}>{summary.credited_data.length + summary.debited_data.length}</Text>
                    </View>
                    <View style={styles.analyticsItem}>
                        <Text style={styles.analyticsLabel}>Avg. Daily Revenue</Text>
                        <Text style={styles.analyticsValue}>{formatCurrency(summary.total_revenue / 30)}</Text>
                    </View>
                    <View style={styles.analyticsItem}>
                        <Text style={styles.analyticsLabel}>Net Profit Margin</Text>
                        <Text style={[styles.analyticsValue, { color: '#28a745' }]}>{summary.total_revenue > 0 ? ((summary.total_revenue - summary.debited) / summary.total_revenue * 100).toFixed(1) : 0}%</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderDetails = () => (
        <View style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
                <TouchableOpacity onPress={() => setViewType('overview')} style={styles.detailsBackButton}>
                    <ChevronLeft size={20} color="#dc3545" />
                    <Text style={styles.detailsBackText}>Back to Overview</Text>
                </TouchableOpacity>
                <Text style={styles.detailsTitle}>
                    {viewType === 'credited' ? 'Credited History' : 'Debited History'}
                </Text>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                    <Search size={20} color="#adb5bd" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or type..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#adb5bd"
                    />
                </View>
            </View>

            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCol, { flex: 1.5 }]}>Date</Text>
                    <Text style={[styles.headerCol, { flex: 2.5 }]}>Name / Type</Text>
                    <Text style={[styles.headerCol, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
                </View>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.tableRow}>
                            <Text style={[styles.rowColText, { flex: 1.5 }]}>{new Date(item.date).toLocaleDateString()}</Text>
                            <View style={{ flex: 2.5 }}>
                                <Text style={styles.rowNameText} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.rowTypeText}>{item.tin_type}</Text>
                            </View>
                            <Text style={[styles.rowColText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: viewType === 'credited' ? '#1e7e34' : '#dc3545' }]}>
                                {formatCurrency(item.amount)}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Database size={48} color="#dee2e6" />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Revenue</Text>
                    <Text style={styles.headerSub}>Earnings & analytics</Text>
                </View>
                <TouchableOpacity onPress={fetchRevenue} style={styles.refreshButton}>
                    <RefreshCw size={18} color="#dc3545" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#dc3545" />
                    </View>
                ) : (
                    viewType === 'overview' ? renderOverview() : renderDetails()
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f3f5' },
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
    content: { flex: 1, padding: 20 },
    mainCard: { borderRadius: 30, overflow: 'hidden', marginBottom: 25, elevation: 12, shadowColor: '#dc3545', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    cardGradient: { padding: 30 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
    cardAmount: { color: '#fff', fontSize: 38, fontWeight: '900', marginBottom: 15, letterSpacing: -1 },
    cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 20 },
    footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    statCard: { width: (width - 60) / 2, backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#fff' },
    statIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    statLabel: { fontSize: 13, fontWeight: '800', color: '#adb5bd', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    statAmount: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
    statSub: { fontSize: 10, color: '#dc3545', fontWeight: '700', textTransform: 'uppercase' },
    
    // Chart Styles
    chartCard: { backgroundColor: '#fff', borderRadius: 30, padding: 25, marginBottom: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15 },
    chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    chartTitle: { fontSize: 17, fontWeight: '900', color: '#1a1a1a' },
    legendRow: { flexDirection: 'row', gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: '#6c757d', fontWeight: '700', textTransform: 'uppercase' },
    chartBody: { flexDirection: 'row', height: 200, alignItems: 'center' },
    yAxis: { width: 45, height: 160, justifyContent: 'space-between', paddingRight: 8 },
    axisLabel: { fontSize: 10, color: '#adb5bd', textAlign: 'right', fontWeight: '700' },
    barsArea: { flex: 1, flexDirection: 'row', height: 160, alignItems: 'flex-end', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#f1f3f5' },
    barGroup: { flex: 1, alignItems: 'center' },
    barStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
    bar: { width: 12 },
    barLabel: { fontSize: 10, color: '#6c757d', marginTop: 12, fontWeight: '700' },
    
    analyticsSection: { marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a', marginBottom: 18 },
    analyticsCard: { backgroundColor: '#fff', borderRadius: 24, padding: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 12 },
    analyticsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    analyticsTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
    analyticsItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    analyticsLabel: { fontSize: 14, color: '#6c757d', fontWeight: '700' },
    analyticsValue: { fontSize: 15, color: '#1a1a1a', fontWeight: '900' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    detailsContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    detailsHeader: { marginBottom: 20 },
    detailsBackButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10,
        backgroundColor: '#fff5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#ffe3e3',
        gap: 4
    },
    detailsBackText: { color: '#dc3545', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
    detailsTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', marginLeft: 5 },
    searchSection: { marginBottom: 20 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 55, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
    tableContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    headerCol: { fontSize: 11, fontWeight: '800', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1 },
    tableRow: { flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', alignItems: 'center' },
    rowColText: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
    rowNameText: { fontSize: 15, color: '#1a1a1a', fontWeight: '800' },
    rowTypeText: { fontSize: 12, color: '#6c757d', fontWeight: '500', marginTop: 2 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#adb5bd', fontWeight: '700' },
});

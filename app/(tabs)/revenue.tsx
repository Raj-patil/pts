import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3, Search, Database, Calendar, PieChart } from 'lucide-react-native';
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
                                        <View style={[styles.bar, { height: creditHeight, backgroundColor: '#28a745', borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                                        <View style={[styles.bar, { height: debitHeight, backgroundColor: '#dc3545', borderTopLeftRadius: 4, borderTopRightRadius: 4, marginLeft: 2 }]} />
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
                <TouchableOpacity onPress={() => setViewType('overview')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back to Overview</Text>
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
                <Text style={styles.headerTitle}>Revenue Dashboard</Text>
                <TouchableOpacity onPress={fetchRevenue} style={styles.refreshButton}>
                    <RefreshCw size={20} color="#dc3545" />
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
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 70, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#343a40' },
    refreshButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff5f5', justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 20 },
    mainCard: { borderRadius: 25, overflow: 'hidden', marginBottom: 20, elevation: 8 },
    cardGradient: { padding: 25 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    cardAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 10 },
    cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
    footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { width: (width - 60) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 2 },
    statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 14, fontWeight: '700', color: '#6c757d', marginBottom: 6 },
    statAmount: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
    statSub: { fontSize: 9, color: '#adb5bd', fontWeight: '600' },
    
    // Chart Styles
    chartCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, marginBottom: 25, elevation: 3 },
    chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    chartTitle: { fontSize: 16, fontWeight: '800', color: '#343a40' },
    legendRow: { flexDirection: 'row', gap: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#666', fontWeight: '600' },
    chartBody: { flexDirection: 'row', height: 180, alignItems: 'center' },
    yAxis: { width: 60, height: 150, justifyContent: 'space-between', paddingRight: 8 },
    axisLabel: { fontSize: 10, color: '#999', textAlign: 'right', fontWeight: '700' },
    barsArea: { flex: 1, flexDirection: 'row', height: 150, alignItems: 'flex-end', justifyContent: 'space-around', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
    barGroup: { alignItems: 'center', width: 35 },
    barStack: { flexDirection: 'row', alignItems: 'flex-end' },
    bar: { width: 10 },
    barLabel: { fontSize: 10, color: '#666', marginTop: 8, fontWeight: '600' },
    
    analyticsSection: { marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#343a40', marginBottom: 15 },
    analyticsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2 },
    analyticsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    analyticsTitle: { fontSize: 15, fontWeight: '700', color: '#343a40' },
    analyticsItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    analyticsLabel: { fontSize: 14, color: '#6c757d', fontWeight: '600' },
    analyticsValue: { fontSize: 14, color: '#212529', fontWeight: '800' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    detailsContainer: { flex: 1, padding: 20 },
    detailsHeader: { marginBottom: 20 },
    backButton: { marginBottom: 10 },
    backButtonText: { color: '#dc3545', fontWeight: '700', fontSize: 14 },
    detailsTitle: { fontSize: 24, fontWeight: '900', color: '#343a40' },
    searchSection: { marginBottom: 15 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e9ecef', height: 50 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#343a40' },
    tableContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2, marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#e9ecef', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
    headerCol: { fontSize: 12, fontWeight: '800', color: '#495057', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', alignItems: 'center' },
    rowColText: { fontSize: 14, color: '#343a40', fontWeight: '500' },
    rowNameText: { fontSize: 15, color: '#343a40', fontWeight: '700' },
    rowTypeText: { fontSize: 12, color: '#6c757d' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#adb5bd', fontWeight: '600' },
});

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, ClipboardList, Database, Save, Table as TableIcon, Calendar, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
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
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const API_URL = Platform.OS === 'web' ? 'http://localhost:5001/api' : 'http://192.168.0.67:5001/api';

type ExpenseEntry = {
    id: number;
    expense_date: string;
    paid_to: string;
    amount: string | number;
    created_at?: string;
};

export default function ExpensesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'entry' | 'tracker'>('entry');

    // Form State
    const [paidTo, setPaidTo] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date()); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tracker State
    const [expensesData, setExpensesData] = useState<ExpenseEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchExpensesData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/expenses`);
            const data = await response.json();
            setExpensesData(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchExpensesData();
        }, [])
    );

    const handleSubmit = async () => {
        if (!paidTo.trim()) {
            Alert.alert('Error', 'Please enter recipient name');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid Amount');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expense_date: date.toISOString().split('T')[0],
                    paid_to: paidTo,
                    amount: parseFloat(amount),
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Expense saved successfully');
                setPaidTo('');
                setAmount('');
                setDate(new Date());
                fetchExpensesData();
                setActiveTab('tracker');
            } else {
                Alert.alert('Error', 'Failed to save expense');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredExpenses = expensesData.filter(item => 
        (item.paid_to || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderEntryForm = () => (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Date</Text>
                <TouchableOpacity 
                    style={[styles.input, { justifyContent: 'center' }]} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16 }}>{date.toLocaleDateString()}</Text>
                        <Calendar size={20} color="#6c757d" />
                    </View>
                </TouchableOpacity>

                {showDatePicker && (
                    Platform.OS === 'web' ? (
                        <Modal transparent visible={showDatePicker} animationType="fade">
                            <TouchableOpacity style={styles.webModalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                                <View style={styles.webCalendarContainer}>
                                    <View style={styles.webCalendarHeader}>
                                        <Text style={styles.webCalendarYear}>{date.getFullYear()}</Text>
                                        <Text style={styles.webCalendarDate}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                    </View>
                                    <View style={styles.webCalendarBody}>
                                        <View style={styles.monthNav}>
                                            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>
                                                <ChevronLeftIcon size={20} color="#555" />
                                            </TouchableOpacity>
                                            <Text style={styles.monthYearText}>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                                            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>
                                                <ChevronRightIcon size={20} color="#555" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.weekDaysRow}>
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={i} style={styles.weekDayText}>{day}</Text>)}
                                        </View>
                                        <View style={styles.daysGrid}>
                                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <View key={`empty-${i}`} style={styles.dayCell} />)}
                                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                const day = i + 1;
                                                const curr = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                                const isSelected = date.toDateString() === curr.toDateString();
                                                return (
                                                    <TouchableOpacity key={day} style={[styles.dayCell, isSelected && styles.selectedDayCell]} onPress={() => { setDate(curr); }}>
                                                        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        <View style={styles.webModalFooter}>
                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.footerButtonText}>OK</Text></TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    ) : (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Paid To</Text>
                <TextInput
                    style={styles.input}
                    value={paidTo}
                    onChangeText={setPaidTo}
                    placeholder="Enter Recipient Name"
                    placeholderTextColor="#adb5bd"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#adb5bd"
                />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                <LinearGradient colors={['#dc3545', '#9b1b28']} style={styles.submitGradient}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>Save Expense</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderTracker = () => {
        const totalAmount = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0);
        
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.searchSection}>
                    <View style={styles.searchWrapper}>
                        <Search size={20} color="#adb5bd" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#adb5bd"
                        />
                    </View>
                </View>

                {/* Expenses Analytics Summary Card */}
                <View style={styles.expenseSummaryCard}>
                    <LinearGradient colors={['#dc3545', '#9b1b28']} style={styles.summaryGradient}>
                        <View style={styles.summaryHeader}>
                            <View style={styles.summaryIconBox}>
                                <Database size={18} color="#dc3545" />
                            </View>
                            <Text style={styles.summaryLabel}>Total Expenses</Text>
                        </View>
                        <Text style={styles.summaryAmount}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                        <Text style={styles.summarySub}>Total from {filteredExpenses.length} transactions</Text>
                    </LinearGradient>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCol, { flex: 1.5 }]}>Date</Text>
                        <Text style={[styles.headerCol, { flex: 2.5 }]}>Paid To</Text>
                        <Text style={[styles.headerCol, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
                    </View>
                    {isLoading ? (
                        <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#dc3545" /></View>
                    ) : (
                        <FlatList
                            data={filteredExpenses}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.tableRow}>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={styles.rowColText}>{new Date(item.expense_date).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.rowColText, { flex: 2.5 }]} numberOfLines={1}>{item.paid_to}</Text>
                                    <Text style={[styles.rowColText, { flex: 1.5, textAlign: 'right', fontWeight: '800', color: '#dc3545' }]}>₹{parseFloat(item.amount.toString()).toLocaleString()}</Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Database size={48} color="#dee2e6" />
                                    <Text style={styles.emptyText}>No expenses found</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Expenses</Text>
                    <Text style={styles.headerSub}>Manage your spending</Text>
                </View>
                <View style={styles.headerIcon}>
                    <ClipboardList size={22} color="#dc3545" />
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'entry' && styles.activeTab]} 
                        onPress={() => setActiveTab('entry')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'entry' && styles.activeTabText]}>New Entry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'tracker' && styles.activeTab]} 
                        onPress={() => setActiveTab('tracker')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'tracker' && styles.activeTabText]}>Tracker</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {activeTab === 'entry' ? renderEntryForm() : renderTracker()}
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
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffe3e3',
    },
    tabsContainer: { 
        paddingHorizontal: 20, 
        paddingTop: 20,
        backgroundColor: '#f1f3f5'
    },
    tabsWrapper: { 
        flexDirection: 'row', 
        backgroundColor: '#e9ecef', 
        padding: 4, 
        borderRadius: 16,
    },
    tab: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 12, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: { 
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: { fontSize: 14, fontWeight: '700', color: '#6c757d' },
    activeTabText: { color: '#1a1a1a' },
    
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    formContainer: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '800', color: '#6c757d', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { 
        backgroundColor: '#fff', 
        height: 60, 
        borderRadius: 16, 
        paddingHorizontal: 18, 
        fontSize: 16, 
        borderWidth: 1, 
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        color: '#1a1a1a',
        fontWeight: '600'
    },
    submitButton: { marginTop: 15, marginBottom: 40, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#dc3545', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 },
    submitGradient: { height: 65, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    
    searchSection: { marginBottom: 20 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 55, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
    
    tableContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    headerCol: { fontSize: 11, fontWeight: '800', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1 },
    tableRow: { flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', alignItems: 'center' },
    rowColText: { fontSize: 13, color: '#1a1a1a', fontWeight: '600' },
    
    // Summary Card Styles
    expenseSummaryCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20, elevation: 8, shadowColor: '#dc3545', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 },
    summaryGradient: { padding: 20 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    summaryIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryAmount: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 6 },
    summarySub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#adb5bd', fontWeight: '700' },
    
    webModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    webCalendarContainer: { backgroundColor: '#fff', borderRadius: 20, width: 340, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25 },
    webCalendarHeader: { backgroundColor: '#dc3545', padding: 25 },
    webCalendarYear: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
    webCalendarDate: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 8 },
    webCalendarBody: { padding: 20 },
    monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingHorizontal: 5 },
    monthYearText: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
    weekDaysRow: { flexDirection: 'row', marginBottom: 15 },
    weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#adb5bd', fontWeight: '800' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: `${100 / 7}%`, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    selectedDayCell: { backgroundColor: '#dc3545' },
    dayText: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
    selectedDayText: { color: '#fff', fontWeight: '900' },
    webModalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, paddingRight: 15 },
    footerButtonText: { color: '#dc3545', fontWeight: '900', fontSize: 15, paddingHorizontal: 20, paddingVertical: 10 }
});

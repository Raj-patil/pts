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

    const renderTracker = () => (
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
                                <Text style={[styles.rowColText, { flex: 1.5 }]}>{new Date(item.expense_date).toLocaleDateString()}</Text>
                                <Text style={[styles.rowColText, { flex: 2.5 }]} numberOfLines={1}>{item.paid_to}</Text>
                                <Text style={[styles.rowColText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: '#dc3545' }]}>₹{item.amount}</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Expense Management</Text>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'entry' && styles.activeTab]} onPress={() => setActiveTab('entry')}>
                    <ClipboardList size={20} color={activeTab === 'entry' ? '#dc3545' : '#6c757d'} />
                    <Text style={[styles.tabText, activeTab === 'entry' && styles.activeTabText]}>Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'tracker' && styles.activeTab]} onPress={() => setActiveTab('tracker')}>
                    <TableIcon size={20} color={activeTab === 'tracker' ? '#dc3545' : '#6c757d'} />
                    <Text style={[styles.tabText, activeTab === 'tracker' && styles.activeTabText]}>Tracker</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'entry' ? renderEntryForm() : renderTracker()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { height: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#343a40' },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginHorizontal: 20, marginTop: 20, borderRadius: 15, elevation: 2 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
    activeTab: { backgroundColor: 'rgba(220, 53, 69, 0.1)' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#6c757d' },
    activeTabText: { color: '#dc3545' },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    formContainer: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#495057', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#fff', height: 55, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#e9ecef' },
    submitButton: { marginTop: 10, marginBottom: 40, borderRadius: 15, overflow: 'hidden', elevation: 5 },
    submitGradient: { height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    searchSection: { marginBottom: 15 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e9ecef', height: 50 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#343a40' },
    tableContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2, marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#e9ecef', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
    headerCol: { fontSize: 12, fontWeight: '800', color: '#495057', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', alignItems: 'center' },
    rowColText: { fontSize: 14, color: '#343a40', fontWeight: '500' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#adb5bd', fontWeight: '600' },
    webModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    webCalendarContainer: { backgroundColor: '#fff', borderRadius: 8, width: 320, overflow: 'hidden' },
    webCalendarHeader: { backgroundColor: '#dc3545', padding: 20 },
    webCalendarYear: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    webCalendarDate: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 5 },
    webCalendarBody: { padding: 15 },
    monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
    monthYearText: { fontSize: 14, fontWeight: '700', color: '#333' },
    weekDaysRow: { flexDirection: 'row', marginBottom: 10 },
    weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#757575', fontWeight: '600' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: `${100 / 7}%`, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 19 },
    selectedDayCell: { backgroundColor: '#dc3545' },
    dayText: { fontSize: 13, color: '#333' },
    selectedDayText: { color: '#fff', fontWeight: '700' },
    webModalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingRight: 10 },
    footerButtonText: { color: '#dc3545', fontWeight: '700', fontSize: 14, padding: 10 }
});

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ClipboardList, Database, Save, Table as TableIcon, Calendar } from 'lucide-react-native';
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

type TinEntry = {
    id: number;
    name: string;
    quantity: string | number;
    price: string | number;
    total_amount: string | number;
    status: 'Cash in' | 'Cash out';
    tin_type: string;
    entry_date: string;
    created_at?: string;
};

export default function TinDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<'entry' | 'data'>('entry');

    // Form State
    const [name, setName] = useState('');
    const [tinType, setTinType] = useState((params.name as string) || '');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [totalAmount, setTotalAmount] = useState('0');
    const [status, setStatus] = useState<'Cash in' | 'Cash out'>('Cash in');
    const [date, setDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date()); // For navigating month in calendar
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [tinData, setTinData] = useState<TinEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data whenever focused or tab changes
    const fetchTinData = async () => {
        setIsLoading(true);
        try {
            // Fetch by Tin Type if available
            const url = tinType ? `${API_URL}/tins?tin_type=${encodeURIComponent(tinType)}` : `${API_URL}/tins`;
            const response = await fetch(url);
            const data = await response.json();
            setTinData(data);
        } catch (error) {
            console.error('Fetch error:', error);
            // Alert.alert('Error', 'Failed to fetch tin data');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh when focused
    useFocusEffect(
        React.useCallback(() => {
            if (activeTab === 'data') {
                fetchTinData();
            }
        }, [activeTab, tinType])
    );

    // Sync state with navigation parameters
    useEffect(() => {
        if (params.name) {
            setTinType(params.name as string);
            setName(''); // Ensure name is empty
            setActiveTab('entry');
        }
    }, [params.name]);

    // Auto-calculate total amount
    useEffect(() => {
        const qty = parseFloat(quantity) || 0;
        const prc = parseFloat(price) || 0;
        setTotalAmount((qty * prc).toFixed(2));
    }, [quantity, price]);



    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a Name');
            return;
        }
        if (!quantity || parseFloat(quantity) <= 0) {
            Alert.alert('Error', 'Please enter a valid Quantity');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            Alert.alert('Error', 'Please enter a valid Price');
            return;
        }
        if (!status) {
            Alert.alert('Error', 'Please select a Status');
            return;
        }
        if (!date) {
            Alert.alert('Error', 'Please select a Date');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/tins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    tin_type: tinType,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price),
                    total_amount: parseFloat(totalAmount),
                    status,
                    entry_date: (date instanceof Date && !isNaN(date.getTime()) ? date : new Date()).toISOString().split('T')[0],
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Entry saved successfully');
                // Reset form except name
                setQuantity('');
                setPrice('');
                setStatus('Cash in');
                setDate(new Date()); // Reset to today
                // Refresh data
                fetchTinData();
                // Switch to data tab
                setActiveTab('data');
            } else {
                Alert.alert('Error', 'Failed to save entry');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderEntryForm = () => (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Tin Type</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={tinType}
                    editable={false}
                    placeholder="Tin Type"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter Name"
                    placeholderTextColor="#adb5bd"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#adb5bd"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                        style={styles.input}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#adb5bd"
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Date</Text>
                <TouchableOpacity 
                    style={[styles.input, { justifyContent: 'center' }]} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16 }}>{date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Select Date'}</Text>
                        <Calendar size={20} color="#6c757d" />
                    </View>
                </TouchableOpacity>

                {showDatePicker && (
                    Platform.OS === 'web' ? (
                        <Modal
                            transparent={true}
                            visible={showDatePicker}
                            animationType="fade"
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <TouchableOpacity 
                                style={styles.webModalOverlay} 
                                activeOpacity={1} 
                                onPress={() => setShowDatePicker(false)}
                            >
                                <View style={styles.webCalendarContainer}>
                                    <View style={styles.webCalendarHeader}>
                                        <Text style={styles.webCalendarYear}>{date.getFullYear()}</Text>
                                        <Text style={styles.webCalendarDate}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.webCalendarBody}>
                                        <View style={styles.monthNav}>
                                            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>
                                                <ChevronLeftIcon size={20} color="#555" />
                                            </TouchableOpacity>
                                            <Text style={styles.monthYearText}>
                                                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </Text>
                                            <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>
                                                <ChevronRightIcon size={20} color="#555" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.weekDaysRow}>
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                <Text key={i} style={styles.weekDayText}>{day}</Text>
                                            ))}
                                        </View>

                                        <View style={styles.daysGrid}>
                                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => (
                                                <View key={`empty-${i}`} style={styles.dayCell} />
                                            ))}
                                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                const day = i + 1;
                                                const isSelected = date.getDate() === day && date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear();
                                                return (
                                                    <TouchableOpacity 
                                                        key={day} 
                                                        style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                                                        onPress={() => {
                                                            const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                                            setDate(newDate);
                                                        }}
                                                    >
                                                        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <View style={styles.webModalFooter}>
                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                <Text style={styles.footerButtonText}>CANCEL</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                <Text style={styles.footerButtonText}>OK</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    ) : (
                        <DateTimePicker
                            value={date instanceof Date && !isNaN(date.getTime()) ? date : new Date()}
                            mode="date"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Amount</Text>
                <View style={[styles.input, styles.disabledInput]}>
                    <Text style={styles.disabledInputText}>₹ {totalAmount}</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        style={[styles.statusOption, status === 'Cash in' && styles.statusActiveInward]}
                        onPress={() => setStatus('Cash in')}
                    >
                        <Text style={[styles.statusText, status === 'Cash in' && styles.statusTextActive]}>Cash in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusOption, status === 'Cash out' && styles.statusActiveOutward]}
                        onPress={() => setStatus('Cash out')}
                    >
                        <Text style={[styles.statusText, status === 'Cash out' && styles.statusTextActive]}>Cash out</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <LinearGradient
                    colors={['#dc3545', '#9b1b28']}
                    style={styles.submitGradient}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>Submit Entry</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderTinData = () => (
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
                <Text style={[styles.headerCol, { flex: 2 }]}>Type</Text>
                <Text style={[styles.headerCol, { flex: 2 }]}>Name</Text>
                <Text style={[styles.headerCol, { flex: 1.5, textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.headerCol, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
                <Text style={[styles.headerCol, { flex: 1.8, textAlign: 'right' }]}>Total</Text>
                <Text style={[styles.headerCol, { flex: 1.8, textAlign: 'center' }]}>Status</Text>
            </View>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#dc3545" />
                </View>
            ) : (
                <FlatList
                    data={tinData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.tableRow}>
                            <Text style={[styles.rowColText, { flex: 2 }]} numberOfLines={1}>{item.tin_type}</Text>
                            <Text style={[styles.rowColText, { flex: 2 }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.rowColText, { flex: 1.5, textAlign: 'center' }]}>
                                {new Date(item.entry_date).toLocaleDateString()}
                            </Text>
                            <Text style={[styles.rowColText, { flex: 0.8, textAlign: 'center' }]}>{item.quantity}</Text>
                            <Text style={[styles.rowColText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>₹{item.total_amount}</Text>
                            <View style={[styles.rowCol, { flex: 1.8, alignItems: 'center' }]}>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'Cash in' ? styles.inwardBadge : styles.outwardBadge
                                ]}>
                                    <Text style={[
                                        styles.statusBadgeText,
                                        item.status === 'Cash in' ? styles.inwardText : styles.outwardText
                                    ]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Database size={48} color="#dee2e6" />
                            <Text style={styles.emptyText}>No entries found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#343a40" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tin Management</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'entry' && styles.activeTab]}
                    onPress={() => setActiveTab('entry')}
                >
                    <ClipboardList size={20} color={activeTab === 'entry' ? '#dc3545' : '#6c757d'} />
                    <Text style={[styles.tabText, activeTab === 'entry' && styles.activeTabText]}>Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'data' && styles.activeTab]}
                    onPress={() => setActiveTab('data')}
                >
                    <TableIcon size={20} color={activeTab === 'data' ? '#dc3545' : '#6c757d'} />
                    <Text style={[styles.tabText, activeTab === 'data' && styles.activeTabText]}>Tin Data</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'entry' ? renderEntryForm() : renderTinData()}
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
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#343a40',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    activeTab: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#dc3545',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#495057',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        height: 55,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#212529',
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
    },
    disabledInput: {
        backgroundColor: '#f1f3f5',
        justifyContent: 'center',
    },
    disabledInputText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#dc3545',
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        padding: 5,
        gap: 5,
    },
    statusOption: {
        flex: 1,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    statusActiveInward: {
        backgroundColor: '#28a745',
    },
    statusActiveOutward: {
        backgroundColor: '#dc3545',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6c757d',
    },
    statusTextActive: {
        color: '#fff',
    },
    submitButton: {
        marginTop: 10,
        marginBottom: 40,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitGradient: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
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
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    headerCol: {
        fontSize: 10,
        fontWeight: '800',
        color: '#495057',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
        alignItems: 'center',
    },
    rowColText: {
        fontSize: 12,
        color: '#343a40',
        fontWeight: '500',
    },
    rowCol: {
        justifyContent: 'center',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        minWidth: 55,
        alignItems: 'center',
    },
    inwardBadge: {
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
        borderWidth: 1,
    },
    outwardBadge: {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        borderWidth: 1,
    },
    inwardText: {
        color: '#155724',
    },
    outwardText: {
        color: '#721c24',
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '800',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#adb5bd',
        fontWeight: '600',
    },
    webModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    webCalendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: 320,
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    webCalendarHeader: {
        backgroundColor: '#1976d2',
        padding: 20,
    },
    webCalendarYear: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    webCalendarDate: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        marginTop: 5,
    },
    webCalendarBody: {
        padding: 15,
        backgroundColor: '#fff',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    monthYearText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#757575',
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 19,
    },
    selectedDayCell: {
        backgroundColor: '#1976d2',
    },
    dayText: {
        fontSize: 13,
        color: '#333',
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: '700',
    },
    webModalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 20,
        paddingRight: 10,
    },
    footerButtonText: {
        color: '#1976d2',
        fontWeight: '700',
        fontSize: 14,
        padding: 10,
    }
});

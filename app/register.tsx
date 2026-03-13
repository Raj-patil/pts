import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { AtSign, Eye, EyeOff, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Update with your local IP if testing on mobile
const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:5001/api' : 'http://192.168.1.7:5001/api';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async () => {
        console.log('--- Sign Up Attempt ---');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Target API:', `${API_URL}/register`);

        if (!name || !email || !password) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
            });
            console.log('Server Response:', response.data);
            alert('Account created! Please log in.');
            router.push('/');
        } catch (error: any) {
            console.error('Registration Error Details:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error Message:', error.message);
            }
            alert(`Error: ${error.message || 'Registration failed'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#f8f9fa', '#e9ecef']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/pts-logo.jpg')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.welcomeText}>WELCOME TO PTS</Text>
                        <Text style={styles.subText}>Patil Tin Suppliers</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Create New Account</Text>

                        <View style={styles.inputWrapper}>
                            <User size={20} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                placeholderTextColor="#adb5bd"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <AtSign size={20} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#adb5bd"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Lock size={20} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#adb5bd"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#6c757d" />
                                ) : (
                                    <Eye size={20} color="#6c757d" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                            <LinearGradient
                                colors={['#dc3545', '#c82333']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.signUpButtonText}>Sign Up</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.loginText}>Log In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: '#dc3545',
        overflow: 'hidden',
        alignSelf: 'center',
    },
    logo: {
        width: '90%',
        height: '90%',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#343a40',
        letterSpacing: 1,
    },
    subText: {
        fontSize: 16,
        color: '#dc3545',
        fontWeight: '600',
        marginTop: 5,
    },
    titleUnderline: {
        width: 100,
        height: 3,
        backgroundColor: '#343a40',
        marginTop: 10,
        borderRadius: 2,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#343a40',
        textAlign: 'center',
        marginBottom: 25,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 55,
        color: '#212529',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    signUpButton: {
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 20,
    },
    gradientButton: {
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: {
        color: '#6c757d',
        fontSize: 14,
    },
    loginText: {
        color: '#dc3545',
        fontSize: 14,
        fontWeight: '700',
    },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../../context/ThemeContext";

type AuthScreenType = "login" | "register" | "verify" | "recovery";

interface AuthScreensProps {
  // Add props here if needed
}

const LoginForm: React.FC<{ colors: any }> = ({ colors }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = () => {
    // Implement login logic here
    console.log("Login:", { email, password });
  };

  const styles = StyleSheet.create({
    formContainer: {
      width: "100%",
      borderRadius: 20,
      padding: 20,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    logo: {
      width: "40%",
      height: undefined,
      aspectRatio: 1,
      alignSelf: "center",
      marginBottom: 30,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 25,
      textAlign: "center",
      color: colors.text,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 25,
      textAlign: "center",
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 15,
      overflow: "hidden",
      borderRadius: 12,
    },
    gradientButton: {
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    socialButtonsContainer: {
      marginTop: 25,
      flexDirection: "row",
      justifyContent: "center",
      gap: 15,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    forgotPassword: {
      marginTop: 15,
      alignSelf: "flex-end",
    },
    forgotPasswordText: {
      color: "#4A90E2",
      fontSize: 14,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 25,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.textMuted,
      fontSize: 14,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 5,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.formContainer}>
      <Image
        source={{uri: 'https://t3.ftcdn.net/jpg/08/38/58/42/360_F_838584205_dDGwNQ1xJ8GsilZONeQwwM260WoyjNx2.jpg'}}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.formTitle}>Welcome Back!</Text>
      <Text style={styles.description}>Sign in to continue to Estate App</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "email" && styles.inputFocused,
          ]}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View>
          <TextInput
            style={[
              styles.input,
              focusedInput === "password" && styles.inputFocused,
            ]}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 15, top: 15 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="email" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="phone" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RegistrationForm: React.FC<{ colors: any }> = ({ colors }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nin: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Implement registration logic here
    console.log("Register:", formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const styles = StyleSheet.create({
    formContainer: {
      width: "100%",
      borderRadius: 20,
      padding: 20,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 25,
      textAlign: "center",
      color: colors.text,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 25,
      textAlign: "center",
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 15,
      overflow: "hidden",
      borderRadius: 12,
    },
    gradientButton: {
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    socialButtonsContainer: {
      marginTop: 25,
      flexDirection: "row",
      justifyContent: "center",
      gap: 15,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 25,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.textMuted,
      fontSize: 14,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 5,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.description}>Fill in your details to get started</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>First Name</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "firstName" && styles.inputFocused,
          ]}
          placeholder="Enter your first name"
          value={formData.firstName}
          onChangeText={(value) => updateField("firstName", value)}
          onFocus={() => setFocusedInput("firstName")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "lastName" && styles.inputFocused,
          ]}
          placeholder="Enter your last name"
          value={formData.lastName}
          onChangeText={(value) => updateField("lastName", value)}
          onFocus={() => setFocusedInput("lastName")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "dateOfBirth" && styles.inputFocused,
          ]}
          placeholder="DD/MM/YYYY"
          value={formData.dateOfBirth}
          onChangeText={(value) => updateField("dateOfBirth", value)}
          onFocus={() => setFocusedInput("dateOfBirth")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "gender" && styles.inputFocused,
          ]}
          placeholder="Enter your gender"
          value={formData.gender}
          onChangeText={(value) => updateField("gender", value)}
          onFocus={() => setFocusedInput("gender")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>National ID Number (NIN)</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "nin" && styles.inputFocused,
          ]}
          placeholder="Enter your NIN"
          value={formData.nin}
          onChangeText={(value) => updateField("nin", value)}
          onFocus={() => setFocusedInput("nin")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Contact Number</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "contact" && styles.inputFocused,
          ]}
          placeholder="Enter your phone number"
          value={formData.contact}
          onChangeText={(value) => updateField("contact", value)}
          keyboardType="phone-pad"
          onFocus={() => setFocusedInput("contact")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "email" && styles.inputFocused,
          ]}
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View>
          <TextInput
            style={[
              styles.input,
              focusedInput === "password" && styles.inputFocused,
            ]}
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(value) => updateField("password", value)}
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 15, top: 15 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View>
          <TextInput
            style={[
              styles.input,
              focusedInput === "confirmPassword" && styles.inputFocused,
            ]}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField("confirmPassword", value)}
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setFocusedInput("confirmPassword")}
            onBlur={() => setFocusedInput(null)}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 15, top: 15 }}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialIcons
              name={showConfirmPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or sign up with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="mail" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="phone" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmailVerificationForm: React.FC<{ colors: any }> = ({ colors }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleVerification = () => {
    // Implement verification logic here
    console.log("Verify:", { verificationCode });
  };

  const handleResendCode = () => {
    // Implement resend code logic here
    console.log("Resending verification code");
  };

  const styles = StyleSheet.create({
    formContainer: {
      width: "100%",
      borderRadius: 20,
      padding: 20,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 25,
      textAlign: "center",
      color: colors.text,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 25,
      textAlign: "center",
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 15,
      overflow: "hidden",
      borderRadius: 12,
    },
    gradientButton: {
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.formContainer}>
      <MaterialIcons name="verified-user" size={60} color="#4A90E2" style={{ alignSelf: 'center', marginBottom: 20 }} />
      <Text style={styles.formTitle}>Verify Your Email</Text>
      <Text style={styles.description}>
        We have sent a verification code to your email address. Please enter the code below to verify your account.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Verification Code</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "verificationCode" && styles.inputFocused,
          ]}
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          onFocus={() => setFocusedInput("verificationCode")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerification}>
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Verify Email</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20, alignItems: 'center' }} 
        onPress={handleResendCode}
      >
        <Text style={{ color: "#4A90E2", fontSize: 14 }}>
          Didn't receive the code? Resend
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const AccountRecoveryForm: React.FC<{ colors: any }> = ({ colors }) => {
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { colors: themeColors } = useTheme();

  const handleRecovery = () => {
    // Implement recovery logic here
    console.log("Recover:", { email });
  };

  const styles = StyleSheet.create({
    formContainer: {
      width: "100%",
      borderRadius: 20,
      padding: 20,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 25,
      textAlign: "center",
      color: colors.text,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 25,
      textAlign: "center",
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.background,
      padding: 15,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 15,
      overflow: "hidden",
      borderRadius: 12,
    },
    gradientButton: {
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 25,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.textMuted,
      fontSize: 14,
    },
  });

  return (
    <View style={styles.formContainer}>
      <MaterialIcons name="lock-outline" size={60} color={themeColors.text} style={{ alignSelf: 'center', marginBottom: 20 }} />
      <Text style={styles.formTitle}>Reset Password</Text>
      <Text style={styles.description}>
        Don't worry! It happens. Please enter the email address associated with your account.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "email" && styles.inputFocused,
          ]}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRecovery}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={{ marginTop: 10, alignItems: 'center' }} 
        onPress={() => {/* Handle navigation to login */}}
      >
        <Text style={{ color: "#4A90E2", fontSize: 14 }}>
          Remember your password? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const AuthScreens: React.FC<AuthScreensProps> = () => {
  const [activeScreen, setActiveScreen] = useState<AuthScreenType>("login");
  const { colors } = useTheme();
  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 30,
      borderRadius: 15,
      padding: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 12,
      marginHorizontal: 4,
    },
    tabText: {
      fontSize: 15,
      fontWeight: "600",
    },
  });

  const renderForm = () => {
    switch (activeScreen) {
      case "login":
        return <LoginForm colors={colors} />;
      case "register":
        return <RegistrationForm colors={colors} />;
      case "verify":
        return <EmailVerificationForm colors={colors} />;
      case "recovery":
        return <AccountRecoveryForm colors={colors} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.tabContainer,{backgroundColor:colors.card}]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeScreen === "login" && { backgroundColor: colors.text }
                
              ]}
              onPress={() => setActiveScreen("login")}
            >
              <Text style={[styles.tabText,{color: activeScreen === "login" ? colors.card : colors.text}]} >Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeScreen === "register" && { backgroundColor: colors.text },
              ]}
              onPress={() => setActiveScreen("register")}
            >
              <Text style={[styles.tabText,{color: activeScreen === "register" ? colors.card : colors.text}]} >Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeScreen === "recovery" && { backgroundColor: colors.text },
              ]}
              onPress={() => setActiveScreen("recovery")}
            >
              <Text style={[styles.tabText,{color: activeScreen === "recovery" ? colors.card : colors.text}]} >Recovery</Text>
            </TouchableOpacity>
          </View>
          {renderForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default AuthScreens;


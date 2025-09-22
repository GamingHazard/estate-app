import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface AccountScreenProps {
  // Add props here if needed
}

const AccountScreen: React.FC<AccountScreenProps> = () => {
  const { colors, theme } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{color:"lightgrey", fontSize: 20, fontWeight: 'bold',marginVertical:10}}>Profile</Text>
      <View
        style={{width: '100%' ,borderRadius:8,backgroundColor:colors.card,padding:10}}
      >
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Personal Information</Text>
        <Text style={{ color:theme==="dark"?"white":"black", marginTop: 10 }}>Full Name</Text>
        <Text style={{ color: colors.textMuted, marginTop: 5,fontSize:16 }}>User Name</Text>
        
        <Text style={{ color:theme==="dark"?"white":"black", marginTop: 10 }}>Email</Text>
        <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
          <Text style={{ color: colors.textMuted, fontSize: 16, marginRight: 10 }}>User Email </Text>
          <Text style={{ backgroundColor: 'lightpink', color: 'red', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, zIndex: 1 }}>Not-Verified</Text>
        </View>
        
        <Text style={{ color:theme==="dark"?"white":"black", marginTop: 10 }}>Date of Birth</Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>User DOB</Text>
        
        <Text style={{ color:theme==="dark"?"white":"black", marginTop: 10 }}>Gender</Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>User Gender</Text>
        
        <Text style={{ color:theme==="dark"?"white":"black", marginTop: 10 }}>NIN</Text>
        <Text style={{ color: colors.textMuted, marginTop: 5,fontSize:16 }}>User NIN</Text>

        

      </View>

      {/* Security */}
      <Text style={{color:"lightgrey", fontSize: 20, fontWeight: 'bold',marginVertical:10}}>Security</Text>
      <View
        style={{width: '100%' ,borderRadius:8,backgroundColor:colors.card,padding:10}}
      >
      <Text style={{color:colors.text, fontSize: 20, fontWeight: 'bold'}}>Change Password</Text>
        <TextInput style={[styles.input,{ backgroundColor: colors.background,color:colors.text }]} placeholder="Enter old-password" placeholderTextColor={colors.textMuted}/>
        <TextInput style={[styles.input,{ backgroundColor: colors.background,color:colors.text }]} placeholder="Enter new-password" placeholderTextColor={colors.textMuted}/>
        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text }]} placeholder="confirm-password" placeholderTextColor={colors.textMuted}  />
        
        <TouchableOpacity style={{marginTop:10,backgroundColor:colors.bg,padding:10,borderRadius:8,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
          <Text style={{color:"white",fontWeight:'bold'}}>Update Password</Text>
        </TouchableOpacity>

      </View>

      {/* Delete account */}
      <Text style={{color:"lightpink", fontSize: 20, fontWeight: 'bold',marginVertical:10}}>Danger Zone</Text>
      <View
        style={{width: '100%' ,borderRadius:8,backgroundColor:"lightpink",padding:10}}
      >
      <Text style={{color:"crimson", fontSize: 20, fontWeight: 'bold'}}>Delete Account</Text>
         

        <Text style={{ color: "crimson", marginTop: 10 }}>
          Once you delete your account, there is no going back. Please be certain.<Text style={{fontWeight:'bold'}}>This action is irreversible!</Text></Text>  
        <TextInput style={[styles.input, { backgroundColor: "pink", color: colors.text }]} placeholder="confirm-with-password" placeholderTextColor={"crimson"}  />
        
        <TouchableOpacity style={{marginTop:10,backgroundColor:"crimson",padding:10,borderRadius:8,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
          <Text style={{color:"pink",fontWeight:'bold'}}>Delete Account</Text>
        </TouchableOpacity>

      </View>
               <View style={{ height: 40 }} />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  
  },
  input: {
    width: '100%',
    height: 40,
    borderRadius: 8, marginVertical: 10,
    paddingHorizontal:6
  }
});

export default AccountScreen;

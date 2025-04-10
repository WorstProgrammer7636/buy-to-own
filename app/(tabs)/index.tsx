import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import RatingIcon from '../../components/RatingIcon';
import type { ViewStyle } from 'react-native';

const BASE_URL = 'http://172.20.10.11:8000'; // Replace with your current local IP

export default function HomeScreen() {
  const [images, setImages] = useState<string[]>([]);
  type AnalysisItem = {
    message: string;
    rating: string;
    reason: string;
    suggestion?: string;
  };
  
  const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [step, setStep] = useState(0);

  const analyzeWithAPI = async (uri: string) => {
    setIsLoading(true);
    setAnalysis([]);
    setStep(0);
    setShowMessages(false);

    const formData = new FormData();
    formData.append('files', {
      uri,
      name: 'screenshot.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await axios.post(`${BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200 && Array.isArray(res.data.analysis)) {
        setAnalysis(res.data.analysis);
      } else {
        Alert.alert('Error', 'Unexpected response from server.');
      }
    } catch (err: any) {
      console.error('❌ API error:', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImages([uri]);
        analyzeWithAPI(uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not access gallery.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 RizzRanked</Text>

      <Button title="📁 Upload Screenshot" onPress={pickImage} />

      <ScrollView style={styles.imageContainer} contentContainerStyle={{ alignItems: 'center' }}>
        {images.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 30 }} color="#007aff" />}

      {!isLoading && analysis.length > 0 && !showMessages && (
        <Button title="Start Analysis" onPress={() => setShowMessages(true)} />
      )}

      {!isLoading && showMessages && (
        <View style={{ marginTop: 20, flex: 1 }}>
          <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {analysis.slice(0, step + 1).map((msg: any, i: number) => (
              <View key={i} style={msgBubbleStyle(i % 2 === 0)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: i % 2 === 0 ? '#fff' : '#000', fontSize: 16 }}>{msg.message}</Text>
                  {i % 2 === 0 && <RatingIcon rating={msg.rating} />}
                </View>
                {i % 2 === 0 && (
                  <Text style={styles.reasonText}>
                    🧠 {msg.reason}
                    {msg.suggestion && `\n✨ ${msg.suggestion}`}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.navButtons}>
            <TouchableOpacity onPress={() => setStep((s) => Math.max(s - 1, 0))}>
              <Text style={styles.navText}>⬅️ Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep((s) => Math.min(s + 1, analysis.length - 1))}>
              <Text style={styles.navText}>Next ➡️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  imageContainer: { marginTop: 20, maxHeight: 250 },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navText: { fontSize: 18, fontWeight: '600', color: '#007aff' },
  reasonText: { color: '#ccc', marginTop: 6, fontSize: 13 },
});

const msgBubbleStyle = (isUser: boolean): ViewStyle => {
  return {
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? '#007aff' : '#e5e5ea',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 18,
    maxWidth: '75%' as any,  // 👈 this fixes the TypeScript complaint
  };
};

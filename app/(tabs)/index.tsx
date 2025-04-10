import React, { useState } from 'react';
import { View, Text, Button, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function HomeScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWithAPI = async (uri: string) => {
    setIsLoading(true);
    setAnalysis([]);

    const formData = new FormData();
    formData.append('files', {
      uri: uri,
      name: 'screenshot.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await axios.post('http://10.191.19.99:8000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //problem here
      if (res.status === 200) {
        setAnalysis(res.data.analysis); // assumes your backend returns structured list
      } else {
        Alert.alert('Error', `Status: ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
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
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        📸 RizzRanked – Real GPT
      </Text>

      <Button title="Upload Image from Phone" onPress={pickImage} />

      <ScrollView style={{ maxHeight: 300, marginTop: 20 }} contentContainerStyle={{ alignItems: 'center' }}>
        {images.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: '100%', height: 200, marginBottom: 10, borderRadius: 10 }}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <ScrollView style={{ marginTop: 20 }} contentContainerStyle={{ paddingBottom: 60 }}>
  {analysis.length > 0 && (
    <View>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
        📊 RizzRanked Analysis
      </Text>

      {analysis.map((item, i) => (
        <View
          key={i}
          style={{
            backgroundColor: '#f5f5f5',
            padding: 15,
            borderRadius: 10,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor:
              item.rating === 'Brilliant' ? '#4CAF50' :
              item.rating === 'Excellent' ? '#8BC34A' :
              item.rating === 'Good' ? '#CDDC39' :
              item.rating === 'Inaccuracy' ? '#FFC107' :
              item.rating === 'Mistake' ? '#FF9800' :
              item.rating === 'Blunder' ? '#F44336' :
              '#999'
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>💬 {item.message}</Text>
          <Text style={{ marginBottom: 2 }}>🔎 <Text style={{ fontWeight: 'bold' }}>{item.rating}</Text></Text>
          <Text style={{ marginBottom: 2 }}>🧠 {item.reason}</Text>
          {item.suggestion && (
            <Text>✨ <Text style={{ fontStyle: 'italic' }}>{item.suggestion}</Text></Text>
          )}
        </View>
      ))}
    </View>
  )}
</ScrollView>


    </View>
  );
}

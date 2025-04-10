import React, { useState } from 'react';
import { View, Text, Button, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function HomeScreen() {
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
      setAnalysis('');
    }
  };

  const analyzeImages = async () => {
    try {
      setIsLoading(true);
      setAnalysis('');

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('files', {
          uri: image.uri,
          name: `image${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      const res = await axios.post('http://192.168.1.124:8000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        setAnalysis(res.data.analysis.join('\n\n'));
      } else {
        setAnalysis(`Error: ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>📸 RizzRanked</Text>

      <Button title="Upload Conversation Screenshots" onPress={pickImages} />

      <ScrollView style={{ marginVertical: 20 }} contentContainerStyle={{ alignItems: 'center' }}>
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img.uri }}
            style={{ width: '100%', height: 200, marginBottom: 10 }}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {images.length > 0 && (
        <Button
          title={isLoading ? 'Analyzing...' : 'Analyze with GPT'}
          onPress={analyzeImages}
          disabled={isLoading}
        />
      )}

      {analysis !== '' && (
        <ScrollView style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, lineHeight: 24 }}>{analysis}</Text>
        </ScrollView>
      )}
    </View>
  );
}

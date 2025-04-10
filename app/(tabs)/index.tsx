import React, { useState } from 'react';
import { View, Text, Button, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const fakeFeedback = [
  {
    message: '“yo what u doing later”',
    rating: 'Mistake',
    reason: 'Too generic. Missed chance to add flavor.',
    suggestion: '“I got a plan and it involves us. You in?”'
  },
  {
    message: '“haha that’s crazy”',
    rating: 'Blunder',
    reason: 'Didn’t carry the convo.',
    suggestion: 'Ask a follow-up or tease a bit.'
  },
  {
    message: '“that was actually funny ngl”',
    rating: 'Good',
    reason: 'Genuine response, but could go further.',
    suggestion: '“You gotta teach me that energy 😅”'
  }
];

export default function HomeScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true, // safe even if not supported yet
      });

      if (!result.canceled && result.assets.length > 0) {
        setImages(result.assets.map((asset) => asset.uri));
        setAnalysis([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not access gallery.');
    }
  };

  const handleAnalyze = () => {
    if (images.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis(fakeFeedback);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        📸 RizzRanked – Upload & Simulate
      </Text>

      <Button title="Upload Images from Phone" onPress={pickImage} />

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

      {images.length > 0 && (
        <Button title={isLoading ? 'Analyzing...' : 'Analyze These'} onPress={handleAnalyze} disabled={isLoading} />
      )}

      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {analysis.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>📊 GPT-Style Feedback</Text>
          <ScrollView>
            {analysis.map((item, i) => (
              <View key={i} style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>💬 {item.message}</Text>
                <Text>🔎 Rating: {item.rating}</Text>
                <Text>🧠 Reason: {item.reason}</Text>
                <Text>✨ Suggestion: {item.suggestion}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

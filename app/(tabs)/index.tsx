import React, { useState } from 'react';
import { View, Text, Button, Image, ScrollView } from 'react-native';

export default function HomeScreen() {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAnalysis(
        `🎯 Message 1: "wyd tonight"\nRating: Inaccuracy\nSuggestion: Be more intentional.\n\n` +
        `💬 Message 2: "u free this weekend?"\nRating: Good\nSuggestion: Add a flirty twist.`
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        💸 RizzRanked
      </Text>

      <Image
        source={{ uri: 'https://i.imgur.com/AItCxSs.png' }} // placeholder meme image
        style={{ width: '100%', height: 220, borderRadius: 12, marginBottom: 20 }}
        resizeMode="contain"
      />

      <Button title={isLoading ? 'Analyzing...' : 'Analyze Conversation'} onPress={simulateAnalysis} disabled={isLoading} />
      

      {analysis !== '' && (
        <ScrollView style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, lineHeight: 24 }}>{analysis}</Text>
        </ScrollView>
      )}
    </View>
  );
}

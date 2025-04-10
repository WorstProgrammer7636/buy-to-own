// components/RatingIcon.tsx
import React from 'react';
import { Image } from 'react-native';

export const ratingIcons: { [key: string]: any } = {
  Brilliant: require('../assets/brilliant-move.png'),
  Excellent: require('../assets/excellent-move.png'),
  Good: require('../assets/good-move.png'),
  Inaccuracy: require('../assets/inaccuracy.png'),
  Mistake: require('../assets/mistake.png'),
  Blunder: require('../assets/blunder.png'),
};

export default function RatingIcon({ rating }: { rating: string }) {
  if (!ratingIcons[rating]) return null;
  return <Image source={ratingIcons[rating]} style={{ width: 20, height: 20, marginLeft: 6 }} />;
}

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface BackButtonProps {
  tintColor?: string;
  size?: number;
}

export default function BackButton({ tintColor = '#007AFF', size = 24 }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        padding: 8,
        marginRight: 8,
      }}
    >
      <Ionicons
        name="arrow-back"
        size={size}
        color={tintColor}
      />
    </TouchableOpacity>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type CollapsibleProps = {
  children: React.ReactNode;
  title: React.ReactNode | string;
  headerStyle?: any;
};

export function Collapsible({ children, title, headerStyle }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      <TouchableOpacity
        style={[styles.heading, headerStyle]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        {typeof title === 'string' ? (
          <ThemedText style={[styles.headingText, headerStyle && { color: '#FFFFFF' }]}>
            {title}
          </ThemedText>
        ) : (
          title
        )}
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={headerStyle ? '#FFFFFF' : theme === 'light' ? Colors.light.icon : Colors.dark.icon}
        />
      </TouchableOpacity>
      <ThemedView style={[styles.content, { display: isOpen ? 'flex' : 'none' }]}>{children}</ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headingText: {
    // Add any specific styles for the heading text here
  },
  content: {
    marginTop: 6,
  },
});

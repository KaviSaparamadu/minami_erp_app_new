import React from 'react';
import { View, StyleSheet, Text, FlatList, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontFamily, FontSize, Spacing, Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface Suggestion {
  id: string;
  title: string;
  icon: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onSelectSuggestion?: (suggestion: Suggestion) => void;
}

export function SearchSuggestions({
  suggestions,
  onSelectSuggestion = () => {},
}: SearchSuggestionsProps) {
  const { isDarkMode } = useTheme();

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <Pressable
      onPress={() => onSelectSuggestion(item)}
      style={({ pressed }) => [
        styles.suggestionItem,
        isDarkMode && styles.suggestionItemDark,
        pressed && styles.suggestionItemPressed,
      ]}>
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={Colors.primaryHighlight}
        style={styles.icon}
      />
      <Text
        style={[
          styles.suggestionText,
          isDarkMode && styles.suggestionTextDark,
        ]}>
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark,
        ]}>
        Popular Searches
      </Text>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.suggestionsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  suggestionsList: {
    gap: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  suggestionItemDark: {
    backgroundColor: 'transparent',
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
  },
  icon: {
    marginRight: Spacing.md,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: '#FFFFFF',
  },
  suggestionTextDark: {
    color: '#FFFFFF',
  },
});

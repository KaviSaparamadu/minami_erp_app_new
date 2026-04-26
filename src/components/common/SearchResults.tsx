import React from 'react';
import { View, StyleSheet, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontFamily, FontSize, Spacing, Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'record';
  moduleId?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onSelectResult?: () => void;
}

export function SearchResults({
  results,
  isLoading = false,
  onSelectResult = () => {},
}: SearchResultsProps) {
  const { isDarkMode } = useTheme();
  const { navigate } = useNavigation();

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'module') {
      navigate('ModuleDetail', { moduleId: result.moduleId });
    }
    onSelectResult();
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <Pressable
      onPress={() => handleResultPress(item)}
      style={({ pressed }) => [
        styles.resultItem,
        isDarkMode && styles.resultItemDark,
        pressed && styles.resultItemPressed,
      ]}>
      <View style={styles.resultIcon}>
        <MaterialCommunityIcons
          name={item.type === 'module' ? 'puzzle' : 'file-document'}
          size={20}
          color={Colors.primaryHighlight}
        />
      </View>
      <View style={styles.resultContent}>
        <Text
          style={[
            styles.resultTitle,
            isDarkMode && styles.resultTitleDark,
          ]}
          numberOfLines={1}>
          {item.title}
        </Text>
        {item.description && (
          <Text
            style={[
              styles.resultDescription,
              isDarkMode && styles.resultDescriptionDark,
            ]}
            numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={isDarkMode ? '#666' : '#C0C0C0'}
      />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primaryHighlight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.resultCountText,
          isDarkMode && styles.resultCountTextDark,
        ]}>
        Found {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        scrollEnabled={false}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              isDarkMode && styles.separatorDark,
            ]}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  resultCountText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: '#E0E0E0',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  resultCountTextDark: {
    color: '#E0E0E0',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  resultItemDark: {
    backgroundColor: 'transparent',
  },
  resultItemPressed: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultTitleDark: {
    color: '#FFFFFF',
  },
  resultDescription: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: '#E0E0E0',
  },
  resultDescriptionDark: {
    color: '#E0E0E0',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 0,
  },
  separatorDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Spacing } from '../../constants/theme';

interface ModulesGridProps {
  data: any[];
  renderItem: (item: any, width: number) => React.ReactElement;
  cardWidth: number;
  numColumns?: number;
  gap?: number;
  hPad?: number;
}

const GAP = 10;
const H_PAD = 6;
const NUM_COLS = 3;

export function ModulesGrid({
  data,
  renderItem,
  cardWidth,
  numColumns = NUM_COLS,
  gap = GAP,
  hPad = H_PAD,
}: ModulesGridProps) {
  return (
    <FlatList
      key={`grid-${numColumns}`}
      data={data}
      keyExtractor={item => item.id}
      numColumns={numColumns}
      columnWrapperStyle={[styles.row, { gap }]}
      contentContainerStyle={[styles.list, { paddingHorizontal: hPad }]}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => renderItem(item, cardWidth)}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
    marginBottom: GAP,
  },
  list: {
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
});

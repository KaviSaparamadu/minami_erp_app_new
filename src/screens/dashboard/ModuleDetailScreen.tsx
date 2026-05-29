import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { UIIcon } from '../../components/common/UIIcon';
import { MODULE_ICON_MAP } from '../../components/dashboard/ModuleIcon';
import { MODULES } from '../../constants/modules';
import { FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';

interface ModuleDetailScreenProps {
  moduleId?: string;
}

export function ModuleDetailScreen({ moduleId = '' }: ModuleDetailScreenProps) {
  const { isDarkMode } = useTheme();
  const { navigate } = useNavigation();

  const dyn = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);
  const module = MODULES.find(m => m.id === moduleId);

  if (!moduleId || !module) {
    return (
      <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Module not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <SubModuleLayout
        showBack={true}
        parentModuleId={moduleId}
        onModulePress={(target) => navigate('ModuleDetail', { moduleId: target.id })}
      />
    </SafeAreaView>
  );
}

function createDynamicStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#8E8E93',
    textAlign: 'center',
  },

  hero: {
    backgroundColor: '#FFF5F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE0EE',
  },
  heroCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(233,30,99,0.05)',
    top: -60,
    right: -50,
  },
  heroCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,30,99,0.04)',
    bottom: -30,
    left: -20,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    marginBottom: 6,
    color: '#1C1C1E',
  },
  heroDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#6B6B7D',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#1C1C1E',
  },
  heroStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E8E93',
    marginTop: 4,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 12,
  },
});

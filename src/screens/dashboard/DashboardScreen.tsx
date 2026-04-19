import React, { useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';
const H_PAD    = Spacing.lg;
const GAP      = 6;
const NUM_COLS = 3;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning ☀️';
  if (h < 18) return 'Good Afternoon 👋';
  return 'Good Evening 🌙';
}

function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function WelcomeBand({ fullName, dynamicWelcome }: { fullName: string; dynamicWelcome: any }) {
  return (
    <View style={[welcome.card, dynamicWelcome.card]}>
      {/* Ghost ring decorations */}
      <View style={welcome.ringLg} />
      <View style={welcome.ringSm} />

      {/* Text */}
      <View style={welcome.textBlock}>
        <Text style={welcome.greeting}>{getGreeting()}</Text>
        <Text style={welcome.name} numberOfLines={1}>{fullName}</Text>
        <Text style={welcome.date}>{getDateString()}</Text>
      </View>

      {/* Stat chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={welcome.chipsContent}>
        {MODULES.map(m => (
          <View key={m.id} style={welcome.chip}>
            <Text style={welcome.chipValue}>{m.value}</Text>
            <Text style={welcome.chipLabel}>{m.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function DashboardScreen() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme();
  const cardWidth = (width - H_PAD * 2 - GAP) / NUM_COLS;

  const dynamicStyles = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  function handleModulePress(module: AppModule) {
    if (module.id === '4') {
      navigate('HR');
    }
  }

  return (
    <SafeAreaView style={[styles.safe, dynamicStyles.safe]} edges={['top', 'left', 'right']}>

      {/* Dark top band */}
      <View style={[styles.darkBand, dynamicStyles.darkBand]}>
        <PageHeader title="GPIT · ERP" showBack={true} />
        <WelcomeBand fullName={user!.fullName} dynamicWelcome={dynamicStyles.welcome} />
      </View>

      {/* Light sheet — slides up over dark band */}
      <View style={[styles.sheet, dynamicStyles.sheet]}>
        <FlatList
          data={MODULES}
          keyExtractor={item => item.id}
          numColumns={NUM_COLS}
          key={`cols-${NUM_COLS}`}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: AppModule }) => (
            <ModuleCard module={item} width={cardWidth} onPress={handleModulePress} />
          )}
          ListHeaderComponent={
            <>
              <QuickAccessRow onPress={handleModulePress} />
              <SectionDivider count={MODULES.length} dynamicDivider={dynamicStyles.divider} />
            </>
          }
        />
      </View>

    </SafeAreaView>
  );
}

function SectionDivider({ count, dynamicDivider }: { count: number; dynamicDivider: any }) {
  return (
    <View style={divider.row}>
      <View style={[divider.line, dynamicDivider.line]} />
      <View style={[divider.pill, dynamicDivider.pill]}>
        <Text style={[divider.pillText, dynamicDivider.pillText]}>All Modules</Text>
        <View style={divider.badge}>
          <Text style={divider.badgeText}>{count}</Text>
        </View>
      </View>
      <View style={[divider.line, dynamicDivider.line]} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  const sheetBg = isDarkMode ? '#2C2C2E' : '#F2F2F7';

  return {
    safe: {
      backgroundColor: colors.background,
    },
    darkBand: {
      backgroundColor: '#1C1C1E',
    },
    sheet: {
      backgroundColor: sheetBg,
    },
    welcome: {
      card: {
        borderColor: isDarkMode ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
      },
    },
    divider: StyleSheet.create({
      line: {
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E2E8',
      },
      pill: {
        backgroundColor: isDarkMode ? '#404040' : '#FFFFFF',
        borderColor: isDarkMode ? '#595959' : '#ECECF0',
      },
      pillText: {
        color: isDarkMode ? '#FFFFFF' : colors.primaryText,
      },
    }),
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  darkBand: {
    paddingBottom: 32,
  },

  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  list: {
    paddingHorizontal: H_PAD,
    paddingBottom: 40,
  },
  row: {
    gap: GAP,
    justifyContent: 'space-between',
  },
});

// Welcome card
const welcome = StyleSheet.create({
  card: {
    marginHorizontal: H_PAD,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: Spacing.lg,
    overflow: 'hidden',
  },

  // Ghost decorative rings
  ringLg: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 28,
    borderColor: 'rgba(233,30,99,0.08)',
    top: -45,
    right: -30,
  },
  ringSm: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 14,
    borderColor: 'rgba(233,30,99,0.06)',
    bottom: -20,
    left: -10,
  },

  textBlock: { marginBottom: Spacing.md },
  greeting: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.55)',
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginTop: 2,
    maxWidth: 220,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },

  chipsContent: { gap: Spacing.sm },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
});

// Section divider
const divider = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E2E8',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ECECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
  },
  badge: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});

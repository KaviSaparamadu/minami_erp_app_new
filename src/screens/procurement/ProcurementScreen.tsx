import React from 'react';
import { View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { ModuleHeroCard } from '../../components/dashboard/ModuleHeroCard';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { MODULES } from '../../constants/modules';

export function ProcurementScreen() {
  return (
    <SubModuleLayout parentModuleId="4" showBack={true}>
      <View>
        <ModuleHeroCard module={MODULES.find(m => m.id === '4')!} />
        <DashboardView />
      </View>
    </SubModuleLayout>
  );
}

import { MODULES } from '../constants/modules';
import type { AppModule, Submodule } from '../constants/modules';

export interface SearchResult {
  id: string;
  type: 'module' | 'submodule';
  name: string;
  description?: string;
  moduleId?: string;
  submoduleId?: string;
  screen?: string;
  value?: string;
  valueLabel?: string;
  relevance?: number; // Score for ranking results
}

/**
 * Calculate relevance score for better ranking
 */
function calculateRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match gets highest score
  if (lowerText === lowerQuery) return 100;
  
  // Starts with query gets high score
  if (lowerText.startsWith(lowerQuery)) return 80;
  
  // Contains query gets medium score
  if (lowerText.includes(lowerQuery)) return 50;
  
  return 0;
}

/**
 * Get smart suggestions based on partial query
 */
export function getSuggestions(query: string, limit: number = 5): SearchResult[] {
  if (!query.trim()) {
    // Return popular/featured modules when no query
    return MODULES.slice(0, limit).map(module => ({
      id: module.id,
      type: 'module',
      name: module.name,
      moduleId: module.id,
      screen: module.screen,
      value: module.value,
      valueLabel: module.valueLabel,
      relevance: 100,
    }));
  }

  const suggestions: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Collect all matching items with relevance scores
  MODULES.forEach(module => {
    const nameRelevance = calculateRelevance(module.name, query);
    const labelRelevance = calculateRelevance(module.valueLabel, query);
    const maxRelevance = Math.max(nameRelevance, labelRelevance);

    if (maxRelevance > 0) {
      suggestions.push({
        id: module.id,
        type: 'module',
        name: module.name,
        moduleId: module.id,
        screen: module.screen,
        value: module.value,
        valueLabel: module.valueLabel,
        relevance: maxRelevance,
      });
    }

    if (module.submodules) {
      module.submodules.forEach(submodule => {
        const subNameRelevance = calculateRelevance(submodule.name, query);
        const subLabelRelevance = calculateRelevance(submodule.valueLabel, query);
        const subMaxRelevance = Math.max(subNameRelevance, subLabelRelevance);

        if (subMaxRelevance > 0) {
          suggestions.push({
            id: submodule.id,
            type: 'submodule',
            name: submodule.name,
            description: submodule.description,
            moduleId: module.id,
            submoduleId: submodule.id,
            screen: module.screen,
            value: submodule.value,
            valueLabel: submodule.valueLabel,
            relevance: subMaxRelevance,
          });
        }
      });
    }
  });

  // Sort by relevance and return top results
  return suggestions
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, limit);
}

/**
 * Search across all modules and submodules in the app
 */
export function searchApp(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  MODULES.forEach(module => {
    // Search module name and description
    if (
      module.name.toLowerCase().includes(lowerQuery) ||
      module.valueLabel.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        id: module.id,
        type: 'module',
        name: module.name,
        moduleId: module.id,
        screen: module.screen,
        value: module.value,
        valueLabel: module.valueLabel,
      });
    }

    // Search submodules
    if (module.submodules) {
      module.submodules.forEach(submodule => {
        if (
          submodule.name.toLowerCase().includes(lowerQuery) ||
          submodule.valueLabel.toLowerCase().includes(lowerQuery) ||
          (submodule.description?.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            id: submodule.id,
            type: 'submodule',
            name: submodule.name,
            description: submodule.description,
            moduleId: module.id,
            submoduleId: submodule.id,
            screen: module.screen,
            value: submodule.value,
            valueLabel: submodule.valueLabel,
          });
        }
      });
    }
  });

  return results;
}

/**
 * Get a module by ID
 */
export function getModuleById(moduleId: string): AppModule | undefined {
  return MODULES.find(m => m.id === moduleId);
}

/**
 * Get a submodule by ID
 */
export function getSubmoduleById(moduleId: string, submoduleId: string): Submodule | undefined {
  const module = getModuleById(moduleId);
  return module?.submodules?.find(s => s.id === submoduleId);
}

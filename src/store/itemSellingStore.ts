export interface ItemSellingConfig {
  mrpFixed:     'yes' | 'no';
  profitType:   'fixed' | 'percentage';
  profitMargin: number;   // % of selling price
  profitMarkup: number;   // % of cost price
  fixedPrice:   number;
}

// In-memory store keyed by itemCode
const configs = new Map<string, ItemSellingConfig>();

export function setItemSellingConfig(itemCode: string, cfg: ItemSellingConfig) {
  configs.set(itemCode, cfg);
}

export function getItemSellingConfig(itemCode: string): ItemSellingConfig | undefined {
  return configs.get(itemCode);
}

const DEFAULT_MARKUP_PERCENT = 20;

// Returns calculated sell price given a cost price and the item's config.
// Falls back to DEFAULT_MARKUP_PERCENT when no config is saved for the item.
export function calcSellPrice(itemCode: string, costPrice: number): number | null {
  if (isNaN(costPrice) || costPrice <= 0) return null;

  const cfg = configs.get(itemCode);
  if (!cfg) {
    return costPrice * (1 + DEFAULT_MARKUP_PERCENT / 100);
  }

  if (cfg.profitType === 'fixed' && cfg.fixedPrice > 0) {
    return cfg.fixedPrice;
  }

  if (cfg.profitType === 'percentage') {
    if (cfg.profitMargin > 0 && cfg.profitMargin < 100) {
      // Margin = (Sell − Cost) / Sell  →  Sell = Cost / (1 − margin/100)
      return costPrice / (1 - cfg.profitMargin / 100);
    }
    if (cfg.profitMarkup > 0) {
      // Markup = (Sell − Cost) / Cost  →  Sell = Cost × (1 + markup/100)
      return costPrice * (1 + cfg.profitMarkup / 100);
    }
  }

  return null;
}

// Logistics settings store — drives both the Settings → Logistics page
// and the sidebar's Logistics menu item (which is disabled until the
// master toggle is on). localStorage-backed so the seller's choice
// persists across reloads; subscribe pattern lets the sidebar re-render
// the moment the seller flips the switch on the settings page.

const STORAGE_KEY = "qwipo.logisticsSettings";

export interface LogisticsSettings {
  /** Master toggle. When false, sub-options are ignored. */
  enabled: boolean;
  /**
   * "Tech for both Self & 3PL" — Qwipo's tech stack handles dispatch +
   * delivery for both the seller's own fleet and any 3PL providers.
   */
  techForBoth: boolean;
  /**
   * "No Tech for Self & Tech for 3PL" — seller's in-house delivery runs
   * outside Qwipo's tech, only the 3PL leg is technology-tracked.
   */
  techForThirdPartyOnly: boolean;
}

const DEFAULT: LogisticsSettings = {
  enabled: false,
  techForBoth: false,
  techForThirdPartyOnly: false,
};

const read = (): LogisticsSettings => {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<LogisticsSettings>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
};

let _settings: LogisticsSettings = read();
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((fn) => fn());

export const getLogisticsSettings = (): LogisticsSettings => _settings;

export const setLogisticsSettings = (next: LogisticsSettings) => {
  _settings = { ...next };
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_settings));
    }
  } catch {
    // Quota-exceeded or private-mode block — keep in-memory value and
    // drop the persistence quietly. The UI still reflects the choice.
  }
  notify();
};

export const subscribeToLogisticsSettings = (fn: () => void): (() => void) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};

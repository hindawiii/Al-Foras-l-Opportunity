import { guestStorage } from "./guestStorage";

const SAVED_KEY = "savedJobs";
const FILTERS_KEY = "jobFilters";

export const jobsStore = {
  savedIds(): string[] {
    return guestStorage.get<string[]>(SAVED_KEY, []) ?? [];
  },
  isSaved(id: string) {
    return jobsStore.savedIds().includes(id);
  },
  toggle(id: string): boolean {
    const list = jobsStore.savedIds();
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift(id);
    guestStorage.set(SAVED_KEY, list);
    return idx < 0;
  },
  getFilters(): { country: string | null; category: string | null; onlyMyCountry: boolean } {
    return guestStorage.get(FILTERS_KEY, { country: null, category: null, onlyMyCountry: false }) as any;
  },
  setFilters(f: { country?: string | null; category?: string | null; onlyMyCountry?: boolean }) {
    const cur = jobsStore.getFilters();
    guestStorage.set(FILTERS_KEY, { ...cur, ...f });
  },
};

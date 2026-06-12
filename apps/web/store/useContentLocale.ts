import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@rpv/domain";

/**
 * Content language is independent from the UI language: a user can browse the
 * app in Portuguese while reading English D&D content (or vice versa). It is
 * persisted client-side and consumed by the catalog read seam.
 */
interface ContentLocaleStore {
    contentLocale: Locale;
    setContentLocale: (locale: Locale) => void;
}

export const useContentLocale = create<ContentLocaleStore>()(
    persist(
        (set) => ({
            contentLocale: DEFAULT_LOCALE,
            setContentLocale: (locale) => set({ contentLocale: locale }),
        }),
        {
            name: "content-locale",
            merge: (persisted, current) => {
                const state = persisted as Partial<ContentLocaleStore> | undefined;
                return {
                    ...current,
                    contentLocale: isLocale(state?.contentLocale)
                        ? state!.contentLocale
                        : current.contentLocale,
                };
            },
        }
    )
);

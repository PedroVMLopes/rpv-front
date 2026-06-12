"use server";

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@rpv/domain";

/**
 * The UI language is a user preference persisted in a cookie (no URL prefix).
 * It is intentionally independent from the content language, which is a property
 * of the content itself.
 */
const UI_LOCALE_COOKIE = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
    const store = await cookies();
    const value = store.get(UI_LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale): Promise<void> {
    const store = await cookies();
    store.set(UI_LOCALE_COOKIE, locale);
}

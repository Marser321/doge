import { expect, test, describe } from "bun:test";
import { t, TranslationKey, Lang } from "./i18n";

describe("i18n translation function (t)", () => {
  test("translates a known key to English", () => {
    expect(t("nav.services", "en")).toBe("Services");
  });

  test("translates a known key to Spanish", () => {
    expect(t("nav.services", "es")).toBe("Servicios");
  });

  test("returns the key itself if the translation key does not exist", () => {
    const unknownKey = "unknown.key.that.does.not.exist" as TranslationKey;
    expect(t(unknownKey, "en")).toBe("unknown.key.that.does.not.exist");
    expect(t(unknownKey, "es")).toBe("unknown.key.that.does.not.exist");
  });

  test("returns the key itself if the language is undefined or invalid", () => {
    const invalidLang = "fr" as Lang;
    expect(t("nav.services", invalidLang)).toBe("nav.services");
  });
});

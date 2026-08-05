// react-native's typed Text/View props don't include the web-only `aria-level`
// attribute, but react-native-web reads role="heading" + aria-level to render
// a real <h1>/<h2>/<h3> in the exported HTML (see
// react-native-web/dist/modules/AccessibilityUtil/propsToAccessibilityComponent).
// This narrowly casts just that one prop so semantic heading structure survives
// static export for crawlers, instead of flattening every title to a styled <div>.
export function headingProps(level: 1 | 2 | 3) {
  return { role: "heading" as const, "aria-level": level } as Record<string, unknown>;
}

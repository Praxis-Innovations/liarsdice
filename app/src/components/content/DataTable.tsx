import React, { useMemo } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { BREAKPOINTS } from "../../lib/breakpoints";
import { useTheme } from "../../theme/ThemeProvider";

interface DataTableProps {
  columns: string[];
  rows: (string | number)[][];
}

const MIN_CELL_WIDTH = 140;

function cellWidthFor(label: string): number {
  // Keep enough room for long headers without crushing in a 760px content column.
  return Math.max(MIN_CELL_WIDTH, Math.ceil(label.length * 7.4) + 28);
}

export function DataTable({ columns, rows }: DataTableProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  // Stack into cards below Tailwind md — tables need more horizontal room than chrome.
  const isNarrow = width < BREAKPOINTS.md;
  const colWidths = useMemo(() => columns.map((col) => cellWidthFor(col)), [columns]);

  if (isNarrow) {
    return (
      <View style={{ gap: spacing.sm }}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              backgroundColor: colors.surfaceRaised,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontFamily: typography.bodySemibold.fontFamily,
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              {columns[0]}: {row[0]}
            </Text>
            {columns.slice(1).map((col, colIndex) => (
              <View
                key={col}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: typography.caption.fontFamily,
                    fontSize: 12,
                    flexShrink: 1,
                  }}
                >
                  {col}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: typography.bodySemibold.fontFamily,
                    fontSize: 13,
                  }}
                >
                  {row[colIndex + 1] ?? "—"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: radii.md,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            {columns.map((col, colIndex) => (
              <View
                key={col}
                style={{
                  width: colWidths[colIndex],
                  flexShrink: 0,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.accent,
                    fontFamily: typography.bodySemibold.fontFamily,
                    fontSize: 12,
                    letterSpacing: 0.2,
                  }}
                >
                  {col}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                borderBottomWidth: rowIndex === rows.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              {columns.map((_, cellIndex) => (
                <View
                  key={cellIndex}
                  style={{
                    width: colWidths[cellIndex],
                    flexShrink: 0,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: cellIndex === 0 ? colors.textPrimary : colors.textSecondary,
                      fontFamily:
                        cellIndex === 0
                          ? typography.bodySemibold.fontFamily
                          : typography.body.fontFamily,
                      fontSize: 13,
                    }}
                  >
                    {row[cellIndex] ?? "—"}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

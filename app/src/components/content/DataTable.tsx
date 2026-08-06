import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface DataTableProps {
  columns: string[];
  rows: (string | number)[][];
}

const MIN_CELL_WIDTH = 130;

export function DataTable({ columns, rows }: DataTableProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  if (isNarrow) {
    return (
      <View style={{ gap: spacing.sm }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ backgroundColor: colors.surfaceRaised, borderRadius: radii.md, padding: spacing.md, gap: 6 }}>
            <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13, marginBottom: 4 }}>
              {row[0]}
            </Text>
            {columns.slice(1).map((col, colIndex) => (
              <View key={col} className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12 }}>{col}</Text>
                <Text style={{ color: colors.textPrimary, fontFamily: typography.bodyMedium.fontFamily, fontSize: 13 }}>
                  {row[colIndex + 1]}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator style={{ borderRadius: radii.md, backgroundColor: colors.surfaceRaised }}>
      <View>
        <View className="flex-row" style={{ borderBottomWidth: 2, borderBottomColor: colors.border }}>
          {columns.map((col) => (
            <View key={col} style={{ minWidth: MIN_CELL_WIDTH, padding: spacing.sm }}>
              <Text style={{ color: colors.accent, fontFamily: typography.bodySemibold.fontFamily, fontSize: 13 }}>{col}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            className="flex-row"
            style={{ borderBottomWidth: rowIndex === rows.length - 1 ? 0 : 1, borderBottomColor: colors.border }}
          >
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={{ minWidth: MIN_CELL_WIDTH, padding: spacing.sm }}>
                <Text
                  style={{
                    color: cellIndex === 0 ? colors.textPrimary : colors.textSecondary,
                    fontFamily: cellIndex === 0 ? typography.bodySemibold.fontFamily : typography.body.fontFamily,
                    fontSize: 13,
                  }}
                >
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

import React from "react";
import { ScrollView, Text, View } from "react-native";
import { headingProps } from "../../lib/heading";
import { useTheme } from "../../theme/ThemeProvider";
import { Footer } from "../shared/Footer";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { ContentNav } from "./ContentNav";

interface ContentLayoutProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
  children: React.ReactNode;
}

export function ContentLayout({ title, breadcrumb, children }: ContentLayoutProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ maxWidth: 760, width: "100%", alignSelf: "center", padding: spacing.lg, gap: spacing.lg, flex: 1 }}>
        <View style={{ gap: spacing.md }}>
          <Breadcrumb items={breadcrumb} />
          <Text
            {...headingProps(1)}
            style={{ color: colors.textPrimary, fontFamily: typography.h1.fontFamily, fontSize: 34 }}
          >
            {title}
          </Text>
        </View>

        {children}

        <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 12, marginBottom: spacing.sm }}>
            Keep exploring
          </Text>
          <ContentNav />
        </View>
      </View>
      <Footer />
    </ScrollView>
  );
}

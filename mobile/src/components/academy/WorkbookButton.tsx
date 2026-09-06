import React, { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text } from "react-native";

import { academyApi } from "../../api/academy";
import { colors, typeScale } from "../../theme";

interface WorkbookButtonProps {
  courseId: string;
}

export function WorkbookButton({ courseId }: WorkbookButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const { download_url } = await academyApi.getWorkbookDownloadUrl(courseId);
      await Linking.openURL(download_url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable style={styles.button} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={colors.ivory} />
      ) : (
        <Text style={styles.label}>Download Workbook</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typeScale.button,
    color: colors.ivory,
  },
});

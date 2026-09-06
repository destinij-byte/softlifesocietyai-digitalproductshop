import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { academyApi, Enrollment } from "../../api/academy";
import { CourseCard } from "../../components/academy/CourseCard";
import { colors, typeScale } from "../../theme";
import type { AcademyStackParamList } from "../../navigation/AcademyNavigator";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseList">;

export function CourseListScreen() {
  const navigation = useNavigation<Nav>();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await academyApi.myCourses();
      setEnrollments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>My Academy</Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You haven't enrolled in any courses yet. Visit the storefront to get started.
          </Text>
        }
        renderItem={({ item }) => (
          <CourseCard
            title={item.course.title}
            description={item.course.description}
            price={item.course.price}
            thumbnailUrl={item.course.thumbnail_url}
            percentComplete={item.progress.percent_complete}
            onPress={() => navigation.navigate("CourseDetail", { slug: item.course.slug })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  header: {
    ...typeScale.h1,
    color: colors.ink,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
    paddingHorizontal: 4,
  },
});

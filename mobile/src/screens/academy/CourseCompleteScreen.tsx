import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { academyApi, CourseDetail } from "../../api/academy";
import { RecommendedNextCard } from "../../components/academy/RecommendedNextCard";
import { colors, fonts, typeScale } from "../../theme";
import type { AcademyStackParamList } from "../../navigation/AcademyNavigator";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseComplete">;
type Rt = RouteProp<AcademyStackParamList, "CourseComplete">;

export function CourseCompleteScreen() {
  const navigation = useNavigation<Nav>();
  const { courseSlug } = useRoute<Rt>().params;

  const [course, setCourse] = useState<CourseDetail | null>(null);

  useEffect(() => {
    academyApi.getCourse(courseSlug).then(setCourse);
  }, [courseSlug]);

  return (
    <View style={styles.screen}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>You did it</Text>
      </View>
      <Text style={styles.headline}>Course Complete</Text>
      <Text style={styles.subtext}>
        You've finished every lesson in {course?.title ?? "this course"}. Take a moment to
        celebrate the glow up.
      </Text>

      {!course ? (
        <ActivityIndicator color={colors.gold} style={styles.loader} />
      ) : course.recommended_next ? (
        <RecommendedNextCard
          title={course.recommended_next.title}
          description={course.recommended_next.description}
          onPress={() =>
            navigation.navigate("CourseDetail", { slug: course.recommended_next!.slug })
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    padding: 24,
    paddingTop: 48,
    gap: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.rose,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    ...typeScale.label,
    color: colors.ivory,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 48,
    color: colors.ink,
  },
  subtext: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.8,
  },
  loader: {
    marginTop: 24,
  },
});

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { academyApi, CourseDetail, Progress } from "../../api/academy";
import { LessonListItem } from "../../components/academy/LessonListItem";
import { ProgressBar } from "../../components/academy/ProgressBar";
import { WorkbookButton } from "../../components/academy/WorkbookButton";
import { colors, typeScale } from "../../theme";
import type { AcademyStackParamList } from "../../navigation/AcademyNavigator";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseDetail">;
type Rt = RouteProp<AcademyStackParamList, "CourseDetail">;

export function CourseDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { slug } = useRoute<Rt>().params;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const courseData = await academyApi.getCourse(slug);
      setCourse(courseData);
      const progressData = await academyApi.getProgress(courseData.id);
      setProgress(progressData);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !course || !progress) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const completedSet = new Set(progress.lessons_completed);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description}>{course.description}</Text>

      <View style={styles.progressRow}>
        <ProgressBar percentComplete={progress.percent_complete} />
        <Text style={styles.progressLabel}>{Math.round(progress.percent_complete)}% complete</Text>
      </View>

      {course.modules.map((module) => (
        <View key={module.id} style={styles.moduleBlock}>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <View style={styles.lessonList}>
            {module.lessons.map((lesson) => (
              <LessonListItem
                key={lesson.id}
                title={lesson.title}
                order={lesson.order}
                durationSeconds={lesson.duration_seconds}
                isCompleted={completedSet.has(lesson.id)}
                isCurrent={progress.current_lesson_id === lesson.id}
                onPress={() =>
                  navigation.navigate("LessonPlayer", {
                    lessonId: lesson.id,
                    courseId: course.id,
                    courseSlug: course.slug,
                  })
                }
              />
            ))}
          </View>
        </View>
      ))}

      {course.workbook_url ? (
        <View style={styles.workbookWrap}>
          <WorkbookButton courseId={course.id} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
  },
  title: {
    ...typeScale.h1,
    color: colors.ink,
  },
  description: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.8,
  },
  progressRow: {
    gap: 8,
  },
  progressLabel: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.6,
  },
  moduleBlock: {
    gap: 10,
  },
  moduleTitle: {
    ...typeScale.h3,
    color: colors.ink,
  },
  lessonList: {
    gap: 8,
  },
  workbookWrap: {
    marginTop: 8,
  },
});

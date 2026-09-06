import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";

import { academyApi, CourseDetail, LessonDetail } from "../../api/academy";
import { colors, typeScale } from "../../theme";
import type { AcademyStackParamList } from "../../navigation/AcademyNavigator";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "LessonPlayer">;
type Rt = RouteProp<AcademyStackParamList, "LessonPlayer">;

export function LessonPlayerScreen() {
  const navigation = useNavigation<Nav>();
  const { lessonId, courseId, courseSlug } = useRoute<Rt>().params;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    academyApi.getLesson(lessonId).then((data) => {
      if (!cancelled) setLesson(data);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const handleComplete = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    try {
      const result = await academyApi.completeLesson(lessonId);
      if (result.completed_course) {
        navigation.replace("CourseComplete", { courseId, courseSlug });
      } else if (result.current_lesson_id) {
        navigation.replace("LessonPlayer", {
          lessonId: result.current_lesson_id,
          courseId,
          courseSlug,
        });
      } else {
        navigation.goBack();
      }
    } finally {
      setCompleting(false);
    }
  }, [completing, courseId, courseSlug, lessonId, navigation]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish && !hasAutoCompletedRef.current) {
        hasAutoCompletedRef.current = true;
        handleComplete();
      }
    },
    [handleComplete]
  );

  if (loading || !lesson) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ivory} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Video
        source={{ uri: lesson.video_url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
      <Text style={styles.title}>{lesson.title}</Text>

      <Pressable style={styles.completeButton} onPress={handleComplete} disabled={completing}>
        {completing ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <Text style={styles.completeLabel}>Mark Complete</Text>
        )}
      </Pressable>

      {lesson.resources.length > 0 && (
        <View style={styles.resources}>
          {lesson.resources.map((resource) => (
            <Text key={resource.url} style={styles.resourceLink}>
              {resource.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
  },
  title: {
    ...typeScale.h3,
    color: colors.ivory,
  },
  completeButton: {
    backgroundColor: colors.blush,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeLabel: {
    ...typeScale.button,
    color: colors.ink,
  },
  resources: {
    gap: 6,
  },
  resourceLink: {
    ...typeScale.bodySmall,
    color: colors.gold,
  },
});

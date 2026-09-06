import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors, fonts } from "../theme";
import { CourseListScreen } from "../screens/academy/CourseListScreen";
import { CourseDetailScreen } from "../screens/academy/CourseDetailScreen";
import { LessonPlayerScreen } from "../screens/academy/LessonPlayerScreen";
import { CourseCompleteScreen } from "../screens/academy/CourseCompleteScreen";

export type AcademyStackParamList = {
  CourseList: undefined;
  CourseDetail: { slug: string };
  LessonPlayer: { lessonId: string; courseId: string; courseSlug: string };
  CourseComplete: { courseId: string; courseSlug: string };
};

const Stack = createNativeStackNavigator<AcademyStackParamList>();

export function AcademyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ivory },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.displayMedium },
        contentStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: "Academy" }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: "" }} />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{ headerStyle: { backgroundColor: colors.ink }, headerTintColor: colors.ivory, title: "" }}
      />
      <Stack.Screen
        name="CourseComplete"
        component={CourseCompleteScreen}
        options={{ title: "Course Complete", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}

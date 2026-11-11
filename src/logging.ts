import posthog from './posthog'

type WorkoutType = 'new' | 'routine'

type CompletedWorkout = {
  workoutType: WorkoutType
  completedSetCount: number
  exerciseCount: number
  durationSeconds: number
  volumeKg: number
}

export const workoutLogger = {
  started(workoutType: WorkoutType, exerciseCount?: number) {
    posthog.logger.info('workout_started', {
      workout_type: workoutType,
      ...(exerciseCount !== undefined ? { exercise_count: exerciseCount } : {}),
    })
  },
  completed({ workoutType, completedSetCount, exerciseCount, durationSeconds, volumeKg }: CompletedWorkout) {
    posthog.logger.info('workout_completed', {
      workout_type: workoutType,
      completed_set_count: completedSetCount,
      exercise_count: exerciseCount,
      duration_seconds: durationSeconds,
      volume_kg: volumeKg,
    })
  },
}

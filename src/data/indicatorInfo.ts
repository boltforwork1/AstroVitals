import type { IndicatorKey } from '@/types/health';

export interface IndicatorInfo {
  measure: string;
  whyItMatters: string;
  outOfRange: string;
}

export const indicatorInfo: Record<IndicatorKey, IndicatorInfo> = {
  heartRate: {
    measure:
      'Resting heart rate is measured with a chest-strap monitor or wrist sensor each morning before getting out of the sleeping quarters.',
    whyItMatters:
      'In microgravity, blood shifts toward the upper body, which can gradually raise resting heart rate over weeks. A sustained increase may signal dehydration, stress, or reduced cardiovascular fitness.',
    outOfRange:
      'High readings can be caused by stress, caffeine, dehydration, or fever. Low resting rates often reflect excellent fitness but can also result from prolonged bed rest or certain medications.',
  },
  systolic: {
    measure:
      'Systolic blood pressure is captured with an automated arm cuff after five minutes of seated rest in the station.',
    whyItMatters:
      'Fluid shifts toward the head in microgravity, and the cardiovascular system adapts over time. Tracking systolic pressure helps detect whether that adaptation is staying within safe limits.',
    outOfRange:
      'Elevated systolic can follow high-sodium meals, stress, or insufficient exercise. Low readings may occur after extended bed rest or rapid fluid loss.',
  },
  diastolic: {
    measure:
      'Diastolic blood pressure is measured together with systolic using the same automated cuff, capturing arterial pressure between heartbeats.',
    whyItMatters:
      'Diastolic pressure reflects baseline vascular resistance. In space, changes in blood volume and vessel tone can cause it to drift, offering an early signal of cardiovascular deconditioning.',
    outOfRange:
      'Changes often track with systolic shifts. Dehydration, electrolyte imbalance, and reduced physical loading can all push diastolic outside its usual range.',
  },
  glucose: {
    measure:
      'Fasting blood glucose is measured with a finger-prick glucometer first thing in the morning, before breakfast.',
    whyItMatters:
      'Spaceflight can alter insulin sensitivity. Monitoring glucose helps ensure that diet and exercise are keeping metabolism balanced during long missions.',
    outOfRange:
      'High readings may follow high-carbohydrate meals, stress, or insufficient physical activity. Low values can result from skipped meals or overexertion without adequate nutrition.',
  },
  temperature: {
    measure:
      'Core body temperature is taken with an ingestible or tympanic thermometer, typically recorded each morning and evening.',
    whyItMatters:
      'Microgravity can subtly raise baseline core temperature during long missions. Persistent elevation may indicate infection or inflammation that could escalate quickly in a closed environment.',
    outOfRange:
      'Fever from infection is the most common cause of elevation. Low readings can result from measurement error, prolonged cold exposure during EVA, or circadian timing differences.',
  },
  sleep: {
    measure:
      'Sleep duration is estimated from actigraphy data and confirmed by self-report each morning in the daily check-in.',
    whyItMatters:
      'The ISS orbits Earth every 90 minutes, creating 16 sunrises per day. This disrupted day-night cycle makes quality sleep one of the hardest things to maintain on long missions.',
    outOfRange:
      'Low sleep can be caused by noise, lighting changes, workload surges, or stress. Oversleeping may signal fatigue debt, illness, or mood changes.',
  },
  mood: {
    measure:
      'Mood is self-reported on a 1–5 scale during the daily check-in, reflecting the crew member\'s subjective sense of well-being.',
    whyItMatters:
      'Isolation, confinement, and distance from Earth take a psychological toll over months. Tracking mood trends helps flag declining mental health before it affects performance.',
    outOfRange:
      'Lower scores often follow poor sleep, heavy workload, interpersonal tension, or news from home. Sudden drops warrant a conversation with the flight surgeon.',
  },
  exercise: {
    measure:
      'Total exercise minutes are logged from the station\'s resistance device and treadmill after each workout session.',
    whyItMatters:
      'Without gravity loading, bones lose density and muscles atrophy quickly. Two-plus hours of daily resistance and aerobic exercise is the primary countermeasure against this decline.',
    outOfRange:
      'Low totals usually reflect schedule pressure, equipment maintenance, or minor injuries. Very high totals can risk overuse injury if not balanced with recovery.',
  },
};

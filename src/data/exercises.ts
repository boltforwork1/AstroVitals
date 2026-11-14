// In orbit, crews use resistive and aerobic devices because bodyweight alone gives
// almost no loading in microgravity. The exercise names, durations, and guidance
// below are illustrative demo values, not an operational exercise prescription.

export type ExerciseId =
  | 'squat'
  | 'deadlift'
  | 'bench'
  | 'row'
  | 'heelRaise'
  | 'treadmill'
  | 'cycle'
  | 'plank'
  | 'balance'
  | 'stretch';

export type ExerciseCategory = 'resistance' | 'cardio' | 'balance' | 'flexibility';
export type ExerciseTarget = 'bones' | 'muscles' | 'heart';
export type Intensity = 'low' | 'moderate' | 'high';

export interface Exercise {
  id: ExerciseId;
  name: string;
  category: ExerciseCategory;
  targets: ExerciseTarget[];
  defaultMinutes: number;
  intensity: Intensity;
  instructions: string;
  whyInSpace: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: 'squat',
    name: 'Resistance squats',
    category: 'resistance',
    targets: ['bones', 'muscles'],
    defaultMinutes: 20,
    intensity: 'high',
    instructions:
      'Attach the resistive device to the squat harness and stand with feet hip-width apart. Bend your knees and hips to lower the load, then drive back up through your heels. Keep your back straight and move at a steady pace.',
    whyInSpace:
      'Loading the legs and spine signals the bones to hold their density, which slows loss in weight-bearing areas.',
  },
  {
    id: 'deadlift',
    name: 'Resistance deadlift',
    category: 'resistance',
    targets: ['bones', 'muscles'],
    defaultMinutes: 15,
    intensity: 'high',
    instructions:
      'Set the bar on the resistive device at a load you can control. Hinge at the hips with a flat back, then stand tall while pulling the bar along your legs. Lower it slowly under control.',
    whyInSpace:
      'Pulling against resistance works the back and hip muscles that otherwise go unused in microgravity.',
  },
  {
    id: 'bench',
    name: 'Bench chest press',
    category: 'resistance',
    targets: ['muscles'],
    defaultMinutes: 10,
    intensity: 'moderate',
    instructions:
      'Lie on the bench and grip the handles of the resistive device at shoulder width. Press up until your arms are straight, then return slowly to the start. Breathe out as you press.',
    whyInSpace:
      'Upper-body muscles lose strength quickly without gravity, so regular pressing keeps arms and chest working.',
  },
  {
    id: 'row',
    name: 'Rowing movement',
    category: 'resistance',
    targets: ['muscles'],
    defaultMinutes: 15,
    intensity: 'moderate',
    instructions:
      'Hold the rowing handles of the resistive device with a straight back. Pull the handles toward your ribs, squeezing your shoulder blades together, then extend your arms slowly.',
    whyInSpace:
      'Pulling movements work the back muscles that hold posture when there is no gravity to push against.',
  },
  {
    id: 'heelRaise',
    name: 'Heel raises',
    category: 'resistance',
    targets: ['bones', 'muscles'],
    defaultMinutes: 10,
    intensity: 'low',
    instructions:
      'Stand on the footplate with the resistance set to a light load. Rise onto the balls of your feet as high as you comfortably can, hold for a moment, then lower with control.',
    whyInSpace:
      'Calf and foot loading helps protect lower-leg bone and the muscles that support standing and walking after flight.',
  },
  {
    id: 'treadmill',
    name: 'Treadmill running with harness',
    category: 'cardio',
    targets: ['bones', 'heart'],
    defaultMinutes: 15,
    intensity: 'high',
    instructions:
      'Put on the harness and set the treadmill to a pace you can hold while talking. Run or walk briskly, keeping your steps light and your posture upright. Stop the belt before stepping off.',
    whyInSpace:
      'Impact and a raised heart rate load the skeleton and keep the heart and blood vessels conditioned without gravity.',
  },
  {
    id: 'cycle',
    name: 'Stationary cycle',
    category: 'cardio',
    targets: ['heart', 'muscles'],
    defaultMinutes: 10,
    intensity: 'moderate',
    instructions:
      'Secure your feet in the pedals and set a steady resistance. Pedal at a rhythm that keeps your breathing comfortable, and adjust the load if your heart rate climbs too high.',
    whyInSpace:
      'Cycling trains the heart and leg muscles at a low impact level, which suits days when the body needs gentler work.',
  },
  {
    id: 'plank',
    name: 'Core and plank holds',
    category: 'resistance',
    targets: ['muscles'],
    defaultMinutes: 10,
    intensity: 'moderate',
    instructions:
      'Brace against the floor or a restraint with forearms and toes, keeping your body in one straight line. Hold for the set time while breathing steadily, then rest and repeat.',
    whyInSpace:
      'A strong core keeps the spine supported and helps you move and work safely in a weightless environment.',
  },
  {
    id: 'balance',
    name: 'Balance and posture drills',
    category: 'balance',
    targets: ['muscles'],
    defaultMinutes: 10,
    intensity: 'low',
    instructions:
      'Stand near a handhold and shift your weight slowly from one foot to the other. Try small controlled movements with your eyes open, then closed if you feel steady. Keep your head level and your core engaged.',
    whyInSpace:
      'Without gravity the inner ear and posture muscles need practice to re-learn how to balance on return to Earth.',
  },
  {
    id: 'stretch',
    name: 'Full-body stretching',
    category: 'flexibility',
    targets: ['muscles'],
    defaultMinutes: 5,
    intensity: 'low',
    instructions:
      'Move slowly through neck, shoulder, back, hip, and leg stretches, holding each for about 20 seconds. Breathe deeply and never bounce. Stop any stretch that causes sharp pain.',
    whyInSpace:
      'Stretching eases the stiffness and back discomfort that many crew members feel from long periods floating in a neutral posture.',
  },
];

export const EXERCISE_BY_ID: Record<ExerciseId, Exercise> = EXERCISES.reduce(
  (acc, e) => {
    acc[e.id] = e;
    return acc;
  },
  {} as Record<ExerciseId, Exercise>
);

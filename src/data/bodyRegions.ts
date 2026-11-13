import type { IndicatorKey } from '@/types/health';
import type { HazardId } from './hazards';

export type RegionId = 'brain' | 'eyes' | 'heart' | 'immune' | 'gut' | 'bones' | 'muscles';

export interface BodyRegion {
  id: RegionId;
  name: string;
  relatedIndicators: IndicatorKey[];
  hazards: HazardId[];
  function: string;
  spaceEffect: string;
  warningSigns: string;
  whatToDo: string[];
}

// The indicator-to-region mapping is a simplified demo model.
// Some links are indirect (e.g. sleep affects immune function, mood reflects
// brain health, exercise protects both bones and muscles) and are not meant
// to represent a clinical diagnostic tool.
export const bodyRegions: BodyRegion[] = [
  {
    id: 'brain',
    name: 'Brain & Nervous System',
    relatedIndicators: ['sleep', 'mood'],
    hazards: ['isolation', 'radiation', 'closedEnvironment', 'gravity'],
    function:
      'The brain controls thinking, mood, sleep regulation, and coordination. It manages every conscious and unconscious process that keeps a crew member alert and capable.',
    spaceEffect:
      'In microgravity, fluids shift toward the head, raising intracranial pressure. The ISS orbits every 90 minutes, creating 16 day-night cycles per day that disrupt the body\'s natural clock. Isolation and distance from Earth add psychological stress over weeks and months.',
    warningSigns:
      'Persistent headaches, trouble concentrating, irritability, low mood, or sleeping far less than usual can signal that the brain is under strain.',
    whatToDo: [
      'Stick to a fixed sleep schedule with controlled lighting to reinforce your circadian rhythm.',
      'Take regular cognitive breaks and use relaxation or mindfulness techniques.',
      'Stay in regular communication with the crew and the ground team about how you feel.',
    ],
  },
  {
    id: 'eyes',
    name: 'Eyes & Vision',
    relatedIndicators: ['systolic', 'diastolic', 'sleep'],
    hazards: ['gravity', 'closedEnvironment'],
    function:
      'The eyes capture light and send it to the brain for processing. Clear vision is essential for operating equipment, reading displays, and performing experiments.',
    spaceEffect:
      'Fluid shifting toward the head increases pressure inside the skull, which can change the shape of the back of the eye. This condition, known as SANS, can blur vision and alter eyesight over weeks to months in orbit.',
    warningSigns:
      'Blurred vision, difficulty focusing, needing to adjust reading distance, or noticing changes in how screens look day to day.',
    whatToDo: [
      'Report any vision changes to the flight surgeon during your daily check-in.',
      'Use prescribed vision corrective devices and keep reading material at a consistent distance.',
      'Ensure cabin lighting is adequate to reduce eye strain during fine-motor tasks.',
    ],
  },
  {
    id: 'heart',
    name: 'Heart & Cardiovascular',
    relatedIndicators: ['heartRate', 'systolic', 'diastolic'],
    hazards: ['gravity', 'radiation'],
    function:
      'The heart pumps blood throughout the body, delivering oxygen and nutrients. Blood pressure reflects how hard the heart is working and how well vessels respond.',
    spaceEffect:
      'Without gravity pulling blood toward the legs, fluid shifts upward and total blood volume decreases. The heart does less work and can lose conditioning over time. Radiation exposure may also contribute to long-term cardiovascular risk.',
    warningSigns:
      'A rising resting heart rate, unusual blood pressure readings, dizziness, palpitations, or shortness of breath during routine activity.',
    whatToDo: [
      'Do daily aerobic exercise on the treadmill or cycle to maintain cardiovascular fitness.',
      'Stay well hydrated and monitor fluid intake against output.',
      'Track heart rate and blood pressure consistently at the same time each day.',
    ],
  },
  {
    id: 'immune',
    name: 'Immune System',
    relatedIndicators: ['sleep', 'temperature', 'mood'],
    hazards: ['radiation', 'isolation', 'closedEnvironment'],
    function:
      'The immune system defends against infections and helps the body heal. It includes white blood cells, the thymus, lymph nodes, and other defense tissues.',
    spaceEffect:
      'Long-duration spaceflight can dysregulate immune function. Stress, radiation, and a closed habitat with recycled air all contribute. Dormant viruses such as herpes can reactivate during missions, and skin sensitivity or minor infections may take longer to clear.',
    warningSigns:
      'Persistent low-grade fever, unusual fatigue, slow-healing cuts, rash flare-ups, or cold symptoms that linger longer than expected.',
    whatToDo: [
      'Prioritize sleep, as poor rest directly weakens immune response.',
      'Maintain strict hygiene and surface cleaning protocols in the habitat.',
      'Report any persistent symptoms or fever to the flight surgeon promptly.',
    ],
  },
  {
    id: 'gut',
    name: 'Gut & Metabolism',
    relatedIndicators: ['glucose'],
    hazards: ['closedEnvironment', 'distance', 'isolation'],
    function:
      'The digestive system breaks down food, absorbs nutrients, and regulates blood sugar. It also hosts gut bacteria that influence metabolism and immune health.',
    spaceEffect:
      'Food on long missions is mostly shelf-stable and lacks the variety of a fresh diet. Limited storage and resupply constraints mean fewer fresh fruits and vegetables. Microgravity can also alter how the gut processes food and absorbs nutrients over time.',
    warningSigns:
      'Unusual blood glucose readings, persistent bloating, changes in appetite, or unexplained weight shifts.',
    whatToDo: [
      'Eat meals at consistent times and balance carbohydrates with protein.',
      'Track glucose regularly and note any readings outside your usual range.',
      'Stay hydrated and use available supplements to fill nutritional gaps.',
    ],
  },
  {
    id: 'bones',
    name: 'Bones & Skeleton',
    relatedIndicators: ['exercise'],
    hazards: ['gravity', 'radiation'],
    function:
      'Bones provide structural support, protect organs, and store minerals. They constantly rebuild themselves in response to the loads they bear.',
    spaceEffect:
      'Without gravity loading, bones lose density at roughly 1% per month in weight-bearing areas such as the hips and spine. This loss accumulates over long missions and increases fracture risk both in orbit and after return to gravity.',
    warningSigns:
      'Back pain, joint discomfort, or a steady drop in resistance exercise performance over weeks.',
    whatToDo: [
      'Complete the full daily resistance exercise protocol targeting the spine, hips, and legs.',
      'Ensure adequate calcium and vitamin D intake through diet and supplements.',
      'Log exercise loads and report any persistent bone or joint pain.',
    ],
  },
  {
    id: 'muscles',
    name: 'Muscles',
    relatedIndicators: ['exercise', 'heartRate'],
    hazards: ['gravity', 'distance'],
    function:
      'Muscles produce movement, maintain posture, and support the cardiovascular system. Postural muscles in the legs and back are especially active against gravity.',
    spaceEffect:
      'In microgravity, postural muscles barely work and begin to atrophy within days. Muscle mass and strength can decline significantly over weeks without countermeasures, affecting both movement and exercise capacity.',
    warningSigns:
      'Declining strength, difficulty completing routine exercise loads, or muscle soreness that does not recover between sessions.',
    whatToDo: [
      'Stick to the full daily exercise regimen including both resistance and aerobic work.',
      'Vary exercises to target all major muscle groups, not just the arms.',
      'Track performance metrics and report any sharp declines to the training specialist.',
    ],
  },
];

export const regionMap: Record<RegionId, BodyRegion> = bodyRegions.reduce(
  (acc, r) => { acc[r.id] = r; return acc; },
  {} as Record<RegionId, BodyRegion>
);

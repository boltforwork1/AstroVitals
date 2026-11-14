export interface MeasureGuide {
  src: string;
  title: string;
  alt: string;
}

export const measureGuides: Record<string, MeasureGuide> = {
  heartRate: {
    src: '/measure/bp-heart-rate.jpeg',
    title: 'How to measure blood pressure and heart rate',
    alt: 'Illustrated steps showing cuff placement above the elbow, sitting upright with the arm at heart level, and how to read systolic, diastolic and pulse on the monitor',
  },
  systolic: {
    src: '/measure/bp-heart-rate.jpeg',
    title: 'How to measure blood pressure and heart rate',
    alt: 'Illustrated steps showing cuff placement above the elbow, sitting upright with the arm at heart level, and how to read systolic, diastolic and pulse on the monitor',
  },
  diastolic: {
    src: '/measure/bp-heart-rate.jpeg',
    title: 'How to measure blood pressure and heart rate',
    alt: 'Illustrated steps showing cuff placement above the elbow, sitting upright with the arm at heart level, and how to read systolic, diastolic and pulse on the monitor',
  },
  glucose: {
    src: '/measure/glucose.jpeg',
    title: 'How to measure blood glucose',
    alt: 'Illustrated steps: wash your hands, insert the test strip, prick your finger, take the blood sample, then read mg/dL on the glucometer',
  },
  temperature: {
    src: '/measure/temperature.jpeg',
    title: 'How to measure body temperature',
    alt: 'Illustrations of oral thermometer placement under the tongue and of a no-contact forehead thermometer held 1 to 5 cm from the skin',
  },
  radiation: {
    src: '/measure/radiation-dosimetry.jpeg',
    title: 'How to measure radiation dosimetry',
    alt: 'Five illustrated steps: wear the dosimeter near the chest, activate it, monitor radiation, record the readings, analyze the data',
  },
  visualAcuity: {
    src: '/measure/visual-acuity.jpeg',
    title: 'How to measure visual acuity',
    alt: 'Illustration of a Snellen chart test at 6 meters (20 feet) with the visual axis, and a close-up of the chart rows',
  },
};

export function getMeasureGuide(key: string): MeasureGuide | undefined {
  return measureGuides[key];
}

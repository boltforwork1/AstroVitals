import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Save } from 'lucide-react';
import type { DailyRecord } from '@/types/health';
import { indicators } from '@/data/indicators';
import { indicatorInfo } from '@/data/indicatorInfo';
import { getStatus } from '@/utils/status';
import { useRecords } from '@/context/RecordsContext';import NumberVitalField from '@/components/checkin/NumberVitalField';
import SleepSlider from '@/components/checkin/SleepSlider';
import MoodPicker from '@/components/checkin/MoodPicker';
import ExerciseField from '@/components/checkin/ExerciseField';
import ResultScreen from '@/components/checkin/ResultScreen';
import DemoTools from '@/components/checkin/DemoTools';

const HEART_RANGE: [number, number] = [20, 250];
const SYSTOLIC_RANGE: [number, number] = [60, 250];
const DIASTOLIC_RANGE: [number, number] = [30, 150];
const GLUCOSE_RANGE: [number, number] = [20, 600];
const TEMP_RANGE: [number, number] = [33, 43];
const SLEEP_RANGE: [number, number] = [0, 12];
const EXERCISE_RANGE: [number, number] = [0, 600];

interface FormState {
  heartRate: string;
  systolic: string;
  diastolic: string;
  glucose: string;
  temperature: string;
  sleep: number;
  mood: number;
  exercise: string;
  note: string;
}

function parseValue(raw: string): number | null {
  const n = Number(raw);
  return raw.trim() !== '' && Number.isFinite(n) ? n : null;
}

function outsideRange(value: number, range: [number, number]): boolean {
  return value < range[0] || value > range[1];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckIn() {
  const navigate = useNavigate();
  const { records, latestRecord, addRecord, updateRecord } = useRecords();

  const [form, setForm] = useState<FormState>(() => ({
    heartRate: String(latestRecord.heartRate),
    systolic: String(latestRecord.systolic),
    diastolic: String(latestRecord.diastolic),
    glucose: String(latestRecord.glucose),
    temperature: String(latestRecord.temperature),
    sleep: latestRecord.sleep,
    mood: latestRecord.mood,
    exercise: String(latestRecord.exercise),
    note: '',
  }));
  const [submitted, setSubmitted] = useState<DailyRecord | null>(null);
  const [prevScoreRecord, setPrevScoreRecord] = useState<DailyRecord | null>(null);

  const parsed = useMemo(
    () => ({
      heartRate: parseValue(form.heartRate),
      systolic: parseValue(form.systolic),
      diastolic: parseValue(form.diastolic),
      glucose: parseValue(form.glucose),
      temperature: parseValue(form.temperature),
      exercise: parseValue(form.exercise),
    }),
    [form]
  );

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {
      heartRate: null,
      systolic: null,
      diastolic: null,
      glucose: null,
      temperature: null,
      exercise: null,
      bpRelation: null,
    };

    if (parsed.heartRate === null) e.heartRate = 'Required';
    else if (outsideRange(parsed.heartRate, HEART_RANGE)) e.heartRate = `Must be ${HEART_RANGE[0]}–${HEART_RANGE[1]} bpm`;

    if (parsed.systolic === null) e.systolic = 'Required';
    else if (outsideRange(parsed.systolic, SYSTOLIC_RANGE)) e.systolic = `Must be ${SYSTOLIC_RANGE[0]}–${SYSTOLIC_RANGE[1]}`;

    if (parsed.diastolic === null) e.diastolic = 'Required';
    else if (outsideRange(parsed.diastolic, DIASTOLIC_RANGE)) e.diastolic = `Must be ${DIASTOLIC_RANGE[0]}–${DIASTOLIC_RANGE[1]}`;

    if (parsed.systolic !== null && parsed.diastolic !== null && !e.systolic && !e.diastolic) {
      if (parsed.systolic <= parsed.diastolic) {
        e.bpRelation = 'Systolic must be greater than diastolic';
      }
    }

    if (parsed.glucose === null) e.glucose = 'Required';
    else if (outsideRange(parsed.glucose, GLUCOSE_RANGE)) e.glucose = `Must be ${GLUCOSE_RANGE[0]}–${GLUCOSE_RANGE[1]}`;

    if (parsed.temperature === null) e.temperature = 'Required';
    else if (outsideRange(parsed.temperature, TEMP_RANGE)) e.temperature = `Must be ${TEMP_RANGE[0]}–${TEMP_RANGE[1]} °C`;

    if (parsed.exercise === null) e.exercise = 'Required';
    else if (outsideRange(parsed.exercise, EXERCISE_RANGE)) e.exercise = `Must be ${EXERCISE_RANGE[0]}–${EXERCISE_RANGE[1]} min`;

    return e;
  }, [parsed]);

  const isValid = Object.values(errors).every((err) => err === null);

  const sectionCompletion = useMemo(() => {
    const vitalFields = ['heartRate', 'systolic', 'diastolic', 'glucose', 'temperature'] as const;
    const vitalsDone = vitalFields.every((k) => parsed[k] !== null && !errors[k]);
    const sleepDone = outsideRange(form.sleep, SLEEP_RANGE) ? false : true;
    const moodDone = form.mood >= 1 && form.mood <= 5;
    const exerciseDone = parsed.exercise !== null && !errors.exercise;
    const done = [vitalsDone, sleepDone, moodDone, exerciseDone].filter(Boolean).length;
    return { done, total: 4 };
  }, [parsed, errors, form.sleep, form.mood]);

  const buildRecord = (): DailyRecord => {
    return {
      date: todayISO(),
      missionDay: latestRecord.missionDay + 1,
      heartRate: parsed.heartRate!,
      systolic: parsed.systolic!,
      diastolic: parsed.diastolic!,
      glucose: parsed.glucose!,
      temperature: parsed.temperature!,
      sleep: form.sleep,
      mood: form.mood,
      exercise: parsed.exercise!,
      radiationDose: Math.round((0.5 + Math.random() * 0.2) * 100) / 100,
    };
  };

  const handleSave = () => {
    if (!isValid) return;
    const alreadyCheckedInToday = latestRecord.date === todayISO();
    const record = buildRecord();
    if (alreadyCheckedInToday) {
      // Overwrite today's entry so the day is never double-counted.
      updateRecord(latestRecord.missionDay, { ...record, missionDay: latestRecord.missionDay });
    } else {
      addRecord(record);
    }
    setPrevScoreRecord(latestRecord);
    setSubmitted(record);
  };

  const section = (title: string, children: React.ReactNode, done: boolean, index: number) => (
    <section
      className="bg-space-surface border border-space-border rounded-xl p-5 sm:p-6"
      aria-label={title}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-space-muted uppercase tracking-wider">
          {index}. {title}
        </h2>
        <span
          className={`w-2 h-2 rounded-full ${done ? 'bg-status-normal shadow-[0_0_6px_var(--color-normal)]' : 'bg-space-border'}`}
        />
      </div>
      {children}
    </section>
  );

  if (submitted) {
    return (
      <ResultScreen
        record={submitted}
        previousRecord={prevScoreRecord}
        onGoDashboard={() => navigate('/dashboard')}
        onGoBodyMap={() => navigate('/body-map')}
        onEdit={() => setSubmitted(null)}
      />
    );
  }

  const progress = (sectionCompletion.done / sectionCompletion.total) * 100;
  const alreadyCheckedInToday = latestRecord.date === todayISO();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16">
      {/* Sticky header + progress */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-3 bg-space-bg/90 backdrop-blur-sm">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-space-text">
          Daily Check-in
        </h1>
        <p className="text-sm text-space-muted mt-0.5 mb-3">Takes about 60 seconds</p>
        <div className="h-1 rounded-full bg-space-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-space-muted mt-1.5">
          {sectionCompletion.done} of {sectionCompletion.total} sections complete · Pre-filled from yesterday
        </p>
      </div>

      {alreadyCheckedInToday && (
        <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-status-caution/10 border border-status-caution/30">
          <AlertTriangle className="w-4 h-4 text-status-caution shrink-0 mt-0.5" />
          <p className="text-xs text-space-text leading-relaxed">
            You already checked in today — saving will update it.
          </p>
        </div>
      )}

      <div className="mt-5 space-y-5">
        {section('Vitals', (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
            <NumberVitalField
              id="heartRate"
              label="Heart rate"
              unit="bpm"
              value={form.heartRate}
              error={errors.heartRate}
              status={
                errors.heartRate || parsed.heartRate === null
                  ? null
                  : getStatus('heartRate', parsed.heartRate)
              }
              measure={indicatorInfo.heartRate.measure}
              onChange={(v) => setForm((f) => ({ ...f, heartRate: v }))}
            />
            <NumberVitalField
              id="systolic"
              label="Systolic BP"
              unit="mmHg"
              value={form.systolic}
              error={errors.systolic ?? errors.bpRelation}
              status={
                (errors.systolic || errors.bpRelation) || parsed.systolic === null
                  ? null
                  : getStatus('systolic', parsed.systolic)
              }
              measure={indicatorInfo.systolic.measure}
              onChange={(v) => setForm((f) => ({ ...f, systolic: v }))}
            />
            <NumberVitalField
              id="diastolic"
              label="Diastolic BP"
              unit="mmHg"
              value={form.diastolic}
              error={errors.diastolic ?? errors.bpRelation}
              status={
                (errors.diastolic || errors.bpRelation) || parsed.diastolic === null
                  ? null
                  : getStatus('diastolic', parsed.diastolic)
              }
              measure={indicatorInfo.diastolic.measure}
              onChange={(v) => setForm((f) => ({ ...f, diastolic: v }))}
            />
            <NumberVitalField
              id="glucose"
              label="Blood glucose"
              unit="mg/dL"
              value={form.glucose}
              error={errors.glucose}
              status={
                errors.glucose || parsed.glucose === null
                  ? null
                  : getStatus('glucose', parsed.glucose)
              }
              measure={indicatorInfo.glucose.measure}
              onChange={(v) => setForm((f) => ({ ...f, glucose: v }))}
            />
            <NumberVitalField
              id="temperature"
              label="Body temperature"
              unit="°C"
              step="0.1"
              value={form.temperature}
              error={errors.temperature}
              status={
                errors.temperature || parsed.temperature === null
                  ? null
                  : getStatus('temperature', parsed.temperature)
              }
              measure={indicatorInfo.temperature.measure}
              onChange={(v) => setForm((f) => ({ ...f, temperature: v }))}
            />
          </div>
        ), sectionCompletion.done >= 1, 1)}

        {section('Sleep', (
          <SleepSlider
            value={form.sleep}
            status={getStatus('sleep', form.sleep)}
            onChange={(v) => setForm((f) => ({ ...f, sleep: v }))}
          />
        ), sectionCompletion.done >= 2, 2)}

        {section('Mood', (
          <MoodPicker
            value={form.mood}
            status={getStatus('mood', form.mood)}
            onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
          />
        ), sectionCompletion.done >= 3, 3)}

        {section('Exercise', (
          <ExerciseField
            id="exercise"
            value={form.exercise}
            error={errors.exercise}
            status={parsed.exercise === null ? 'critical' : getStatus('exercise', parsed.exercise)}
            onChange={(v) => setForm((f) => ({ ...f, exercise: v }))}
          />
        ), sectionCompletion.done >= 4, 4)}

        {section('Note (optional)', (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-note" className="text-sm font-medium text-space-text">
              Anything to flag for the flight surgeon?
            </label>
            <textarea
              id="checkin-note"
              value={form.note}
              maxLength={200}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              className="w-full rounded-xl bg-space-bg/60 border border-space-border focus:border-accent/50 px-4 py-3 text-sm text-space-text placeholder-space-muted/60 resize-none outline-none transition-colors"
              placeholder="Symptoms, sleep quality, stress levels, equipment issues…"
            />
            <span className="self-end text-[11px] text-space-muted tabular-nums">
              {form.note.length}/200
            </span>
          </div>
        ), true, 5)}
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-space-bg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Save className="w-4 h-4" />
          Save check-in
        </button>
        {!isValid && (
          <p className="text-xs text-space-muted text-center mt-2">
            Fix the highlighted fields to enable saving.
          </p>
        )}
      </div>

      <div className="mt-8">
        <DemoTools />
      </div>
    </div>
  );
}

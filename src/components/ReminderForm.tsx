import { Controller, useForm } from 'react-hook-form'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'

import { INTERVAL_UNITS, IntervalUnit } from '@/src/models/IntervalUnit'
import { ReminderInput } from '@/src/models/ReminderItem'
import { validateReminder } from '@/src/utils/validation'

type FormValues = {
  title: string
  memo: string
  lastPerformedDate: string
  intervalValue: string
  intervalUnit: IntervalUnit
  repeatEnabled: boolean
}

type Props = {
  defaultValues: FormValues
  submitLabel: string
  isSubmitting: boolean
  onSubmit: (input: ReminderInput) => Promise<void>
}

const UNIT_LABELS = { WEEK: '週間', MONTH: 'ヶ月', YEAR: '年' } as const

export function ReminderForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: Props) {
  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({ defaultValues })

  const submit = handleSubmit(async (values) => {
    const input: ReminderInput = {
      ...values,
      memo: values.memo,
      intervalValue: Number(values.intervalValue),
    }
    const validationErrors = validateReminder(input)

    if (Object.keys(validationErrors).length > 0) {
      for (const [field, message] of Object.entries(validationErrors)) {
        setError(field as keyof FormValues, { message })
      }
      return
    }

    await onSubmit(input)
  })

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>項目名</Text>
      <Controller control={control} name="title" render={({ field }) => (
        <TextInput {...field} maxLength={30} onChangeText={field.onChange} placeholder="例：歯ブラシ交換" style={styles.input} />
      )} />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

      <Text style={styles.label}>前回実施日</Text>
      <Controller control={control} name="lastPerformedDate" render={({ field }) => (
        <TextInput {...field} autoCapitalize="none" onChangeText={field.onChange} placeholder="YYYY-MM-DD" style={styles.input} />
      )} />
      {errors.lastPerformedDate && <Text style={styles.error}>{errors.lastPerformedDate.message}</Text>}

      <Text style={styles.label}>通知間隔</Text>
      <View style={styles.intervalRow}>
        <Controller control={control} name="intervalValue" render={({ field }) => (
          <TextInput {...field} keyboardType="number-pad" onChangeText={field.onChange} style={[styles.input, styles.numberInput]} />
        )} />
        <Controller control={control} name="intervalUnit" render={({ field }) => (
          <View style={styles.units}>
            {INTERVAL_UNITS.map((unit) => (
              <Pressable key={unit} onPress={() => field.onChange(unit)} style={[styles.unit, field.value === unit && styles.unitSelected]}>
                <Text>{UNIT_LABELS[unit]}</Text>
              </Pressable>
            ))}
          </View>
        )} />
      </View>
      {errors.intervalValue && <Text style={styles.error}>{errors.intervalValue.message}</Text>}

      <Text style={styles.label}>メモ</Text>
      <Controller control={control} name="memo" render={({ field }) => (
        <TextInput {...field} maxLength={200} multiline onChangeText={field.onChange} style={[styles.input, styles.memo]} />
      )} />
      {errors.memo && <Text style={styles.error}>{errors.memo.message}</Text>}

      <Controller control={control} name="repeatEnabled" render={({ field }) => (
        <View style={styles.switchRow}>
          <Text style={styles.label}>繰り返し</Text>
          <Switch onValueChange={field.onChange} value={field.value} />
        </View>
      )} />

      <Pressable disabled={isSubmitting} onPress={submit} style={[styles.submit, isSubmitting && styles.disabled]}>
        <Text style={styles.submitText}>{isSubmitting ? '保存中…' : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, backgroundColor: '#fff' },
  label: { marginTop: 8, fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  intervalRow: { flexDirection: 'row', gap: 8 },
  numberInput: { width: 80 },
  units: { flex: 1, flexDirection: 'row', gap: 6 },
  unit: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  unitSelected: { backgroundColor: '#fbbc04', borderColor: '#e0a800' },
  memo: { minHeight: 96, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { color: '#b00020' },
  submit: { alignItems: 'center', marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: '#fbbc04' },
  submitText: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
})

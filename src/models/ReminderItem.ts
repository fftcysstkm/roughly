import { IntervalUnit } from './IntervalUnit'

export type ReminderItem = {
  id: string
  title: string
  memo: string | null
  lastPerformedDate: string
  intervalValue: number
  intervalUnit: IntervalUnit
  repeatEnabled: boolean
  nextNotificationDate: string | null
  snoozedUntil: string | null
  createdAt: string
  updatedAt: string
}

export type ReminderInput = Pick<
  ReminderItem,
  'title' | 'memo' | 'lastPerformedDate' | 'intervalValue' | 'intervalUnit' | 'repeatEnabled'
>

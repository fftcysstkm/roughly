import * as DocumentPicker from 'expo-document-picker'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import * as reminderRepository from '@/src/db/reminderRepository'
import { ReminderItem } from '@/src/models/ReminderItem'
import { rescheduleAllNotifications } from '@/src/services/notificationService'
import { getTodayDate } from '@/src/utils/dateUtils'
import { validateBackupJson } from '@/src/utils/backupValidation'

export type ImportMode = 'ADD' | 'REPLACE'

export async function exportBackup(): Promise<number> {
  if (!await Sharing.isAvailableAsync()) {
    throw new Error('この端末では共有機能を利用できません')
  }

  const reminders = await reminderRepository.findAll()
  const file = new File(Paths.cache, `roughly-backup-${getTodayDate()}.json`)
  file.create({ overwrite: true })
  file.write(JSON.stringify(reminders, null, 2))

  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Roughlyのバックアップを保存',
    mimeType: 'application/json',
    UTI: 'public.json',
  })
  return reminders.length
}

export async function selectBackupFile(): Promise<ReminderItem[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  })
  if (result.canceled) return null

  const asset = result.assets[0]
  if (!asset) {
    throw new Error('ファイルを読み込めませんでした')
  }
  if (asset.size !== undefined && asset.size > 5 * 1024 * 1024) {
    throw new Error('バックアップファイルは5MB以下にしてください')
  }

  const text = await new File(asset.uri).text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('有効なJSONファイルではありません')
  }

  return validateBackupJson(json)
}

export async function importBackup(reminders: ReminderItem[], mode: ImportMode): Promise<number> {
  const insertedCount = await reminderRepository.insertMany(reminders, mode)
  await rescheduleAllNotifications(await reminderRepository.findAll())
  return insertedCount
}

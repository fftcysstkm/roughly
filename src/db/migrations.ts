import { SQLiteDatabase } from 'expo-sqlite'

const DATABASE_VERSION = 1

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  const currentVersion = result?.user_version ?? 0

  if (currentVersion >= DATABASE_VERSION) {
    return
  }

  await database.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await database.execAsync(`
        CREATE TABLE reminder_items (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          memo TEXT,
          last_performed_date TEXT NOT NULL,
          interval_value INTEGER NOT NULL CHECK (interval_value >= 1),
          interval_unit TEXT NOT NULL CHECK (interval_unit IN ('WEEK', 'MONTH', 'YEAR')),
          repeat_enabled INTEGER NOT NULL CHECK (repeat_enabled IN (0, 1)),
          next_notification_date TEXT,
          snoozed_until TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX reminder_items_next_notification_date_idx
          ON reminder_items(next_notification_date);
      `)
    }

    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`)
  })
}

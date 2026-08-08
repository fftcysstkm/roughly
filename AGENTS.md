# AGENTS.md

このリポジトリでは、以下の方針に従って実装すること。

## 1. まず読むもの

実装前に必ず以下を読む。

- `docs/REQUIREMENTS.md`

仕様と実装が競合する場合は、原則として`docs/REQUIREMENTS.md`を優先する。

不明点があっても、MVPの目的に沿って最小・単純な実装を優先する。

---

## 2. 技術スタック

- React Native
- Expo
- TypeScript
- Expo Router
- expo-sqlite
- expo-notifications
- expo-crypto
- date-fns
- expo-file-system
- expo-document-picker
- expo-sharing
- react-hook-form

Expo関連パッケージは、原則としてExpo SDKと互換性のあるバージョンを使用する。

---

## 3. 実装方針

過剰な抽象化を避ける。

このアプリは小規模なMVPであり、DDDやClean Architectureを厳密に導入しない。

ただし、以下の責務分離は守る。

```text
Screen
  ↓
Hook
  ↓
Service
  ↓
Repository
  ↓
SQLite
```

必要に応じてScreenからServiceを直接使用してもよいが、ScreenにSQLや複雑なビジネスロジックを書かない。

---

## 4. appディレクトリ

`app/`は基本的に画面とルーティングだけを担当する。

想定構成：

```text
app/
├── _layout.tsx
├── index.tsx
├── reminders/
│   ├── new.tsx
│   ├── [id].tsx
│   └── [id]/
│       └── edit.tsx
└── settings/
    └── index.tsx
```

画面内にDBアクセス処理を直接書かない。

---

## 5. DBアクセス

SQLは原則として`src/db/`に集約する。

```text
src/db/
├── database.ts
├── migrations.ts
└── reminderRepository.ts
```

`reminderRepository.ts`は以下のようなCRUDを担当する。

- findAll
- findById
- search
- insert
- update
- deleteById
- deleteAll

ScreenやComponentから直接SQLを書かない。

---

## 6. Service

ビジネスロジックは`src/services/`に置く。

主なService：

```text
reminderService.ts
notificationService.ts
backupService.ts
```

### reminderService

以下のような操作を担当する。

- createReminder
- updateReminder
- completeReminder
- deleteReminder

特に`completeReminder`では以下をまとめて行う。

1. Reminder取得
2. 前回実施日更新
3. 次回通知日計算
4. snoozedUntil解除
5. DB更新
6. 既存通知キャンセル
7. 必要なら新しい通知を予約

---

## 7. 日付ロジック

日付計算は`src/utils/dateUtils.ts`に集約する。

画面やRepositoryに日付計算ロジックを分散させない。

例：

```ts
calculateNextNotificationDate(
  performedDate,
  intervalValue,
  intervalUnit
)

getRemainingDays(nextNotificationDate)
```

`date-fns`を使う場合も、可能な限り`dateUtils.ts`経由で使用する。

---

## 8. モデル

アプリ内で扱う型は`src/models/`に置く。

例：

```text
ReminderItem.ts
IntervalUnit.ts
```

`IntervalUnit`は以下のいずれかとする。

```text
WEEK
MONTH
YEAR
```

---

## 9. UI

MVPではUIライブラリを導入しない。

基本的にReact Native標準コンポーネントを使用する。

- View
- Text
- TextInput
- Pressable
- FlatList
- Modal
- Switch

見た目よりも、まず機能と操作性を優先する。

Google Keep風のシンプルな一覧を目指す。

---

## 10. 状態管理

MVPでは以下の状態管理ライブラリを導入しない。

- Redux
- Zustand
- Recoil

ローカル状態は`useState`等を使用する。

一覧取得など、再利用する処理は必要に応じてcustom hookへ切り出す。

例：

```text
useReminders.ts
```

---

## 11. ネットワーク通信

MVPではサーバー通信を行わない。

そのため以下は導入しない。

- Axios
- TanStack Query
- Firebase
- Supabase

---

## 12. バリデーション

MVPではZodは使用しない。

`react-hook-form`のvalidationまたは単純なvalidation関数で対応する。

条件：

- title: 1〜30文字、空白のみ不可
- memo: 0〜200文字
- lastPerformedDate: 必須、未来日は原則不可
- intervalValue: 1以上
- intervalUnit: WEEK / MONTH / YEAR

---

## 13. バックアップ

JSON形式を使用する。

CSVは使用しない。

バックアップ処理は`backupService.ts`に集約する。

エクスポート：

```text
SQLite
↓
JSON
↓
ファイル作成
↓
OS共有画面
```

インポート：

```text
ファイル選択
↓
JSON読み込み
↓
validation
↓
追加 または 全置換
```

---

## 14. 通知

サーバーPushは使用しない。

`expo-notifications`によるローカル通知のみ使用する。

通知時刻は全リマインダー共通。

スヌーズは以下をサポートする。

- 明日
- 3日後
- 1週間後

スヌーズしても`nextNotificationDate`は変更しない。

`snoozedUntil`として別管理する。

---

## 15. コーディングスタイル

- TypeScriptを使用する
- 読みやすさを優先する
- 不必要に高度な書き方をしない
- 長く複雑な関数は責務ごとに分ける
- 画面コンポーネントを巨大化させない
- 不要なtry/catchを増やさない
- エラーを握り潰さない
- `console.log`を本番ロジックとして多用しない
- 過度なワンライナーやネストを避ける

2スペースインデントを使用する。

セミコロンは必須としない。

---

## 16. 依存関係追加

新しいnpmパッケージを追加する前に、

1. React Native / Expo標準機能で代替できないか確認する
2. 既存依存で実現できないか確認する
3. 本当に必要な場合だけ追加する

特に以下は勝手に追加しない。

- Redux
- Zustand
- Recoil
- Axios
- TanStack Query
- Zod
- React Native Paper
- NativeWind
- Tamagui
- Firebase
- Supabase
- Prisma
- Drizzle

必要になった場合は、追加理由を明確にする。

---

## 17. DBマイグレーション

DB初期化・スキーマ変更は`migrations.ts`で管理する。

アプリ起動時に、必要なマイグレーションのみを安全に実行できる構成にする。

将来的なカラム追加を考慮し、単純な`CREATE TABLE IF NOT EXISTS`だけに依存しすぎない。

---

## 18. テスト優先箇所

すべてを大量にテストする必要はない。

最低限、以下の純粋ロジックはテストしやすい構成にする。

- 次回通知日の計算
- 残り日数／超過日数の計算
- 月末の日付計算
- バリデーション
- バックアップJSONのvalidation

特に以下のケースを考慮する。

```text
1月31日 + 1ヶ月
うるう年の2月
年またぎ
期限当日
期限超過
繰り返しOFF
```

---

## 19. MVP対象外

`docs/REQUIREMENTS.md`に記載されたMVP対象外機能は、明示的な指示がない限り実装しない。

特に以下を勝手に追加しない。

- 履歴
- アカウント
- クラウド同期
- サーバーAPI
- カテゴリ
- タグ
- 添付画像
- AI機能
- 複数端末同期
- 複雑な通知ルール

---

## 20. Codexでの作業開始時

作業開始時は、すぐに大量実装せず以下の順に進める。

1. `docs/REQUIREMENTS.md`を読む
2. 既存ファイル・package.jsonを確認する
3. 現在の実装状況を確認する
4. 要件との差分を整理する
5. 小さな単位で実装する
6. 各段階で型チェック・lint・テスト・Expo起動確認を可能な範囲で行う

既存コードを尊重し、不必要な全面書き換えを避ける。

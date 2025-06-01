# emoji-pull-pal

## 概要

**emoji-pull-pal** は、GitHubのプルリクエストやコメントに対して、絵文字リアクションを簡単に付与・集計できるWebアプリです。  
GitHub認証を利用し、全ての公式リアクション（👍 👎 😄 😕 ❤️ 🎉 🚀 👀）に対応しています。

## 主な機能

- GitHubリポジトリのプルリクエスト一覧・詳細表示
- プルリクエストやコメントへの絵文字リアクション付与
- 各リアクションの集計表示
- GitHubアカウントによる認証（Supabase連携）
- 検索・ソート機能

## 利用方法

### 1. 必要な環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を記載してください。

```
VITE_SUPABASE_URL=（あなたのSupabaseプロジェクトURL）
VITE_SUPABASE_PUBLISHABLE_KEY=（あなたのSupabase公開鍵）
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開いて動作を確認できます。

### 4. Supabaseの設定

Supabaseの「Authentication > URL Configuration」で、以下のRedirect URLsを必ず登録してください。

- `http://localhost:5173/auth/callback`
- `https://emoji-pull-pal.vercel.app/auth/callback`（本番用）

### 5. Vercelへのデプロイ

Vercelの環境変数設定画面で、`.env` と同じ内容を登録してください。

---

## 技術スタック

- フロントエンド: React, TypeScript, Vite
- UI: Lucide React, Tailwind CSS
- バックエンド: Supabase（認証のみ）
- GitHub REST API v3

---

## 注意事項

- GitHubのリアクション機能を利用するには、GitHubアカウントでのログインが必要です。
- Supabaseの無料枠には制限があります。大量アクセス時はご注意ください。

---

## ライセンス

このプロジェクトはMITライセンスで公開されています。

---

ご不明点やバグ報告はIssueまでお願いします。

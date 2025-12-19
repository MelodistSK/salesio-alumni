# サレジオ同窓会 進捗管理システム

静岡サレジオ同窓会の進捗管理Webアプリケーション

## 機能

- 📅 **年間スケジュール**: イベント一覧とメモ機能
- 📖 **同窓会誌管理**: ページ数調整、ドラッグ&ドロップ並び替え、カラーページ表示
- 💡 **改善ポイント**: 実装目標期日とステータス管理
- 📋 **用語集**: サレジアンファミリー関連用語と組織図

## セットアップ手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `salesio-alumni` など任意の名前を入力
4. Google Analytics は無効でOK（お好みで）
5. 「プロジェクトを作成」をクリック

### 2. Firestoreデータベースの有効化

1. Firebase Console で作成したプロジェクトを開く
2. 左メニューの「構築」→「Firestore Database」をクリック
3. 「データベースを作成」をクリック
4. **「テストモードで開始」** を選択（後でルール変更推奨）
5. ロケーション: `asia-northeast1`（東京）を選択
6. 「有効にする」をクリック

### 3. Webアプリの登録

1. Firebase Console のプロジェクト概要ページ
2. 「ウェブ」アイコン（</>）をクリック
3. アプリのニックネーム: `salesio-alumni-web` など
4. 「このアプリの Firebase Hosting も設定します」はチェック不要
5. 「アプリを登録」をクリック
6. 表示される設定情報をコピー

### 4. 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下の形式でFirebaseの設定を記入:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=salesio-alumni.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=salesio-alumni
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=salesio-alumni.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 5. ローカル開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 6. Vercelへのデプロイ

#### GitHubリポジトリの作成

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/salesio-alumni.git
git push -u origin main
```

#### Vercelでデプロイ

1. [Vercel](https://vercel.com/) にログイン（GitHubアカウントで）
2. 「Import Project」をクリック
3. GitHubリポジトリを選択
4. 「Environment Variables」で以下を追加:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. 「Deploy」をクリック

## Firestore セキュリティルール（推奨）

運用開始後は以下のルールに変更してください:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 全てのドキュメントに対して読み書きを許可
    // URLを知っている人のみアクセス可能なので、認証なしでOK
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 技術スタック

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Drag & Drop**: dnd-kit

## ファイル構成

```
src/
├── app/
│   ├── page.tsx          # スケジュール（メイン）
│   ├── magazine/page.tsx # 同窓会誌
│   ├── improvements/page.tsx # 改善ポイント
│   └── glossary/page.tsx # 用語集
├── components/
│   └── Navigation.tsx    # ナビゲーション
├── lib/
│   ├── firebase.ts       # Firebase設定
│   ├── api.ts            # API関数
│   └── initialData.ts    # 初期データ
└── types/
    └── index.ts          # 型定義
```

## 初期データについて

アプリ起動時に各コレクションが空の場合、`initialData.ts` のデータが自動投入されます。

---

Made with ❤️ for サレジオ同窓会

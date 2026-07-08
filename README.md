# 空き講義室 Explorer

東京科学大学の大岡山講義室の空き状況を、Svelte + Vite+ で見やすく再構成するアプリです。開発中は Vite Proxy、本番は Caddy が静的サイト配信と CORS 対策プロキシを担当し、フロントエンドは同一 origin の `/api/facility/DayList.aspx` から単日分を取得します。

## セットアップ

```bash
pnpm install
pnpm run dev
```

`dev` は Vite+ の HMR と Vite Proxy を使います。

本番相当の Caddy をローカルで使う場合は、Caddy をインストールしたうえで次を実行します。

```bash
pnpm run caddy:run
```

Docker image で動かす場合は次を使います。

```bash
pnpm run docker:build
docker run --rm -p 8787:8787 free-lecture-room-explorer
```

Dockerfile は `certs/` 配下の CA 証明書を image の trust store に追加するため、Caddy 側で insecure な upstream 通信は使いません。

## コマンド

```bash
pnpm run dev
pnpm run frontend:dev
pnpm run check
pnpm run test
pnpm run build
pnpm run caddy:run
pnpm run docker:build
```

`dev` / `frontend:dev` / `build` は Vite+ の `vp` コマンドを使います。`caddy:run` は `dist` を作ってから `Caddyfile` で配信します。`test` はフロントエンドのユニットテストを実行します。

## 構成

- 配信: Caddy が `dist` を配り、実ファイルがない URL は `index.html` へ戻します。
- フロントエンド: Svelte state -> query builder -> same-origin proxy fetch -> DOMParser -> compact availability UI.
- Caddy proxy: `/api/facility/DayList.aspx?...` を受け取り、元サイトの `/fr/Common/FacilityReservation/DayList.aspx?...` へ転送します。
- Vite proxy: 開発中だけ `/api/facility/DayList.aspx?...` を元サイトへ中継します。
- コンポーネント: 汎用 UI は `src/components/`、予約探索の画面部品は `src/features/facility-explorer/` に分けています。
- ロジック: URL 組み立て、HTML 解析、空き時間フィルタ、状態遷移は `.ts` に分離してテストします。

## 環境変数

- `PORT`: Caddy の listen port。既定値は `8787`。
- `STATIC_ROOT`: Caddy が配信する静的ファイルのディレクトリ。既定値は Docker image 向けの `/srv/app`。
- `FACILITY_CA_G7_CERT`: Caddy upstream TLS 検証で使う G7 中間 CA。既定値は `certs/nii-open-domain-ca-g7-rsa.crt`。
- `FACILITY_ROOT_CA_CERT`: Caddy upstream TLS 検証で使う RootCA2。既定値は `certs/secom-security-communication-rootca2.crt`。
- `VITE_FACILITY_PROXY_URL`: フロントエンドが使う proxy endpoint。既定値は `/api/facility`。

## 元サイトの挙動メモ

- このアプリでは分類 ID `3` の `講義室[大岡山]` だけを扱います。
- 単日表示の `DayList.aspx` だけを使います。
- Ajax endpoint の分類 ID は `b=3` です。
- Ajax endpoint の `date` は `yyyymmdd` 形式です。

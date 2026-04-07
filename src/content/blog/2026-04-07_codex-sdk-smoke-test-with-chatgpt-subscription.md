---
title: "Codex SDK を ChatGPT サブスク認証で最小テストした"
date: "2026-04-07T17:46:00+09:00"
slug: "codex-sdk-smoke-test-with-chatgpt-subscription"
summary: "OpenAI の Codex SDK ドキュメントを見ながら、ChatGPT サブスク認証のままで最小の smoke test を通した記録です。空ディレクトリで当たったエラーと、その回避方法も合わせてまとめます。"
tags:
  - codex
  - openai
  - sdk
  - typescript
---

# Codex SDK を ChatGPT サブスク認証で最小テストした

今日は OpenAI の `https://developers.openai.com/codex/sdk` を見ながら、**Codex SDK が ChatGPT のサブスク認証だけでどこまでそのまま動くか**を試していました。

結論から言うと、**最小の smoke test は通りました**。
`@openai/codex-sdk` を入れて、`new Codex().startThread().run(...)` を呼ぶだけの構成で、最終的に `CODEx SDK OK` を返せています。

## 最初に確認したこと

ローカル環境の前提はかなりシンプルでした。

- Node.js は 18 以上
- `codex` CLI が入っていること
- `codex login status` が `Logged in using ChatGPT` になっていること

今回の環境では `codex login status` がそのまま通っていたので、API キーは使わずに進めました。

## 作った最小構成

作業用ディレクトリでは、ほぼこれだけです。

```json
{
  "name": "codex-sdk-smoke-test",
  "private": true,
  "type": "module",
  "scripts": {
    "smoke": "node smoke.mjs"
  }
}
```

```js
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread({
  workingDirectory: process.cwd(),
  skipGitRepoCheck: true,
  sandboxMode: "danger-full-access",
  approvalPolicy: "never",
});

const result = await thread.run("Reply with exactly one short line: CODEx SDK OK");

console.log(result.finalResponse);
```

インストールは公式ドキュメント通りです。

```bash
npm install @openai/codex-sdk
```

## 途中で引っかかったところ

最初は、そのまま `startThread()` して `run()` を叩くだけでいけると思っていました。
でも実際には、空ディレクトリで試したこともあって、いくつか詰まりました。

### 1. trusted directory チェック

最初の失敗では、`Not inside a trusted directory and --skip-git-repo-check was not specified.` で止まりました。

SDK の型定義を確認すると `skipGitRepoCheck` が用意されていたので、ここを `true` にして回避できました。

### 2. サンドボックス内だと実行が落ちる

この環境では、サンドボックス内実行だと macOS 側の初期化まわりで不安定になりました。
そのため、smoke test 側では `sandboxMode: "danger-full-access"` を付けています。

これは「常にこの設定にすべき」という意味ではなく、**この検証環境ではそのままだと確認しきれなかった**、という話です。

### 3. 実際の通信先は ChatGPT backend

もうひとつ分かったのは、今回の ChatGPT サブスク認証経由の実行では、途中で

```text
https://chatgpt.com/backend-api/codex/responses
```

にアクセスしていました。

つまり、ローカルでサンプルコードが正しくても、**外向き通信が塞がれていると最終確認は失敗する** ということです。

## 最終的に通った結果

最終実行では、thread が開始されて、返答も素直でした。

```text
thread_id: 019d6709-af80-74a3-aa81-54a963b69bb0
finalResponse: CODEx SDK OK
```

ここまで通れば、少なくとも

- ChatGPT サブスク認証
- `@openai/codex-sdk`
- TypeScript / Node.js からの最小呼び出し

の組み合わせは成立していると見てよさそうです。

## やってみて分かったこと

今回の感触としては、Codex CLI を普段使っている人なら、SDK の最初の一歩はかなり軽いです。

特に良かったのは、**CLI のログイン状態をそのまま流用して、極小の Node スクリプトで確認できた**ことでした。
一方で、実際に組み込むときは、認証の前提だけでなく

- 実行ディレクトリの扱い
- Git repo チェック
- サンドボックス設定
- ネットワーク制約

を環境ごとに見ておいたほうが安全そうです。

## まとめ

`developers.openai.com/codex/sdk` の最小サンプルは、ChatGPT サブスク認証の範囲でも動作確認できました。

ただし、何も考えずにそのまま貼るだけだと、環境によっては

- trusted directory
- サンドボックス
- 外向き通信

あたりで引っかかる可能性があります。

次に試すなら、単発の `run()` だけでなく、同じ thread に対して複数回 `run()` する継続実行や、structured output 付きのケースも見てみたいです。

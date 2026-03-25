# ChatCerdas - AI Chat Interface

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

ChatCerdas adalah antarmuka chat AI berbasis Anthropic API yang dibangun menggunakan React 18 dan Tailwind CSS. Demo ini menampilkan integrasi langsung dengan model `claude-sonnet-4-6` melalui browser, dilengkapi dengan panel arsitektur yang menjelaskan implementasi production menggunakan Node.js dan Next.js.

## Tech Stack

- React 18 via CDN + Babel Standalone
- Tailwind CSS
- Anthropic API (model: claude-sonnet-4-6)
- localStorage

## Fitur

- Chat interface dengan bubble messages user dan AI
- Typewriter effect pada setiap response AI
- Settings panel: input API key dengan toggle show/hide
- System prompt customization
- Conversation history dikirim setiap request untuk konteks penuh
- Auto-scroll ke pesan terbaru
- Copy pesan ke clipboard
- Character counter pada input (maks 4000 karakter)
- Loading indicator animated saat menunggu response
- Error handling dengan pesan jelas (API key salah, rate limit, network error)
- Hapus percakapan dengan konfirmasi modal
- Tab Architecture: penjelasan Next.js dan Node.js production setup
- localStorage untuk simpan API key dan system prompt
- Responsive layout dengan mobile sidebar overlay
- Keyboard shortcut: Enter untuk kirim, Shift+Enter untuk baris baru

## Cara Pakai

1. Buka halaman demo
2. Di panel Settings, masukkan Anthropic API key (format: `sk-ant-api03-...`)
3. Opsional: ubah system prompt sesuai kebutuhan
4. Ketik pesan dan tekan Enter atau klik tombol kirim
5. Response AI akan muncul dengan typewriter effect

## Catatan

API key disimpan di localStorage browser. Untuk implementasi production, gunakan server-side API route (Next.js atau Node.js + Express) agar API key tidak terekspos ke client. Detail arsitektur tersedia di tab Architecture pada sidebar.
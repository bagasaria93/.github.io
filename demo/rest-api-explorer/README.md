# APIJelajah - REST API Explorer

Demo project by Bagas Aria Sativa - Portfolio Demo
https://bagasaria93.github.io

---

## Deskripsi

APIJelajah adalah tool eksplorasi dan testing public REST API berbasis browser. Dirancang dengan aesthetic terminal/hacker dark menggunakan aksen neon green. Tool ini mendemonstrasikan kemampuan REST API integration, JSON parsing, dan dynamic UI dengan Vanilla JavaScript.

---

## Fitur

- 4 public API terintegrasi: JSONPlaceholder, Open-Meteo (cuaca kota Indonesia), RestCountries, Nationalize.io
- Syntax highlighting JSON response via highlight.js
- Response time indicator realtime dengan color coding (hijau/kuning/merah)
- Status code badge berwarna (2xx, 3xx, 4xx, 5xx)
- Request history via localStorage (maksimal 20 request terakhir)
- Copy response JSON ke clipboard dengan feedback toast
- TypeScript-style type annotation auto-generated dari response
- Tab navigator: Request, Response, Headers, Types
- Loading skeleton saat fetch berlangsung
- Error handling dengan pesan jelas (CORS, network error, dll)
- Scan line animation saat request berlangsung
- Responsive layout dengan mobile sidebar dan overlay
- Semua event handler via addEventListener
- Enter key untuk trigger Send dari input URL

---

## API yang Tersedia

| API | Keterangan |
|-----|------------|
| JSONPlaceholder | Fake REST API untuk testing (posts, users, todos, comments) |
| Open-Meteo | Cuaca realtime kota Indonesia tanpa API key |
| RestCountries | Data lengkap negara-negara dunia |
| Nationalize.io | Prediksi nasionalitas berdasarkan nama, termasuk nama Indonesia |

---

## Tech Stack

- HTML5, CSS3
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- Highlight.js 11.9.0
- localStorage (request history persistence)
- Fetch API (native browser)
- Google Fonts: JetBrains Mono

---

## Skills Demonstrated

- REST API Development & Integration
- JavaScript (Fetch API, async/await, error handling)
- TypeScript concept (interface auto-generation)
- JSON parsing dan manipulasi
- Tailwind CSS
- Responsive Web Design
- localStorage persistence
- Dynamic UI rendering
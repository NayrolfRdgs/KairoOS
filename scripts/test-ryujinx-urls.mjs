import https from 'https';
import http from 'http';

const urls = [
  'https://archive.org/download/ryujinx-1.1.1403/ryujinx-1.1.1403-win_x64.zip',
  'https://archive.org/download/ryujinx-archive/ryujinx-1.1.1403-win_x64.zip',
  'https://github.com/nicoboss/Ryujinx/releases/download/1.1.1403/ryujinx-1.1.1403-win_x64.zip',
  'https://github.com/Ryubing/Ryujinx/releases/download/1.2.86/ryujinx-1.2.86-win_x64.zip',
  'https://github.com/GreemDev/Ryujinx/releases/download/1.1.1403/ryujinx-1.1.1403-win_x64.zip'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    });
    req.on('error', (e) => resolve({ url, error: e.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, error: 'Timeout' }); });
    req.end();
  });
}

async function main() {
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(res);
  }
}

main();

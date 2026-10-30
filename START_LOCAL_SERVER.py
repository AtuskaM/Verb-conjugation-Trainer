"""Start a private local web server for index.html in this folder."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

FOLDER = Path(__file__).resolve().parent
HOST = '127.0.0.1'  # Only this computer can connect
PORT = 8765

if not (FOLDER / 'index.html').is_file():
    print(f'ERROR: index.html was not found in: {FOLDER}')
    input('Press Enter to close...')
    raise SystemExit(1)

handler = partial(SimpleHTTPRequestHandler, directory=str(FOLDER))
try:
    server = ThreadingHTTPServer((HOST, PORT), handler)
except OSError as exc:
    print(f'Cannot start server on port {PORT}: {exc}')
    input('Press Enter to close...')
    raise SystemExit(1)

url = f'http://{HOST}:{PORT}/index.html'
print(f'Serving files from: {FOLDER}')
print(f'Open: {url}')
print('Keep this window open. Press Ctrl+C to stop.')
threading.Timer(0.7, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\nStopping server...')
finally:
    server.server_close()

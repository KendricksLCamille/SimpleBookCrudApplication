#!/usr/bin/env python3
import os
import subprocess
import sys
import signal
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / 'Backend'
FRONTEND_DIR = ROOT / 'frontend'
LOG_DIR = ROOT / 'untitled'

BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:5152')

procs = []

def check_tools():
    from shutil import which
    if which('dotnet') is None:
        print('[dev.py] dotnet SDK not found. Install .NET SDK 9.0+.', file=sys.stderr)
        sys.exit(1)
    if which('npm') is None:
        print('[dev.py] npm not found. Install Node.js >= 18.', file=sys.stderr)
        sys.exit(1)


def restore_install():
    print('[dev.py] Restoring Backend...')
    subprocess.check_call(['dotnet', 'restore'], cwd=str(BACKEND_DIR))
    nm = FRONTEND_DIR / 'node_modules'
    if not nm.exists():
        print('[dev.py] Installing Frontend deps (npm ci)...')
        try:
            subprocess.check_call(['npm', 'ci'], cwd=str(FRONTEND_DIR))
        except subprocess.CalledProcessError:
            subprocess.check_call(['npm', 'install'], cwd=str(FRONTEND_DIR))


def start_process(cmd, cwd, env, log_file):
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    f = open(log_file, 'w')
    p = subprocess.Popen(cmd, cwd=str(cwd), env=env, stdout=f, stderr=f)
    procs.append((p, f))
    return p


def cleanup(signum=None, frame=None):
    print('\n[dev.py] Shutting down...')
    for p, f in procs:
        try:
            p.terminate()
        except Exception:
            pass
    for p, f in procs:
        try:
            p.wait(timeout=5)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass
        try:
            f.close()
        except Exception:
            pass
    sys.exit(0)


def main():
    # basic checks
    if not (BACKEND_DIR / 'Backend.csproj').exists():
        print(f'[dev.py] Backend project not found at {BACKEND_DIR}', file=sys.stderr)
        sys.exit(1)
    if not (FRONTEND_DIR / 'package.json').exists():
        print(f'[dev.py] Frontend project not found at {FRONTEND_DIR}', file=sys.stderr)
        sys.exit(1)

    check_tools()
    restore_install()

    # Start backend
    backend_env = os.environ.copy()
    backend_env['ASPNETCORE_URLS'] = BACKEND_URL
    backend_env['ASPNETCORE_ENVIRONMENT'] = backend_env.get('ASPNETCORE_ENVIRONMENT','Development')
    print('[dev.py] Starting Backend (hot reload) ...')
    backend = start_process(['dotnet', 'watch', 'run'], BACKEND_DIR, backend_env, str(LOG_DIR / 'backend.log'))
    print(f'[dev.py] Backend PID: {backend.pid}')

    # Start frontend
    frontend_env = os.environ.copy()
    frontend_env['VITE_API_URL'] = BACKEND_URL
    print('[dev.py] Starting Frontend (Vite) ...')
    frontend = start_process(['npm', 'run', 'dev'], FRONTEND_DIR, frontend_env, str(LOG_DIR / 'frontend.log'))
    print(f'[dev.py] Frontend PID: {frontend.pid}')

    # signal handling
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print('[dev.py] Running. Press Ctrl+C to stop. Tailing logs below...')
    # Simple log tail to provide feedback
    try:
        with open(LOG_DIR / 'backend.log', 'r') as fb, open(LOG_DIR / 'frontend.log', 'r') as ff:
            fb.seek(0, os.SEEK_END)
            ff.seek(0, os.SEEK_END)
            while True:
                line_b = fb.readline()
                line_f = ff.readline()
                if line_b:
                    print('[backend]', line_b, end='')
                if line_f:
                    print('[frontend]', line_f, end='')
                if not line_b and not line_f:
                    # Avoid busy wait
                    import time
                    time.sleep(0.3)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == '__main__':
    main()

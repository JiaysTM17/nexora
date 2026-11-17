import socket, threading, time, sys

def forward(src, dst):
    while True:
        try:
            data = src.recv(8192)
            if not data: break
            dst.sendall(data)
        except Exception:
            break
    try: src.close()
    except: pass
    try: dst.close()
    except: pass

def relay(lport, rport):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", lport))
    server.listen(100)
    print(f"Relay {lport} -> 127.0.0.1:{rport} listening")
    sys.stdout.flush()
    while True:
        client, addr = server.accept()
        try:
            target = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            target.connect(("127.0.0.1", rport))
            t1 = threading.Thread(target=forward, args=(client, target), daemon=True)
            t2 = threading.Thread(target=forward, args=(target, client), daemon=True)
            t1.start(); t2.start()
        except Exception as e:
            print(f"Failed connect to target {rport}: {e}")
            client.close()

t1 = threading.Thread(target=relay, args=(54320, 54329), daemon=True)
t2 = threading.Thread(target=relay, args=(63790, 6379), daemon=True)
t1.start(); t2.start()

while True:
    time.sleep(1)

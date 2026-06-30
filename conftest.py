import sys
from pathlib import Path

# Ensure the project root is available for imports like `backend.*`
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# O TestClient usa o host "testserver"; sem o autorizar, o TrustedHostMiddleware
# rejeita todos os pedidos com 400 "Invalid host header".
import os
os.environ.setdefault("ALLOWED_HOSTS", "testserver")

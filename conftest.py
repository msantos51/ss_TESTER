import sys
from pathlib import Path

# Ensure the project root is available for imports like `backend.*`
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

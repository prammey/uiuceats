import sys
from pathlib import Path

# Make `import collector` work when pytest runs from the collector folder.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

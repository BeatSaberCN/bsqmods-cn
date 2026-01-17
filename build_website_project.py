import os
from glob import glob
from pathlib import Path

def copy_file(src:str,dst:str):
    with open(dst, 'wb') as f:
        with open(src,'rb') as ff:
            f.write(ff.read())

copy_file("dist/mods.json", "website-project/src/mods.json")
copy_file("dist/build_info.json", "website-project/src/build_info.json")
copy_file("dist/versions.json", "website-project/src/versions.json")

os.system("cd website-project && npm install && npm run build")

for f in glob("website-project/dist/**/*", recursive=True):
    dst = "dist" + f[len("website-project/dist"):]
    assert f.startswith("website-project/dist") or f.startswith("website-project/dist")
    if Path(f).is_dir():
        Path(dst).mkdir(exist_ok=True)
    else:
        copy_file(f, dst)

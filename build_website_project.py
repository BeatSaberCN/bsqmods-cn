import os
from glob import glob
from pathlib import Path
import urllib.request
import subprocess
import json

def copy_file(src:str,dst:str):
    with open(dst, 'wb') as f:
        with open(src,'rb') as ff:
            f.write(ff.read())

# 生成实时信息相关的源码
copy_file("dist/mods.json", "website-project/src/mods.json")
copy_file("dist/build_info.json", "website-project/src/build_info.json")
copy_file("dist/versions.json", "website-project/src/versions.json")
with open("website-project/src/core_mods.json", "w", encoding="utf-8") as f:
    f.write(urllib.request.urlopen("https://raw.githubusercontent.com/QuestPackageManager/bs-coremods/refs/heads/main/core_mods.json").read().decode("utf8"))

# 生成贡献者列表
contributors = []
for contrib in subprocess.check_output("git shortlog database -sn").decode("utf-8").splitlines():
    [count, author] = contrib.split("\t")
    contributors.append({
        "author":author,
        "count":int(count)
    })
with open("website-project/src/contributors.json", "w", encoding="utf-8") as f:
    json.dump(contributors, f)

# 编译
os.system("cd website-project && npm install && npm run build")

# 拷贝编译结果至dist目录
for f in glob("website-project/dist/**/*", recursive=True):
    dst = "dist" + f[len("website-project/dist"):]
    assert f.startswith("website-project/dist") or f.startswith("website-project/dist")
    if Path(f).is_dir():
        Path(dst).mkdir(exist_ok=True)
    else:
        copy_file(f, dst)


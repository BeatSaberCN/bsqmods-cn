# 中文bsqmods下游

请[安装deno](https://docs.deno.com/runtime/getting_started/installation/)。

初始化依赖
```
deno install
```

以下命令更新databse并生成dist目录。dist是发布目录，格式与bsqmods保持一致。

```cmd
deno run update
```

每次运行上述指令，会：
- 从上游下载mod列表，根据本地database目录同步中文，生成新的mod列表
- 覆盖本地database
- 根据修改后的上游列表，生成dist目录

database仅用于增量翻译，新增mod不会合并至dist中。

# API

bsqmods同款api，支持以下：

- https://beatsabercn.github.io/bsqmods-cn/mods.json
- ~~https://beatsabercn.github.io/bsqmods-cn/mods-grouped.json~~ (暂无支持)
- https://beatsabercn.github.io/bsqmods-cn/versions.json
- [https://beatsabercn.github.io/bsqmods-cn/[version].json](https://beatsabercn.github.io/bsqmods-cn/1.37.0_9064817954.json)

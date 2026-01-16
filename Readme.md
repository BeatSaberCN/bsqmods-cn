# 中文bsqmods下游

请[安装deno](https://docs.deno.com/runtime/getting_started/installation/)。

初始化依赖
```
deno install
```

更新databse并生成dist目录。dist是发布目录，格式与bsqmods保持一致。
```
deno run update
```

更新中文内容请编辑各mod的name_zh和description_zh字段。
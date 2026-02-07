# 关于此项目

此项目为[bsqmods](https://github.com/QuestPackageManager/bsqmods)的一个中文本地化下游。

# 更新方式

## 自动更新

已配置Github Action，每天自动同步一次。

如果要本地调试，需先更新mod数据库，再渲染网页。

## mod数据库

初始化依赖
```
npm install
```

以下命令更新databse并生成dist目录。dist是发布目录，格式与bsqmods保持一致。

```cmd
npm run update
```

每次运行上述指令，会：
- 从上游下载mod列表，根据本地database目录同步中文，生成新的mod列表
- 覆盖本地database
- 根据修改后的上游列表，生成dist目录

中英文同步是根据相同mod ID来的。如果一个mod ID下旧版本与新版本的英文相同，就会自动同步中文内容。

## 网页渲染

需要按顺序运行以下指令:

```cmd
npm run update
python build_website_project.py
```

# 网页开发指南

使用以下命令从零进入交互开发

```cmd
npm install
npm run update
python build_website_project.py
cd website-project
npm install
npm run dev
```

# 中文镜像源新增mod

请将新mod放置于cn_mods下，注意json格式需要直接匹配镜像源mod格式。格式中的hash为qmod文件的sha-1。

# API

bsqmods同款api，支持以下：

- https://qmods.bsaber.cn/mods.json
- ~~https://qmods.bsaber.cn/mods-grouped.json~~ (暂无支持)
- https://qmods.bsaber.cn/versions.json
- [https://qmods.bsaber.cn/[version].json](https://qmods.bsaber.cn/1.37.0_9064817954.json)


以及中文特有的api：

- https://qmods.bsaber.cn/build_info.json 显示最后一次构建信息

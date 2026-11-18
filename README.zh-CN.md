<div align="center">

# Spines

**把技术栈、AI 工具和项目做成 CD 盒侧脊的 README 徽章。**<br>
**README badges shaped like CD jewel case spines.**

[English](README.md) · 中文文档

[![Discord](https://spine.stv.pm/badge/discord.svg)](https://discord.gg/PwZDHH4mv3)

<img src="docs/images/shelf.jpg" alt="AI 应用的 CD 盒侧脊收藏架" width="100%" />

</div>

一个图片 URL,就能在 README 或 GitHub Profile 里放上一张侧脊,或者一整排。
这个仓库包含它背后的全部内容:

| | |
| --- | --- |
| [`apps/web`](apps/web) | 徽章站点:按请求绘制 SVG 的 Cloudflare Worker,以及首页。 |
| [`packages/spine`](packages/spine) | 渲染器。纯 TypeScript,无依赖,文字转为轮廓绘制。 |
| [`art`](art) | 成品图:每个工具或项目一张独立的侧脊图片。[欢迎贡献](art/README.md)。 |
| [`skills/cd-spine-art`](skills/cd-spine-art) | 用生图模型绘制成品图的 Agent Skill。 |

访问 [spine.stv.pm](https://spine.stv.pm)。

## 使用徽章

```md
![TypeScript](https://spine.stv.pm/badge/typescript.svg)
![My stack](https://spine.stv.pm/badge/typescript,react,docker,claude.svg)
```

写一个名字,侧脊横放,像普通徽章。写多个名字,它们竖着并排成一排。
加 `?layout=stack` 可以让多个横放叠起来,加 `?layout=row` 可以让单个竖立。

| URL | 绘制内容 |
| --- | --- |
| `/badge/<name>,<name>.svg` | 常用 AI 工具和技术栈的目录条目([完整列表](apps/web/src/presets.ts))。支持简写:`ts`、`py`、`k8s`、`next`。 |
| `/spine/<title>.svg` | 任意标题,排版生成。 |
| `/gh/<owner>/<repo>.svg` | 一个仓库,带 star 数和主要语言的图标。 |
| `/gh/<owner>.svg` | 一个账号 star 最多的仓库,排成一排。`count` 取 1–12,默认 8。 |
| `/art/<name>,<name>.svg` | [`art`](art) 里的成品图。 |
| `/shelf.svg?s=<item>&s=<item>` | 任意混排,最多 24 张。每项是标题、`badge:name`、`gh:owner/repo` 或 `art:name`,后面可以跟 `;key=value` 设置。 |

| 参数 | 取值 | |
| --- | --- | --- |
| `theme` | `paper` `clay` `steel` `noir` `grid` `signal` `midnight` `candy` | 不写时按标题自动选。 |
| `sub` | 文字 | 侧脊底部的编号行。 |
| `icon` | [Simple Icons](https://simpleicons.org) 的 slug,或 `none` | 侧脊顶部的图标。 |
| `paper` `ink` `accent` | 十六进制颜色,不带 `#` | 给主题换色。不指定墨色时会按纸色自动适配。 |
| `width` | `slim` `regular` `wide` | 盒体厚度。 |
| `layout` | `stack` `row` | 横放,或竖立。 |
| `size` | 120–2400 | 侧脊长度,单位像素。 |
| `gap` | 0–24 | 侧脊之间的间距,单位像素。 |

目录里的徽章在 `art/` 中有了成品图之后会直接显示成品图,在那之前用排版样式代替。
带任何样式参数的请求会得到排版版本。请求出错时,返回的仍然是一张写明原因的侧脊。

## 贡献成品图

目录里的每个条目都需要一张自己的图片,任何项目也都可以有一张。
[`art/WANTED.md`](art/WANTED.md) 列出了还缺哪些,
[`art/README.md`](art/README.md) 说明了怎么添加。

## 开发

需要 Node 22 和 pnpm。

```bash
pnpm install
```

```bash
pnpm dev
```

| 命令 | |
| --- | --- |
| `pnpm test` | 渲染器和 Worker 的测试。 |
| `pnpm typecheck` | 两个包的 TypeScript 检查。 |
| `pnpm lint` | Biome 检查。`pnpm format` 自动修复。 |
| `pnpm art` | 重新生成 `art/` 的网页版本和 `art/WANTED.md`。 |
| `pnpm fonts` | 重新生成渲染器排字用的字形图集。 |

## 部署

```bash
pnpm run deploy
```

这会对 [`apps/web`](apps/web/wrangler.jsonc) 执行 `wrangler deploy`。先用
`pnpm --filter @repo/web exec wrangler login` 登录。`spines` Worker 绑定
`spine.stv.pm`，通过 Workers Builds 自动部署 `main` 分支的推送。
构建根目录为 `apps/web`，构建命令为 `pnpm -w test`，部署命令为
`pnpm exec wrangler deploy`，Node.js 版本为 22。


首页模板为 `apps/web/index.html`，Wrangler 在开发或部署前生成静态的
`public/index.html`。通过可选构建环境变量 `GTM_ID` 启用 Google Tag Manager；
不设置则不注入统计代码。容器内需要已发布的 Google Analytics 标签才会采集 GA 数据。

用 GitHub CLI 配置仓库变量：

```bash
gh variable set GTM_ID --repo stvlynn/spines --body YOUR_GTM_CONTAINER_ID
```

CI 读取 `${{ vars.GTM_ID }}`。Workers Builds 与 GitHub Actions 独立运行，
因此还需在 Worker 的 **设置 → 构建 → 变量和机密** 配置同值的 `GTM_ID`，
更换容器时同步修改两处。本地部署可以直接读取 GitHub 变量：
`GTM_ID="$(gh variable get GTM_ID --repo stvlynn/spines)" pnpm run deploy`。

GitHub 相关路由默认不带 token 访问 GitHub API,每小时限 60 次。存一个不带任何权限的
token 可以提高到 5,000 次:

```bash
pnpm --filter @repo/web exec wrangler secret put GITHUB_TOKEN
```

## Skill

`cd-spine-art` 引导 Agent 完成从核实品牌标识、美术指导到裁切竖立的整个流程。
它需要一个支持参考图的生图工具,以及用于裁切的 Python 3 和 Pillow。

```bash
npx skills add stvlynn/spines
```

然后直接提需求:

> 用 `$cd-spine-art` 给 React 做一张 CD 侧脊,放进 `art/stack/`。

## 致谢

品牌图标来自 [Simple Icons](https://simpleicons.org),版权归各自所有者。
首页遵循 [Sunbeam](https://github.com/AstraFoundry/design) 设计系统(MIT)。
侧脊文字使用 Inter、Fraunces、JetBrains Mono、Anton 和 Fredoka(OFL)。

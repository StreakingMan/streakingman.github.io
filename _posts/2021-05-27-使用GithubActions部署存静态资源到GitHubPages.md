---
layout: post
title: 使用GithubActions部署存静态资源到GitHubPages
author: Max
categories: 学习笔记
tags:github-page github-action workflow 静态网站
---

> Github支持给项目设置secret，在workflow中可直接使用， 通过action可以很方便将一些纯静态资源部署到GitHub Pages中，如vue项目，而非Jekyll。

### 创建gh-pages分支

Github会默认将gh-pages分支的内容部署到项目的GitHub Pages中（模式从根路径读取静态资源）。

也可以进行自定义的设定：

![image-20210527002724041](https://media-bed.streakingman.com/image-20210527002724041.png)

### 生成 personal access token

在个人设置中找到开发者设置选项

![image-20210527003204478](https://media-bed.streakingman.com/image-20210527003204478.png)

点击Generate new token 生成个人访问token

![image-20210527003445913](https://media-bed.streakingman.com/image-20210527003445913.png)

因为加下来的制作的action中只需要对gh-pages分支进行拉取和推送操作，故只选择repo:status和public_repo权限（更多权限说明看
["这里"](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
）

生成后复制token（注意：只能看见该token一次，及时复制到所需的地方）

### 设置secret

回到需要设置的项目，在项目设置中找到secrets：

![image-20210527004042975](https://media-bed.streakingman.com/image-20210527004042975.png)

创建一个GITHUB_PAGE_TOKEN，粘贴刚刚生成的personal access token

### 创建action

在项目Actions中创建工作流，这里以vue项目为例，工作流主要动作为：

1. 安装依赖
2. 打包
3. clone当前仓库，切换到gh-pages分支
4. 将打包文件复制到克隆仓库
5. 使用personal access token推送新的gh-pages内容

```yaml
# This is a basic workflow to help you get started with Actions

name: deploy-gh-pages

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the master branch
  push:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    name: Build and deploy gh-pages
  
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.4
      
      - name: Setup Node.js environment
        uses: actions/setup-node@v2.1.5
        with: 
          node-version: 14.x
    
      - name: Install 
        run: npm ci
        
      - name: LintStaged
        run: npm run lint-staged
        
      - name: Test
        run: npm run test
        
      - name: Build
        run: npm run build

      - name: Commit
        run: |
          git clone -b gh-pages https://${{secrets.GITHUB_PAGE_TOKEN}}@github.com/yourUserName/yourRepositoryName.git
          cp -r -f ./dist/* ./yourRepositoryName
          cd ./yourRepositoryName
          git config user.name githubaction
          git config user.email githubaction@fake.com
          git add --all
          git commit -m "chore: update gh-pages"
          git push origin gh-pages -f
          echo 🆗 deploy gh-pages complete.
```



### 总结

实际上，任何静态资源都可以通过这种方式部署到GitHub Pages上，当然静态资源里务必得有index.html入口文件




---
layout: post
title: Jekyll Github Page部署总结
author: Max
categories: 技术相关
tags: jekyll github-page 静态网站
---

很久之前就想着要搭建博客，但都因为各种原因不了了之，时间一长，技术飞速迭代，脑子很难记下所有的东西，于是下定决心将工作学习中的点滴记录沉淀下来。

折腾了半天终于把githubPage捣鼓好了，简单记录下过程（ps：本篇非详细教程）。

###  为什么选择Github Page

一直以来都喜欢彰显个性，所以之前对千篇一律的模板博客很不屑。从零搭建一套博客系统来来回回做了好几次，最终都因为理想过于丰满设计过于庞大而烂尾，颇有舍本逐末的意思。在接触jekyll之前，偶然发现github有提供开放api，便产生过白嫖github当持久化数据库的想法，甚至可以通过建立issue与文章的映射来实现评论系统，殊不知这正是jekyll和gitment的原理。

### 建立Github Page仓库

创建githubpage的流程 [官方文档](https://pages.github.com/) 说的很清楚了：

假设你的github用户名为username，你只需要建立一个名为username.github.io的仓库，并创建一个`index.html`文件便可拥有一个最基础的githubpage（仓库建立后会包含一个名为github-pages的action，有推送时会自动更新站点），接下来可以选择jekyll或hexo等框架来构建博客站点，他们的原理大同小异，最终都会编译成纯静态的网站（所有github-page有更好的seo）。

### 选择jekyll主题：[Yat](https://jeffreytse.github.io/jekyll-theme-yat/)

![image-20210407191206566](https://media-bed.streakingman.com/image-20210407191206566.png)

主题方面，我并没有使用建立github-page仓库时推荐的jeykell主题，搜罗了一番，最终找到了这个名为漂亮的Yat的主题（[点击访问仓库](https://github.com/jeffreytse/jekyll-theme-yat)）。

该主题支持当作remote使用，但由于需要对它做一些定制化的修改，所以我像该主题文档中说的那样拷贝了所有代码到我的github-page仓库中。

### 定制化修改

该主题功能十分全面，代码结构清晰，很适合拓展和修改。

需要注意的是，主题源码中定义了workflow（位于.github/workflows文件夹下）build-jekyll.yml，用于构建并发布主题。作为站点是不需要这个工作流的，删除即可。

此外，删除了一些不太需要的功能：多国语言翻译，谷歌统计等 ，增加了[不蒜子统计](https://busuanzi.ibruce.info/)和[gitment评论系统](https://github.com/imsun/gitment)，首页banner随机图案[geopattern](https://btmills.github.io/geopattern/)

####  gitment

```html
//gitment.html 
<div id="gitment_thread"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/default.css"/>
<script src="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/gitment.browser.js"></script>
<script>
    var gitment = new Gitment({
        id: '{{ page.title }}',
        owner: '{{ site.gitment.username }}',
        repo: '{{ site.gitment.repo }}',
        oauth: {
            client_id: '{{ site.gitment.client_id }}',
            client_secret: '{{ site.gitment.client_secret }}',
        },
    });
    gitment.render('gitment_thread')
</script>

// 使用
<div class="post-comments">
    <!--通过jekyll的include引入上述文件，并提供相应的参数-->
</div>
```

![image-20210407191137885](https://media-bed.streakingman.com/image-20210407191137885.png)

#### geopattern

```html
// geopattern.html
<script src="/assets/js/geopattern.min.js"></script>
<script>
  // seed和selector参数通过jekyll include传递
  function setRandomBgImage(selector, seed) {
    let finalSeed = '';
    
    if (seed) {
      finalSeed = seed;
    } else {
      const STRING_POOL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let times = 12;
      while (times--) {
        const index = Math.floor(Math.random() * 62);
        finalSeed += STRING_POOL[index];
      }
    }
    var pattern = GeoPattern.generate(finalSeed);
    var element = document.querySelector(selector);
    if (element) {
      element.style.backgroundImage = pattern.toDataUrl();
    }
  }
  setRandomBgImage('{{ selector }}', '{{ seed }}');
</script>

// 使用
<body>
    <div id="page-banner-img"></div>
    <!--something-->
    <!--使用jeykll 上面的geopattern.html selector传入banner容器的id引入即可-->
    <!--something-->
</body>
```

![image-20210407190948710](https://media-bed.streakingman.com/image-20210407190948710.png)

#### 不蒜子访问量统计

```html
// 不蒜子的使用

// 1.引入js
<script async src="/assets/js/busuanzi.pure.mini.js"></script>

// 3.在任何地方根据固定id使用
<div>
    本站总访问量<span id="busuanzi_value_site_pv"></span>次，
    访客数<span id="busuanzi_value_site_uv"></span>人次，
    统计由<a href="//busuanzi.ibruce.info/">不蒜子</a>驱动。
</div>
```

![image-20210407191113911](https://media-bed.streakingman.com/image-20210407191113911.png)

### 写在最后

不应当为了写博客而写博客，博客的灵魂是内容，其余的都是点缀，不断思考，不断沉淀，不要像csdn的博客一样疯狂注水复制粘贴。

由于一些总所周知的原因，github-page在国内的访问懂的都懂，百度直接不持支github-page的seo（再次diss csdn，百度的seo十个有九个都是csdn的cv注水文章），访问速度也很慢，cdn的优化也是做了很久（后续花时间整理下要点以及相关的白嫖方案）。

关于jekyll的使用也有很多需要整理的地方，后续抽时间写写。


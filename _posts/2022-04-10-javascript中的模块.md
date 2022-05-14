---
layout: post title: JavaScript中的模块 author: Max categories: JavaScript tags: 软件工程 模块化
---      

前端模块化是一个老生常谈的问题，从早期的IIFE到CommonJS，后续为了解决异步加载的AMD， 再后续为了统一而出现的UMD，再到如今的ESM...模块化方案一直再不断的演进和完善。

首先，我们跟着红宝书（第四版）来走一遍。

## 模块模式

红宝书首先花了比较大的篇幅介绍了模块模式，基于Javascript本身的语法和词法特性， 其思想包括以下几个部分：

1. 模块标志符：简单来说就一个模块的ID，不管是显式声明或是隐式使用文件名， 模块的标志在系统中都是唯一的。
2. 模块依赖：管理依赖是模块系统的核心，系统需要识别、检索、加载相应的依赖。
3. 模块加载：有依赖就有加载，整个依赖图都加载完成，才可以执行模块入口。
4. 入口：相互依赖的模块必须制定一个模块作为入口，也是代码执行的起点。
5. 异步依赖：鉴于js是单线程顺序执行的，模块加载是一个阻塞过程，通过js的异步执行能力来实现按需加载， 减少同步加载的性能消耗。
6. 动态依赖：顾名思义就是在程序运行过程中动态引入的依赖，通过增加静态分析的难度来支持更复杂的依赖关系
7. 静态分析：指在不执行代码的情况下推断代码行为，对静态分析友好的系统模块更容易tree-shaking
8. 循环依赖：软件工程的角度上来讲，几乎不可能构建一个没有循环依赖的js应用， 所以几乎所有的模块系统都支持循环依赖。

## 早期的模块系统

ES6之前，通常使用函数作用域和IIFE来封装模块

```javascript
const Foo = (function () {
  return {
    bar: 'baz',
    baz() {
      console.log(this.bar)
    }
  }
})()
```

以上这个可以说是模块模式的基本实现，同时也有一种"泄露模块模式"， 返回一个只有私有数据和成员引用的对象

```javascript
const Foo = (function () {
  const bar = 'baz'
  const baz = () => console.log(bar)
  return {
    bar,
    baz
  }
})()
```

## ES6之前的模块加载器

### CommonJS

CommonJS实际上是一套规范，这个规范主要用于服务端实现模块化代码组织。 浏览器不支持CommonJS语法，Node实际上使用的是轻微修改过的CommonJS。 以下是一些简要总结：

1. 使用`require()`指定依赖，使用`exports`对象定义自己的公共API

```javascript
const myModule = require('./myModule')

module.exports = {
  stuff: myModule.doStuff()
}
```

2. 模块是单例的，无论一个模块被引用多少次，都只会加载一次
3. 加载过后的模块将被缓存，再次加载会直接取缓存的模块
4. 模块加载操作是***同步的***，支持***动态依赖***
5. CommonJS的实现不会指定模块的标志符，由其在文件层级的位置决定

### 异步模块定义（AMD,Asynchronous Module Definition）

作为浏览器执行环境的模块系统，AMD可以说是几乎完全被ESM取代了。考虑到网络延迟的问题， AMD的一般策略是让模块声明自己的依赖，系统在运行是按需获取依赖，并在依赖加载完成后， 立即执行依赖它们的模块。以下是AMD的简单总结：

1. 使用`define()`定义模块，支持标志符指定

```javascript
// 定义一个依赖moduleB的moduleA
// moudleB将会异步加载
define('moduleA', ['moduleB'], function (moduleB) {
  // 模块的工厂函数  
  return {
    stuff: moduleb.doStuff()
  }
})
```

2. 模块工厂函数内容支持CommonJS模块

### 通用模块定义（UMD,Universal Module Definition）

为了统一CommonJS和AMD生态系统而生，用户创建在这两个系统都可以使用的模块代码。 通常由构建工具生成，UMD定义的模块会在启动时检测要使用哪个模块系统，并进行相应的适配， 并把所有的逻辑包装在一个IIFE中：

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['moduleB'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('moduleB'))
  } else {
    // 浏览器上下文
    root.myModule = factory(root.moduleB)
  }
})(this, function (moduleB) {
  // 模块工厂
  return someting
})
```

## ESM

ES6的模块规范，使得之前的模块加载器终将没落，多方面看ESM是集AMD和CommonJS大成者。

### 模块标签

script标签增加`type="module"`属性，将告诉浏览器该代码应该作为模块执行。 浏览器解析到模块标签后会立即下载模块文件，但执行会延迟到文档解析完成，且按照在文档中出现的顺序执行， 该行为类似与`<script defer>`
，模块标签受`async`属性影响

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <script>console.log(1)</script>
  <script type="module">console.log(2)</script>
  <script type="module">console.log(3)</script>
  <script>console.log(4)</script>
</head>
<body>

输出顺序：1 4 5 8 2 3 5 7

<script>console.log(5)</script>
<script type="module">console.log(6)</script>
<script type="module">console.log(7)</script>
<script>console.log(8)</script>

</body>
</html>
```

> 这里再回顾下script标签加载顺序相关内容：
> * 正常情况下，浏览器会按照script在文档中出现的顺序依次加载执行（在head中的script会阻塞渲染）
> * defer属性表示该脚本可以立即下载但要推迟执行（解析到`</html>`后再执行）， 有多个defer时，规范要求依次执行，且defer只对外部脚本有效
> * async与defer类似，但会改变脚本的执行时机，在代码加载完之后立即执行（不管HTML解析是否完成），这也使得脚本无法保证执行顺序

### 模块加载

支持ESM的浏览其可以从顶级模块加载整个依赖图，且是异步完成的。模块文件是按需加载的，会递归的请求嵌套依赖。

### 模块行为

- 有跨域限制
- 只在加载后执行，只加载一次，且是异步的
- 单例的
- 可以定义公共接口，其他模块基于此交互和观察
- 可以加载请求其他模块
- 支持循环依赖
- 默认严格模式
- 不共享全局命名空间
- 模块顶级的`this`是`undefined`，顾在模块中声明的var不会添加到window对象中

### 模块导出

- 导出语句必须在模块顶级
- 命名导出，将整个模块视为容器（一个对象，导出的值视为其属性，导入时解构）

```javascript
const foo = 'foo'
const bar = 'bar'
// 在声明处导出
export const baz = 'baz'
// 分组导出，别名
export {foo, bar as myBar}
```

- 默认导出，每个模块只能声明一个，会将该值视为模块本身的值

```javascript
export default 'foo'
// 或者
const foo = 'foo'
export default foo
// 或者
export {foo as default}

// 简单区分就是默认导出在导入的时候不需要解构
```

### 模块导导入

- 必须在模块顶级
- 导入模块的标志符必须是静态的路径字符串
- 导入相对与模块而言是只读的，行为类似与const
- 使用`*`可对命名导出进行批量导入，但无法修改赋值别名的属性

```javascript
const foo = 'foo', bar = 'bar', baz = 'baz'
export {foo, bar, baz}

import foo, * as Foo from './foo.js'
// 可访问Foo的foo、bar、baz属性
foo = 'xxx'     // 报错
foo.bar = 'xxx' // 正常
Foo.bar = 'xxx' //错误
```

- `import()`方法支持在js代码中动态导入模块（ES11新增特性）
- `import.meta`指向包含当前执行环境元数据的对象，该对象的`url`是指加载模块时使用的URL，这在引用模块附近的一些图片或者其他文件时会派上用场

### 模块转移导出

模块导入的值可以直接通过管道转移导出，不再赘述

### 工作者模块

ESM与Worker实例完全兼容，不再赘述

### ESM和CommonJS、AMD的一些区别

阮老师的《ES6标准入门》中还提到了比较重要的信息，这里做个补充。

ESM的思想是尽量静态化，使得编译是就能确定模块的依赖关系，以及输入和输出的变量，而CommonJS和AMD都只能在运行时确认这些东西，如：

```javascript
// CommonJS模块
const {foo, bar} = require('someModule')
// 等同于
const someModule = require('someModule')
const foo = someModule.foo
const bar = someModule.bar
```

以上代码的本质是***运行时加载***，因为只有运行时才能得到这个模块对象，而ESM的区别正在于此，ESM的模块不是对象， 而是通过`export`和`import`命令显式的指定输出和输入的代码。编译时加载也使得静态分析成为可能。

## 最后

模块化的目的是让隐藏实现细节，让不同来源的代码可以组装成一个大型程序，又不必担心互相一项。 ESM是大势所趋，目前市面上的主流浏览器都已经支持ESM，并且Node从v13开始也增加了ESM支持


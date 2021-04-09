---
layout: post
title: ECMAScript 6 笔记
author: Max
categories: 笔记 
tags: ES6 心得随笔
---

> 本文主要为阮一峰[《ECMAScript 6 入门》](https://es6.ruanyifeng.com/#docs)读书笔记以及相关思考，时常更新

### Proxy

* 修改某些操作默认行为（实现了对语言自身的操作，某种程度上使得ECMAScript具备“反射”能力，属于“元编程”范畴）
  
* 通过Proxy构造函数生成实例
  ```javascript
  const proxy = new Proxy(target, handler);    
  ```
  
* 仅可对Object做代理，不支持基础类型
  ```javascript
  const proxy = new Proxy(0, {})
  // Uncaught TypeError: Cannot create proxy with a non-object as target or handler
  ```
  看到上述报错，首先联想到的时vue3的ref将基础类型统一包装为`{value: baseType}`对象是否与此有关（vue3的文档中对此说明为：保持不同数据类型的行为统一）。
  查看vue3源码，`ref()` 最终会进入 `createReactiveObject()`，该方法仅在入参为对象的且内部`proxyMap`不存在该对象时返回该对象的proxy实例。
  <kbd>TODO</kbd>  vue3基础类型ref后续分析...
  
* Proxy实例可作为其他对象原型
  
* handler支持的拦截操作（拦截不影响目标，即通过拦截进入目标原始操作后仍受原始操作的规则限制）
  * `get(target, propKey, receiver)`
    - receiver为proxy实例本身。
    - 将get转换为执行函数，并返回当前proxy实例，可实现链式操作
  * `set(target, propKey, value, receiver)`
    - 严格模式下，set代理如果没有返回true，就会报错（准确说是返回falsy值时会报错）
  * `has(target, propKey)`
  * `deleteProperty(target, propKey)`
    - 返回falsy值时删除失败
  * `ownKeys(target)`
    - 返回包含String或Symbol两种类型值的数组，否则抛错
    - 返回必须包含目标对象的不可配置属性（`configurable: flase`），否则抛错
    - 返回不可拓展目标对象的所有属性（须完全一致）
  * `getOwnPropertyDescriptor(target, propKey)`
  * `defineProperty(target, propKey, propDesc)`
  * `preventExtensions(target)`
    - 只可对未阻止拓展过的目标对象进行拦截更改
  * `getPrototypeOf(target)`
  * `isExtensible(target)`
  * `setPrototypeOf(target, proto)`
  * `apply(target, object, args)`
  * `construct(target, args)`
  
* revocable方法
  返回一个可取消的Proxy实例，通过调用该实例的revoke方法回收，回收后无法访问，适合一些受保护变量的临时访问场景
  ```javascript
  let {proxy, revoke} = Proxy.revocable(target, handler);
  proxy.foo = 123;
  proxy.foo // 123
  revoke();
  proxy.foo // TypeError: Revoked
  ```
  
* this指向
  - 目标对象内的this会指向该对象的Proxy代理实例
  - handler内部的this指向handler对象

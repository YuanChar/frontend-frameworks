


# 功能讲解

## 插件目录
- chalk：颜色插件
- config-lite：根据NODE_ENV加载不同config下配置文件，默认default。支持js、json、node、yml、yaml
- cross-env: 跨平台提供环境变量
- cookie-parser：cookie转对象
- debug：控制调试日志，根据全局变量DEBUG，浏览器端可通过localStorage控制.比如正式环境无日志
- ejs：[js模板引擎](https://ejs.bootcss.com/)
- koa-onerror: 
- node-xlsx：node处理xlsx文件	
- pm2：后台保护进程

### koa相关
- koa：node框架，2
- koa-body：中间件，支持 解析 multipart, urlencoded, and json 请求体的body
- koa-json：中间件，转请求体或响应体为json？
- koa-logger：中间件，可定义日志输出格式 

- koa-convert：辅助函数，koa1转2，或互转；从Generator互转Promise的中间件
- koa-onerror：中间件，处理ctx.onerror，例如流、事件错误。服务器产生错误（throw 抛出等）后自动重定义到指定路径
- koa-router：中间件，根据请求路径 控制路由逻辑；路由中间件
- koa-session-minimal：中间件，处理session，保留用户信息在cookie等
- koa-ssession-mysql: 为koa-session-minimal中间件提供MySQL数据库的session数据读写操作
- koa2-connect-history-api-fallback：中间件，单页面应用，可访问的索引文件。
- koa-static：中间件，访问静态文件目录
- koa-views：中间件，配置视图的模板引擎，如ejs




## src目录

## utils
共用方法操作

## 问题

### 1. 为什么用import、require
a. ES Modules 模式
底层采用ES6的模式去
全局启动ES Modules的方法：
    package.json 添加配置 `"type": "module"`
> nearest parent package.json contains "type": "module" which defines all .js files in that package scope as ES modules.

require模式下为什么还能用 import？
插件babel转译了。我们的命令是 `babel-node XX.js` 它可以转译我们需要的代码。

### 2 session

 koa2原生功能只提供了cookie的操作,但是没有提供session操作。session就只用自己实现或者通过第三方中间件实现。在koa2中实现session的方案有以下几种
 如果session数据量很小,可以直接存在内存中
 如果session数据量很大,则需要存储介质存放session数据

 数据库存储方案
 将session存放在MySQL数据库中
 需要用到中间件
    koa-session-mininal 适用于koa2的session中间件,提供存储介质的读写接口
    koa-mysql-session为koa-session-minimal中间件提供MySQL数据库的seesion数据读写操作

    将sessionId和对应的数据存到数据库

    将数据库的存储的sessionId存到页面的cookie中
    根据cookie的sessionId出获取对应的session信息



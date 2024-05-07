node-init

初始化node+koa项目可以用到的目录结构
RESTful API 服务器脚手架
node 版本 koa yarn 
https://github.com/yi-ge/Koa2-API-Scaffold
# 项目初始化

- 安装项目依赖`npm install`
- 运行项目`node index.js`

# 目录结构

config 项目的配置文件，如全局可用的常量
node_modules
public 静态资源 不会打包
src
    controllers 控制器，逻辑代码 ，接收请求处理立即·逻辑
    middleware  中间件，存储公有部件，如错误页面
    mock    模拟数据
    models 对应数据库表结构，存放数据库操作的语句
    prototype 存放继承基类，可没有
    routers 路由，访问路径
    service
    static 静态资源，会被打包
    utils
    views 存放页面
<!-- app.js -->
index.js 启动项目的开始，串联整个项目
package.json
README.md


# 参考
https://www.cnblogs.com/muamaker/p/11589410.html
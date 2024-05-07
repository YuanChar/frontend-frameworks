import Koa from 'koa'
import path from 'path'

// import static from './middleware/static'
// import convert from 'koa-convert'

import session from 'koa-session-minimal'
import MysqlSession from 'koa-mysql-session'

import json from 'koa-json'
import logger from 'koa-logger'
// import debug from 'debug'('demo:server'

import onerror from 'koa-onerror'
import koaStatic from 'koa-static'
import { historyApiFallback } from 'koa2-connect-history-api-fallback';
import views from 'koa-views';//模板引擎
import {koaBody} from 'koa-body';

import iConfigLite from 'import-config-lite'
import chalk from 'chalk'
// 最新 node 核心包的导入写法
import { fileURLToPath } from 'url'
import { dirname } from 'path'
// 获取 __filename 的 ESM 写法
// const __filename = fileURLToPath(import.meta.url)
// 获取 __dirname 的 ESM 写法
// const __dirname = dirname(fileURLToPath(import.meta.url))
// import router from './routers/index.js'
// import excel from './util/excel'
// import Common from './util/common'
// import { createRequire } from 'module'
// const require = createRequire(__filename)

// const router = require('routers/index.js')
const app = new Koa();

// 全局配置参数 
// 根据NODE_ENV读取 config文件夹的配置的文件，会合并指定的文件和默认default配置文件作为最终配置
const config = iConfigLite(__dirname);
console.log(config)
const config1 = {

  port:  '3000',
  session: {
    name: 'SID',
    secret: 'SID',
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    }
  },
  // cookie,
  mysql: {
    user: 'root',
    password: 'root',
    database: 'koa2-demo',
    host: 'localhost'
  },
  staticPath: ''
}
// error handler。服务器产生错误（throw 抛出等）后自动重定义到指定路径
onerror(app, {
  // redircet: '/error',
});

const koaBodyConfig = {
  multipart: true, // 支持文件上传
  // encoding:'gzip',
  formidable: {
    // uploadDir:path.join(__dirname,'./upload-files/'), // 设置文件上传目录
    // keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    // onFileBegin:(name,file) => { // 文件上传前的设置
    // console.log(`name: ${name}`);
    // console.log(file);
    // },
  }
}
// session相关
// 配置存储session信息的mysql
// let store = new MysqlSession(config.mysql)
app.use(session({
  key: 'SESSION_ID',
  // store: store,
  cookie: config.cookie
}));

// 响应头
app.use(async (ctx, next) => {
  const { request } = ctx
  // 跨域头
  const { origin, Origin, referer, Referer } = request.headers;
  const allowOrigin = origin || Origin || referer || Referer || '*';
  ctx.set("Access-Control-Allow-Origin", allowOrigin);
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  ctx.set("Access-Control-Allow-Credentials", true); //可以带cookies
  ctx.set("X-Powered-By", 'Express');

  if (request.method == 'OPTIONS') {
    // ctx.body = 200
    ctx.status = 200
    // } else if (ctx.url === '/page/helloworld') {  // 要使cookie中种下 session_id 就不能在此，设置 cookies
    // ctx.cookies.set('cid', 'hello,world', {  //
    //   domain: 'localhost',// 写cookie所在的域名
    //   path: '/',     // 写cookie所在的路径
    //   maxAge: 10 * 60 * 1000,  // cookie有效时长
    //   expires: new Date('2018-2-15'),  // cookie失效时间
    //   httpOnly: false,   // 是否只用于http请求中获取
    //   overwrite: false  // 是否允许重写
    // })
    // console.log('ctx:', ctx)   // 检查请求的cookie中是否有 SESSION_ID并同数据库中的校验
    // ctx.session = {
    //   user_id: Math.random().toString(36).substr(2),
    //   count: 0
    // }
  } else {
    await next();// 注意  ctx是异步的(你不知道用户什么时候访问)  中间件的异步处理方案  async和  await语法
  }
})

// 这句代码需要在koa-static上面 
app.use(historyApiFallback());
// 静态资源目录对于相对入口文件index.js的路径
app.use(koaStatic(path.join(__dirname, config.staticPath || '')))

// middlewares
app.use(koaBody(koaBodyConfig));
// 转请求体内容为json
app.use(json())
// logger
app.use(logger())
// 统计接口响应时间
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`响应时间：${ctx.method} ${ctx.url} - ${ms}ms`)
// })

// 加载模板引擎
// Must be used before any router is used
app.use(views(__dirname + '/src/views', {
  extension: 'ejs'
}));

// routes
// app.use(router.routes(), router.allowedMethods())

app.on('error', onError);
// app.on('listening', onListening);

app.listen(config.port || 3000, onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      console.error('server error', err, ctx)
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    console.log(
      chalk.green(`成功监听端口：${config.port}`)
    )
  
  // var addr = server.address();
  // var bind = typeof addr === 'string'
  //   ? 'pipe ' + addr
  //   : 'port ' + addr.port;
  // debug('Listening on ' + bind);
}

export default app

/*
 * @Description: 
 * @Author: char
 * @Date: 2021-03-25 10:08:02
 * @LastEditTime: 2021-04-02 19:55:21
 */
'use strict';

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  return port >= 0 ? port : false;
}

// 存放sessionId的cookie配置
const cookie = {
  maxAge: '',//
  expires: '',
  path: '',
  domain: '',
  httpOnly: 'false',
  overwrite: '',
  secure: '',
  sameSite: '',
  signed: ''
}

module.exports = {
  port: normalizePort(process.env.PORT || '3000'),
  session: {
    name: 'SID',
    secret: 'SID',
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    }
  },
  cookie,
  mysql: {
    user: 'root',
    password: 'root',
    database: 'koa2-demo',
    host: 'localhost'
  },
  staticPath: ''
}




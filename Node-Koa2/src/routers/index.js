import Router from 'koa-router'
// const Router = require('koa-router')

let router = new Router()
// const views = require('koa-views')
const template = new Router()
template.get('/index', async (ctx) => {
  console.log(123)
    let title = 'justdoit'
    ctx.body = title;
  })
router.use('/template', template.routes(), template.allowedMethods())

export default template;
// module.exports = template
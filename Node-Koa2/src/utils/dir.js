/**
 * 读取目录内容
 */

// const url = require('url')
const fs = require('fs')
// const path = require('path')

/**
 * 获取html格式的目录内容
 @params {string}URL当前请求的上下文中的URL,即 ctx.url
 @ params {string} reqPath 请求静态资源的完整本地路径
 @parms {string} 返回目录内容  封装程html
 */
function dir(url, reqPath) {
  // 遍历读取当前目录下的文件、子目录
  let contentList = walk(reqPath)
  let html = `<ul>`
  for (let [index, item] of contentList.entries()) {
    html = `${html}<li><a href="${url === '/' ? '' : url}/${item}">${item}</a>`
  }
  html = `${html}</ul>`

  return html
}

/**
 * 遍历读取目录内容(子目录,文件名)
 @param {string} reqPath 请求资源的绝对路径
 @retrun {array}目录内容列表
 */
function walk(reqPath) {
  let files = fs.readdirSync(reqPath)   // 返回一个包含指定目录下所有文件名称的数组对象 
  let dirList = [], fileList = []
  for (let i = 0, len = files.length; i < len; i++) {
    let item = files[i]
    let itemArr = item.split('\.')
    let itemMime = (itemArr.length > 1) ? itemArr[itemArr.length - 1] : "undefined"
    if (typeof mimes[itemMime] === 'undefined') {
      dirList.push(files[i])
    } else {
      fileList.push(files[i])
    }
    let result = dirList.concat(fileList)
    return result
  }
}

module.exports = {
  dir,
  walk,
}
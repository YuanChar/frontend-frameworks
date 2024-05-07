import fs from 'fs'
import path, { resolve } from 'path'
import Common from './common'
import mimes from './mimes'
import jschardet from 'jschardet'
import { start } from 'repl'
/**
 * 文件类型列表
 */
const mimeType = require('./mimes');

/**
 *
 * 根据路径和文件 保存单个文件；
 * @param {string} filePath
 * @param {File} file
 * @return {Promise} promise
 */
function saveFile(filePath, file) {
  console.log('文件上传中')

  return new Promise((resolve, reject) => {
    if (!file) {
      console.log('[saveFile] empty file')
      return reject('file empty')
    }
    const dirPath = path.dirname(filePath);
    if (!dirPath || !mkdirsSync(dirPath)) { // 路径有问题
      result.message = '上传路径有误！'
      return result
    }
    const reads = fs.createReadStream(file.path)
    // let fileRest = Math.random().toString(16).substr(2) + '.' + getSuffixName(file.name)
    // let _uploadFilePath = path.join(filePath, file.name)
    console.log('文件路径', filePath);
    const upstream = fs.createWriteStream(filePath)

    reads.pipe(upstream)
    reads.on('end', () => {
      reads.push(null);
      reads.read(0);

      resolve(true)
      console.log('上传成功！')
    })
    reads.on('error', err => {
      console.log('-----------createReadStream Err----------', err);

      reject(err)
    })
  })
}

/**
 * 通过创建文件目录
 * @param {string} dirname 目录绝对地址
 * @return {boolean} 创建目录结果
 * **/
function mkdirsSync(dirname) {
  // Common.devLog('检查路径是否存在，并创建')
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {  // path.dirname返回一个path路径
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 读取文件方法
 @param{string}文件本地的绝对路径
 @return {string|binary}
 */
function file(filePath) {
  let content = fs.readFileSync(filePath, 'binary')
  return content
}

async function getFileType(filePath) {
  if (filePath instanceof Buffer) { // 字节
    return Promise.resolve(jschardet.detect(filePath) || {})
  }

  const isExist = fs.existsSync(filePath)
  if (!isExist) {
    console.log('getFileType：文件不存在');
    return false
  }

  const stream = fs.createReadStream(filePath, { encoding: 'binary', start: 0, end: 1000 })
  let buffers = []
  return new Promise((resolve, reject) => {
    stream.on('data', buffer => {
      buffers.push(buffer)
    })
    stream.on('end', () => {
      console.log('判断type结束')

      resolve(jschardet.detect(Buffer.from(buffers)) || {})
    })
    stream.on('error', err => {
      console.log('getFileType Error:', err);
      reject(err)
    })
  })

}


module.exports = {
  mimeType,
  saveFile,
  mkdirsSync,
  getFileType
}
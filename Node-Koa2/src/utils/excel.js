import { inspect } from 'util'
import path from 'path'
import fs from 'fs'
import Excel from 'exceljs'
// import nodeXlsx from 'node-xlsx'
import archiver from 'archiver'
import {mkdirsSync, getFileType} from './file'
import Common from './common'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'

/**
 * 获取 excel文件 第一行数据
 *
 * @param {*} filePath excel文件路径
 * @return {*} array数据
 */
function getExcelLine(filePath) {
  return new Promise((resolve, reject) => {
    // const extName = path.extname(filePath)
    // if(extName === 'csv') {
    const p = path.extname(filePath) 
    console.log('文件后缀：', p, filePath);
    // }
    if (path.extname(filePath).toString() === '.csv') { // csv 读取
      resolve(getCsvLine(filePath))
    }else {
      console.log(p);
      resolve(getXlsxLine(filePath)) // xlsx 读取
    }
    setTimeout(resolve, 10000)

  }).catch(err => {
    console.log('getExcelLine:', err);
    throw err;
  })
}

/**
 * 获取 csv文件 第一行数据
 *
 * @param {*} filePath 文件路径
 * @return {*} 
 */
function getCsvLine(filePath) {
  return new Promise((resolve, reject) => {
    if (path.extname(filePath) !== '.csv') {
      return reject('非CSV文件')
    }
    // const read = fs.createReadStream(filePath, {encoding: 'binary'});
    const read = fs.createReadStream(filePath);
    read.on('data', async buffer => {
      let data;
      const encodingObj = await getFileType(buffer)
      // console.log(encodingObj);
      if(encodingObj && encodingObj.encoding === 'UTF-8') {
        data = iconv.decode(buffer, 'utf8')
      }else {
        data = iconv.decode(buffer, 'gbk')
      }

      const idx = data.indexOf('\n');
      const line = data.slice(0, idx);
      resolve(line.split(','))
      console.log(line);

      read.destroy()
    })
    read.on('end', info => {
      console.log('读取结束', info);
    })
    read.on('close', (data) => {
      console.log('读取关闭', data);
    })
    read.on('error', err => {
      reject(err)
      console.log('读取出错：', err);
    })
  })
}
/**
 * 获取 xlsx文件 第一行数据
 *
 * @param {*} filePath 文件路径
 * @return {*} 
 */
async function getXlsxLine(filePath) {
  
  const options = {
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    worksheets: 'emit',
    styles: 'cache',
  };  
  const read = fs.createReadStream(filePath)
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(read, options);
  
  workbookReader.on('end', () => {
    console.log('xlsxLine:结束');
    // ...
  });
  workbookReader.on('error', (err) => {
    // ...
    // reject(err)
    console.log('xlsxLine:出错：', err);
  });
  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      // ...
      const list = []
      console.log(row.values);
      row.eachCell((cell,number) => {
        list.push(cell.value)
        console.log(cell,cell.value);
      })
      console.log(list)
      return list
      // continue, break, return
    }
  }

}

/**
 * 根据列项 拆分excel文件；xlsx、csv
 *
 * @param {*} filePath 文件路径
 * @return {*} Promise 
 */
function splitExcel(filePath, fieldList, options={}) {
  if(options) {
    if(!options.mainName) {
      options.mainName = 'excel';
    }
  }
  if(!fieldList) {
    fieldList = [0]
  }
  return new Promise((resolve, reject) => {
    const extName = path.extname(filePath)
    const p = path.extname(filePath) 
    console.log('123',p);
    

    if (path.extname(filePath).toString() == '.csv') { // csv 读取
      resolve(splitCsv(filePath, fieldList, options))
    }else {
      console.log(p);
      resolve(splitXlsx(filePath, fieldList, options)) // xlsx 读取
    }
    setTimeout(resolve, 20000)

  }).catch(err => {
    console.log('splitExcel:', err);
    throw err;
  })
}

/**
 * 拆分 csv文件
 *
 * @param {*} filePath 文件路径
 */
async function splitCsv(filePath, keyArray, options) {
  // const read = fs.createReadStream(filePath, {encoding:'binary'})
  const read = fs.createReadStream(filePath, {encoding: 'binary'})
  // 文件编码
  const encodingObj = getFileType(filePath)
  let encStr
  if(encodingObj && encodingObj.encoding === 'UTF-8') {
    encStr = 'utf8'
  }else {
    encStr = 'gbk'
  }
  
  const workbook = new Excel.Workbook();
  const opt = {
    dateFormat: 'DD/MM/YYYY HH:mm:ss',
    dateUTC: true, // 呈现日期时使用 utc
    parserOptions: {
      // delimiter: ',',
      encoding: 'binary'
    },
  };
  const worksheet = await workbook.csv.read(read, opt);

  const keyObj = {}; // 主键枚举
  let count = 0; // 处理的行数
  let keyArr = keyArray.slice(); //浅复制
  console.log(123);
  worksheet.eachRow((row,num) => {
    if(options.hasTitle && num === 1) {// 是否去掉首行
      return;
    }
    num === 1 && console.log(iconv.decode(iconv.encode(row.values, 'binary'), 'gbk'));
    const list = [];
    let keyIndx = 0;
    let keyStr = options.mainName + '_' || ''; // 有最大字数限制？

    row.eachCell((cell,number) => { // number 1 开始
      const val = iconv.decode(iconv.encode(cell.value, 'binary'), encStr);
      if(keyArr.length > 0 && keyArr[keyIndx] != null && keyArr[keyIndx] === number - 1) { //作为组件
        keyStr += val + '_';
        keyIndx++ // 移除第一个
      }

      list.push(val)
    })

    if(keyObj[keyStr]) {
      keyObj[keyStr].push(list)
      // if(keyObj[keyStr].length > 500) {// 超过数量 保存并清除
      //   await saveSplitXlsx(path.join(dirPath + keyStr), keyObj[keyStr]);
      // }
    }else {
      keyObj[keyStr] = [list]
    }
    
    // if(count >= 500) {
    // }
    // continue, break, return
  })
  const saveDir = path.join(path.dirname(filePath), 'files') ; // 存在当前excel目录 的files下
  fs.rmdirSync(saveDir, {recursive:true});// 删除当前目录所有后保存
  const keyList = Object.keys(keyObj)
  if(keyList && keyList.length > 100) {
    return Promise.reject('拆分成的文件太多，请重新分组')
  }
  const promises = keyList.map(async (key,idx) => {
    // if(idx > 1) return 
    if(!keyObj[key]) return Promise.resolve()
    console.log(keyObj[key].length);
    count += keyObj[key].length
    let basename = key.slice(0,-1); // 去掉最后一个 _
    basename += path.extname(filePath); // 文件后缀
    // const ps = await saveSplitXlsx(path.join(saveDir, basename), keyObj[key])
    // Common.to 为await 提供出错信息  Promise [data,error]
    return Common.to(saveSplitCsv(path.join(saveDir, basename), keyObj[key])) // 生成excel
  })
  console.log('处理总行数', count);
  const list = await Promise.all(promises)
  list.map(i => {
    const [err, data] = i;
    err && console.log('folderToZip failed:',err);
  })

  const [err, data] = await Common.to(folderToZip(saveDir)) // 压缩
  err && console.log('folderToZip failed:',err);
}

async function saveSplitCsv(filePath, list) {
  const dirPath = path.dirname(filePath);
  
  if(!mkdirsSync(dirPath)) {
    console.log('创建路径失败');
    return
  }


  // const stream = fs.createWriteStream(filePath, {encoding:'binary'})
  // const stream = fs.createWriteStream(filePath)
  // for(let i=0; list[i]; i++) {
  //   // stream.write(iconv.encode(list[i].join(',')+'\n', 'gbk'))
  //   stream.write(list[i])
  // }
  
  // stream.end()
  // return 
  // 写入文件
  
  const workbook = new Excel.Workbook()
  // const work = await workbook.csv.write(stream, { sheetName: 'sheet' });
  // const workbookWriter = new Excel.stream.xlsx.WorkbookWriter(options);
  const sheet = workbook.addWorksheet('sheet');
  for(let i=0; list[i]; i++) {
    await sheet.addRow(list[i]).commit()
  }
  let tt = 0
  const buf = await workbook.csv.writeFile(filePath)
  // fs.writeFile(filePath, buf,(err) => {
  //   err && console.log(err);
  // })

  return
  await workbook.csv.writeBuffer(filePath,{formatterOptions: {
    transform: (row,cb) => {
      tt++;
      tt < 2 && console.log(row);
      return row.map(i => {
        return iconv.encode(i, 'gbk')
      })
      return row
    }
  }}
  //   ,{map: (row,num) => {
  //   if(num == 2) {
  //     tt ++;
  //     tt == 3 && console.log(row);
  //       // console.log(row);
  //   }
  //   // return iconv.encode(row,'gbk')
  //   return iconv.decode(iconv.encode(row,'gbk'),'utf8')
  // }}
  )
  
  
}
/**
 *  拆分 Xlsx文件 
 *
 * @param {*} filePath
 * @param {*} keyArr 作为主键唯一值的列索引
 * @param {*} options 是否有首行title hasTitle; 拆分后文件名前缀 mainName
 */
async function splitXlsx(filePath, keyArray, options) {
  
  const dirPath = path.dirname(filePath);
  const option = {
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    worksheets: 'emit',
    styles: 'cache',
  };
  const keyObj = {}; // 主键枚举
  let count = 0; // 处理的行数
  let keyArr = keyArray.slice(); //浅复制
  const read = fs.createReadStream(filePath);
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(read, option);
  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      count++;
      if(options.hasTitle && count === 1) {// 是否去掉首行
        continue;
      }
      // ...
      const list = [];
      let keyIndx = 0;
      let keyStr = options.mainName + '_' || ''; // 有最大字数限制？
      row.eachCell((cell,number) => { // number 1 开始
        if(keyArr.length > 0 && keyArr[keyIndx] != null && keyArr[keyIndx] === number - 1) { //作为组件
          keyStr += cell.value + '_';
          keyIndx++ // 移除第一个
        }

        list.push(cell.value)
      })

      if(keyObj[keyStr]) {
        keyObj[keyStr].push(list)
        // if(keyObj[keyStr].length > 500) {// 超过数量 保存并清除
        //   await saveSplitXlsx(path.join(dirPath + keyStr), keyObj[keyStr]);
        // }
      }else {
        keyObj[keyStr] = [list]
      }
      
      // if(count >= 500) {
      // }
      // continue, break, return
    }
  }

  const saveDir = path.join(path.dirname(filePath), 'files') ; // 存在当前excel目录 的files下
  fs.rmdirSync(saveDir, {recursive:true});// 删除当前目录所有后保存
  console.log('处理总行数', count); 
  const keyList = Object.keys(keyObj)
  if(keyList && keyList.length > 100) {
    return Promise.reject('拆分成的文件太多，请重新分组')
  }
  const promises = keyList.map(async (key,idx) => {
    // if(idx > 1) return 

    let basename = key.slice(0,-1); // 去掉最后一个 _
    basename += path.extname(filePath); // 文件后缀
    // const ps = await saveSplitXlsx(path.join(saveDir, basename), keyObj[key])
    // Common.to 为await 提供出错信息  Promise [data,error]
    return  Common.to(saveSplitXlsx(path.join(saveDir, basename), keyObj[key])) // 生成excel
  })

  const list = await Promise.all(promises)
  list.map(i => {
    const [err, data] = i;
    err && console.log('folderToZip failed:',err);
  })
  

  const [err, data] = await Common.to(folderToZip(saveDir)) // 压缩
  err && console.log('folderToZip failed:',err);
}
/**
 * 保存拆分后的excel文件
 *
 * @param {*} filePath 文件路径
 * @param {*} list 数据
 */
async function saveSplitXlsx(filePath, list) {
  const dirPath = path.dirname(filePath);

  // console.log('====',filePath);
  if(!mkdirsSync(dirPath)) {
    console.log('创建路径失败');
    return
  }
  // 写入文件
  const options = {
    filename: filePath,
    // filename: 'folders/' + 'first',
    useStyles: true,
    useSharedStrings: true,
    zip: {
      zlib: { level: 9 }
    }
  };
  const workbookWriter = new Excel.stream.xlsx.WorkbookWriter(options);
  const sheet = workbookWriter.addWorksheet('sheet');
  for(let i=0; list[i]; i++) {
    
    await sheet.addRow(list[i]).commit()
  }
  // list.map(async i => {

  //   await sheet.addRow(i).commit()
  // })
  // console.log(list.length);
  // sheet.addRows(list, 'i');
  await workbookWriter.commit()

}

/**
 * 打包 文件夹  
 *
 * @param {*} dirPath 文件夹路径
 */
async function folderToZip(dirPath) {
  // 压缩
  const output = fs.createWriteStream(dirPath + '.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // 设置压缩级别
  })

  // 文件输出流结束
  output.on('close', function() {
    console.log('archiver完成文件的归档，文件输出流描述符已关闭')
  })
  // 数据源是否耗尽
  output.on('end', function() {
    console.log('数据源已耗尽')
  })
  // 存档警告
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('stat故障和其他非阻塞错误')
    } else {
      throw err
    }
  })
  // 存档出错
  archive.on('error', function(err) {
    throw err
  })

  // 通过管道方法将输出流存档到文件
  archive.pipe(output)
  // 从流中追加文件
  // const fileList = fs.readdirSync(dirPath);
  // for await (const file of fileList) {
  //   console.log(file);
  //   await archive.file(path.join(dirPath, file), { name: path.basename(file) })
  // }
  
  await archive.directory(dirPath + '/', 'files')// 文件夹的所有文件压缩 并将命名为“files” 在存档中
  //完成归档
  await archive.finalize()
}

module.exports = {
  getExcelLine,
  splitExcel,
  folderToZip

}
let json2ts = require("json2ts");
let fs = require('fs');
let path = require('path');
let readline = require('readline');

toUpperFirstLetter = function (text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
};
//console.log(__dirname)

var filePath = path.resolve('../protocols/');

fileDisplay(filePath);

function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
        if(err){
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath,filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror,stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹

                        if(isFile){
                          console.log(filedir);

                          let proto = "";
                          let input = fs.createReadStream(filedir, "utf8")
                          const rl = readline.createInterface({
                            input: input
                          });

                          //按行读取文件 异步
                          rl.on('line', (line) => {
                            //去掉 //后的内容
                            var n = line.indexOf('//');
                            line = line.substring(0, n != -1 ? n : line.length);
                            proto = proto + line;
                   
                          });

                          //按行读取文件结束
                          rl.on('close', (line) => {
                            let protoJson = JSON.parse(proto);
                            let rootObjectName = toUpperFirstLetter(protoJson.cmd);
                            let result = json2ts.convert(JSON.stringify(protoJson), rootObjectName+"Message")
                            fs.writeFileSync('../netMessage/' + rootObjectName + "Message" + '.ts', result);
                          });
                  
                        }
                        // if(isDir){
                        //     fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        // }
                    }
                })
            });
        }
    });
}

// 文件直接读取
// var proto = fs.readFileSync(filedir, "utf8");
// let protoJson = JSON.parse(proto);
// let rootObjectName = toUpperFirstLetter(protoJson.cmd);
// console.log("cmd = ", toUpperFirstLetter(protoJson.cmd));
// let result = json2ts.convert(JSON.stringify(protoJson), rootObjectName+"Message")
// fs.writeFileSync('../netMessage/' + rootObjectName + "Message" + '.ts', result);

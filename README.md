# json2ts

json2ts converts a JSON to TypeScript interfaces.

## Installation

```
npm install json2ts
```

## Usage
json2ts can be used as a Node.js module:

```
let json2ts = require("json2ts");
let result = json2ts.convert(jsonContent);

```

## Tests

```
npm test
```

## 解析json 生成 *.ts class文件
   * json2ts.js 文件已经被更新
   * node buildProto.js 生成协议文件
   

   *  npm install json2ts
   *  替换 json2ts.js 文件
   *  添加 buildProto.js 

```
{
	"uid": "25299219",
	"prepared": 1,
	"owner": 0,
	"master": 1,
	"viceMoney": 25,
	
	"head": {
		"img": "25577816",
		"icon": 0,
		"sex": 0
	},
	"positions": [12,23],
	"users": [
		{"name": "xxx", "age":12},
		{"name": "xxx", "age":12}
	],	
	"cmd": "user"
}

生成：
export class Head {
	img: string;
	icon: number;
	sex: number;
	constructor(data: any) {
		this.img = data.img;
		this.icon = data.icon;
		this.sex = data.sex;
	}
}

export class User {
	name: string;
	age: number;
	constructor(data: any) {
		this.name = data.name;
		this.age = data.age;
	}
}

export class UserMessage {
	uid: string;
	prepared: number;
	owner: number;
	master: number;
	viceMoney: number;
	head: Head;
	positions: number[];
	users: User[];
	cmd: string;
	constructor(data: any) {
		this.uid = data.uid;
		this.prepared = data.prepared;
		this.owner = data.owner;
		this.master = data.master;
		this.viceMoney = data.viceMoney;
		if (data.head) {
		    this.head = new Head(data.head);
		}
		this.positions = [];
		for (let i = 0; i < data.positions.length; i++) {
		    this.positions[i] = data.positions[i];
		}
		this.users = [];
		for (let i = 0; i < data.users.length; i++) {
		    this.users[i] = new User(data.users[i]);
		}
		this.cmd = data.cmd;
	}
}
```   
### Contributing
Feel free to submit a pull request if you find any bugs (to see a list of active issues, visit the [Issues section](https://github.com/GregorBiswanger/json2ts/issues)).
Please make sure all commits are properly documented.

### License
MIT-licensed

** Enjoy! **

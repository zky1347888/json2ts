var _ = require("underscore");
var Json2Ts = (function () {
    function Json2Ts() {
    }
    Json2Ts.prototype.convert = function (content, objectName) {
        var jsonContent = JSON.parse(content);
        if (_.isArray(jsonContent)) {
            return this.convertObjectToTsInterfaces(jsonContent[0], objectName);
        }
        return this.convertObjectToTsInterfaces(jsonContent, objectName);
    };
    Json2Ts.prototype.convertObjectToTsInterfaces = function (jsonContent, objectName) {
        if (objectName === void 0) { objectName = "RootObject"; }
        var optionalKeys = [];
        var objectResult = [];
        var constructor = [];
        for (var key in jsonContent) {
            var value = jsonContent[key];
            if (_.isObject(value) && !_.isArray(value)) {
                var childObjectName = this.toUpperFirstLetter(key);
                objectResult.push(this.convertObjectToTsInterfaces(value, childObjectName));
                jsonContent[key] = this.removeMajority(childObjectName) + ";";

                this.constructorAddObject(constructor, childObjectName, key);
            }
            else if (_.isArray(value)) {
                var arrayTypes = this.detectMultiArrayTypes(value);
                if (this.isMultiArray(arrayTypes)) {
                    var multiArrayBrackets = this.getMultiArrayBrackets(value);
                    if (this.isAllEqual(arrayTypes)) {
                        jsonContent[key] = arrayTypes[0].replace("[]", multiArrayBrackets);

                        this.constructorAddArray(constructor, key);
                    }
                    else {
                        jsonContent[key] = "any" + multiArrayBrackets + ";";

                        this.constructorAddArray(constructor, key);
                    }
                }
                else if (value.length > 0 && _.isObject(value[0])) {
                    var childObjectName = this.toUpperFirstLetter(key);
                    objectResult.push(this.convertObjectToTsInterfaces(value[0], childObjectName));
                    jsonContent[key] = this.removeMajority(childObjectName) + "[];";

                    this.constructorAddArrayObject(constructor, childObjectName, key);
                }
                else {
                    jsonContent[key] = arrayTypes[0];

                    this.constructorAddArray(constructor, key);
                }
            }
            else if (_.isDate(value)) {
                jsonContent[key] = "Date;";
                
                this.constructorAddBaseType(constructor, key);
            }
            else if (_.isString(value)) {
                jsonContent[key] = "string;";
                
                this.constructorAddBaseType(constructor, key);
            }
            else if (_.isBoolean(value)) {
                jsonContent[key] = "boolean;";
                
                this.constructorAddBaseType(constructor, key);
            }
            else if (_.isNumber(value)) {
                jsonContent[key] = "number;";
                
                this.constructorAddBaseType(constructor, key);
            }
            else {
                jsonContent[key] = "any;";
                optionalKeys.push(key);

                this.constructorAddBaseType(constructor, key);
            }
        }
        jsonContent["constructor(data: any)"] = constructor;
       
        var result = this.formatCharsToTypeScript(jsonContent, objectName, optionalKeys);
        objectResult.push(result);
        return objectResult.join("\n\n");
    };

    Json2Ts.prototype.constructorAddBaseType = function (constructor, key){
        constructor.push("this." + key + " = data." + key + ";");
    };

    Json2Ts.prototype.constructorAddObject = function (constructor, childObjectName, key){
        constructor.push("if (data." + key + ") {");
        constructor.push("    this." + key + " = new " + childObjectName + "(data." + key + ");");
        constructor.push("}");
    };

    Json2Ts.prototype.constructorAddArray = function (constructor, key){
        constructor.push("this." + key + " = [];");
        constructor.push("for (let i = 0; i < data." + key + ".length; i++) {");
        constructor.push("    this." + key +"[i] = data." + key + "[i];"  );
        constructor.push("}");
    };

    Json2Ts.prototype.constructorAddArrayObject = function (constructor, childObjectName, key){
        constructor.push("this." + key + " = [];");
        constructor.push("for (let i = 0; i < data." + key + ".length; i++) {");
        //constructor.push("    if (data." + key + ")");
        constructor.push("    this." + key + "[i] = new " + this.removeMajority(childObjectName) + "(data." + key + "[i]);");
        //constructor.push("    else");
        //constructor.push("        this." + key + "[i] = undefined;");
        constructor.push("}"  );
    };

    Json2Ts.prototype.detectMultiArrayTypes = function (value, valueType) {
        if (valueType === void 0) { valueType = []; }
        if (_.isArray(value)) {
            if (value.length === 0) {
                valueType.push("any[];");
            }
            else if (_.isArray(value[0])) {
                for (var index = 0, length_1 = value.length; index < length_1; index++) {
                    var element = value[index];
                    var valueTypeResult = this.detectMultiArrayTypes(element, valueType);
                    valueType.concat(valueTypeResult);
                }
            }
            else if (_.all(value, _.isString)) {
                valueType.push("string[];");
            }
            else if (_.all(value, _.isNumber)) {
                valueType.push("number[];");
            }
            else if (_.all(value, _.isBoolean)) {
                valueType.push("boolean[];");
            }
            else {
                valueType.push("any[];");
            }
        }
        return valueType;
    };
    Json2Ts.prototype.isMultiArray = function (arrayTypes) {
        return arrayTypes.length > 1;
    };
    Json2Ts.prototype.isAllEqual = function (array) {
        return _.all(array.slice(1), _.partial(_.isEqual, array[0]));
    };
    Json2Ts.prototype.getMultiArrayBrackets = function (content) {
        var jsonString = JSON.stringify(content);
        var brackets = "";
        for (var index = 0, length_2 = jsonString.length; index < length_2; index++) {
            var element = jsonString[index];
            if (element === "[") {
                brackets = brackets + "[]";
            }
            else {
                index = length_2;
            }
        }
        return brackets;
    };


    Json2Ts.prototype.replacepos = function (text,start,stop,replacetext){
            let newText = text.substring(0,stop-1)+replacetext+text.substring(stop+1);
            return newText;
    };

    Json2Ts.prototype.formatCharsToTypeScript = function (jsonContent, objectName, optionalKeys) {
        var result = JSON.stringify(jsonContent, null, "\t")
            .replace(new RegExp("\"", "g"), "")
            .replace(new RegExp(",", "g"), "");
        var allKeys = _.allKeys(jsonContent);
        for (var index = 0, length_3 = allKeys.length; index < length_3; index++) {
            var key = allKeys[index];
           
            if (_.contains(optionalKeys, key)) {
                result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + "?:");
            }
            else {
                result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + ":");
            }
        }

        result = result.replace("constructor(data: any): [", 'constructor(data: any) {');
        let indexOf = result.lastIndexOf("]");
        result = this.replacepos(result, indexOf, indexOf+1, "}\n");

        objectName = this.removeMajority(objectName);
       
        return "export class " + objectName + " " + result;
    };

    Json2Ts.prototype.removeMajority = function (objectName) {
        if (_.last(objectName, 3).join("").toUpperCase() === "IES") {
            return objectName.substring(0, objectName.length - 3) + "y";
        }
        else if (_.last(objectName).toUpperCase() === "S") {
            return objectName.substring(0, objectName.length - 1);
        }
        return objectName;
    };
    Json2Ts.prototype.toUpperFirstLetter = function (text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    ;
    Json2Ts.prototype.toLowerFirstLetter = function (text) {
        return text.charAt(0).toLowerCase() + text.slice(1);
    };
    ;
    Json2Ts.prototype.isJson = function (stringContent) {
        try {
            JSON.parse(stringContent);
        }
        catch (e) {
            return false;
        }
        return true;
    };
    return Json2Ts;
})();
exports.Json2Ts = Json2Ts;
//# sourceMappingURL=json2ts.js.map
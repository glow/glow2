var utility = {
    // essential stuff for TaskSpeed test by WebReflection
    // Mit Style License
    attachEvent:document.addEventListener?
        function(name, callback){
            this.addEventListener(name.slice(2), callback, false);
        }:
        function(name, callback){
            this.attachEvent(name, callback);
        }
    ,
    getSimple:document.createElement("p").querySelectorAll&&false?
        function(selector){
            return this.querySelectorAll(selector);
        }:
        function(selector){
            for(var
                split   = selector.split("."),
                result  = [],
                re      = new RegExp("(?:^|\\s)" + split[1] + "(?:\\s|$)"),
                list    = this.getElementsByTagName(split[0] || "*"),
                length  = list.length,
                i       = 0,
                j       = 0,
                node;
                i < length; ++i
            ){
                node = list[i];
                if(re.test(node.className))
                    result[j++] = node
                ;
            };
            return  result;
        }
    ,
    indexOf:Array.prototype.indexOf || function(value){
        var i = 0, length = this.length;
        while(i < length){
            if(this[i] === value)
                return i;
            ++i;
        };
        return -1;
    },
    detachEvent:document.removeEventListener?
        function(name, callback){
            this.removeEventListener(name.slice(2), callback, false);
        }:
        function(name, callback){
            this.detachEvent(name, callback);
        }
};
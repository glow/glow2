// TaskSpeed, the DOM way by WebReflection
woosh.addTests('puredom', {

    "make": function(){
        for(var
            d   = document, body = d.body,
            ul  = d.createElement("ul"),
            one  = d.createElement("li").appendChild(d.createTextNode("one")).parentNode,
            two  = d.createElement("li").appendChild(d.createTextNode("two")).parentNode,
            three= d.createElement("li").appendChild(d.createTextNode("three")).parentNode,
            i   = 0,
            fromcode;
            i < 250; ++i
        ){
            fromcode    = ul.cloneNode(true);
            fromcode.id = "setid" + i;
            fromcode.className = "fromcode";
            fromcode.appendChild(one.cloneNode(true));
            fromcode.appendChild(two.cloneNode(true));
            fromcode.appendChild(three.cloneNode(true));
            body.appendChild(fromcode);
        };
        return  utility.getSimple.call(body, "ul.fromcode").length;
    },

    "indexof" : function(){
        for(var
            indexOf = utility.indexOf,
            d = document, body = d.body,
            index = -1, i = 0;
            i < 20; ++i
        )
            index   = indexOf.call(body.getElementsByTagName("ul"), d.getElementById("setid150"))
        ;
        return  index;
    },

    "bind" : function(){
        for(var
            attachEvent = utility.attachEvent,
            callback = function(){},
            li = document.body.getElementsByTagName("li"),
            length = li.length, i = 0, total = 0,
            node;
            i < length; ++i
        ){
            node = li[i];
            if(node.parentNode.nodeName == "UL"){
                ++total;
                attachEvent.call(node, "onclick", callback);
            };
        };
        return  total;
    },

    "attr" : function(){
        for(var
            ul = document.body.getElementsByTagName("ul"),
            result = [],
            length = ul.length, i = 0;
            i < length; ++i
        )
            result[i] = ul[i].id
        ;
        return  result.length;
    },

    "bindattr" : function(){
        for(var
            attachEvent = utility.attachEvent,
            detachEvent = utility.detachEvent,
            callback = function(){},
            li = document.body.getElementsByTagName("li"),
            length = li.length, i = 0, total = 0,
            node;
            i < length; ++i
        ){
            node = li[i];
            if(node.parentNode.nodeName == "UL"){
                ++total;
                attachEvent.call(node, "onmouseover", callback);
                node.setAttribute("rel", "touched");
                detachEvent.call(node, "onmouseover", callback);
            };
        };
        return  total;
    },

    "table": function(){
        for(var
            d       = document, body = d.body,
            table   = d.createElement("table").appendChild(d.createElement("tbody")).parentNode,
            tr      = d.createElement("tr"),
            td      = d.createElement("td"),
            first   = td.cloneNode(true).appendChild(d.createTextNode("first")).parentNode,
            length  = 40,
            i = 0,
            madetable,
            cell;
            i < length; ++i
        ){
            madetable = table.cloneNode(true);
            madetable.className = "madetable";
            cell = body.appendChild(madetable).firstChild.appendChild(tr.cloneNode(true)).appendChild(first.cloneNode(true));
            cell.parentNode.insertBefore(td.cloneNode(true), cell);
        };
        tr = body.getElementsByTagName("tr");
        i = tr.length;
        for(var total = 0; i;)
            total += tr[--i].getElementsByTagName("td").length
        ;
        return  total;
    },

    "addanchor" : function(){
        var d = document, a = d.createElement("a");
        a.setAttribute("href", "http://example.com");
        a.appendChild(d.createTextNode("link"));
        for(var ul = utility.getSimple.call(d.body, "ul.fromcode"), length = ul.length, i = 0, total = 0, childNodes, j, len, node; i < length; ++i){
            if(node = ul[i].firstChild){
                do {
                    ++total;
                    node.appendChild(a.cloneNode(true));
                }   while(node = node.nextSibling);
            };
        };
        return  total;
    },

    "append": function(){
        for(var div = document.createElement("div"), body = document.body, i = 0, node; i < 500; ++i){
            node = div.cloneNode(true);
            node.setAttribute("rel", "foo2");
            body.appendChild(node);
        };
        for(var div = body.getElementsByTagName("div"), length = div.length, i = 0, total = 0; i < length; ++i)
            total += div[i].getAttribute("rel") === "foo2"
        ;
        return  total;
    },

    "addclass-odd" : function(){
        for(var div = document.body.getElementsByTagName("div"), length = div.length, i = 0, total = 0; i < length; ++i)
            total += i % 2 ? !!(div[i].className += " added odd") : !(div[i].className += " added");
        return  total;
    },

    "style" : function(){
        for(var div = utility.getSimple.call(document.body, "div.added"), length = div.length, i = 0, style; i < length; ++i){
            style = div[i].style;
            style.backgroundColor = "#ededed";
            style.color = "#fff";
        };
        return  length;
    },

    "removeclass" : function(){
        for(var re = /(?:^|\s)added(?:\s|$)/, div = utility.getSimple.call(document.body, "div.added"), length = div.length, i = 0, node; i < length; ++i){
            node = div[i];
            node.className = node.className.replace(re, "");
        };
        return  length;
    },
    
    "sethtml": function(){
        var div = document.body.getElementsByTagName("div"), i = 0, node;
        while(node = div[i++])
            node.innerHTML = "<p>new content</p>"
        ;
        return  div.length;
    },

    "insertbefore" : function(){
        for(var
            d = document, p = d.createElement("p"), ul = utility.getSimple.call(d.body, "ul.fromcode"), text = d.createTextNode("A Link"),
            length = ul.length, i = 0, total = 0;
            i < length; ++i
        ){
            for(var a = ul[i].getElementsByTagName("a"), len = a.length, j = 0, node; j < len; ++j){
                ++total;
                (node = a[j]).parentNode.insertBefore(p.cloneNode(true).appendChild(text.cloneNode(true)).parentNode, node);
            };                
        };
        return  total;
    },

    "insertafter" : function(){
        for(var
            d = document, p = d.createElement("p"), ul = utility.getSimple.call(d.body, "ul.fromcode"), text = d.createTextNode("After Link"),
            length = ul.length, i = 0, total = 0; i < length; ++i
        ){
            for(var a = ul[i].getElementsByTagName("a"), len = a.length, j = 0, node; j < len; ++j){
                ++total;
                (node = a[j]).parentNode.insertBefore(p.cloneNode(true).appendChild(text.cloneNode(true)).parentNode, node.nextSibling);
            };
        };
        return  total;
    },

    "destroy": function(){
        var ul = utility.getSimple.call(document.body, "ul.fromcode"), i = 0, node;
        while(node = ul[i++])
            node.parentNode.removeChild(node);
        ;
        return  i - 1;
    },

    "finale": function(){
        var body = document.body, node;
        while(node = body.firstChild)
            body.removeChild(node)
        ;
        return body.getElementsByTagName("*").length;
    }

});
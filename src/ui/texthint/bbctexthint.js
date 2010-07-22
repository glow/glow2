/*
 * BBC jQuery UI TextHint 1.8.2
 *
 * Copyright (c) 2010 BBC (http://jqueryui.com/about)
 * Copy my rights please!
 *
 * http:// .... ?
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function( $ ) {

    $.widget( "bbc.bbctexthint", {
        options : {
            hint : "Type something ...",
            revertOnEmpty : true
        },
        _create : function() {
            if ( this.element.val() == "" ) this._showHint();
            var self = this;
            this.element
                .bind("focus", function() {
                    var ele = $(this);
                    if ( ele.val() == self.options.hint ) {
                        self._hideHint();
                    }
                })
                .bind("blur", function() {
                    var ele = $(this);
                    if ( ele.val() == "" ) {
                        self._showHint();
                    }
                });
            this._showHint();
        },
        _showHint : function() {
            this.element
                .val( this.options.hint )
                .addClass("ui-inactive");
        },
        _hideHint : function() {
            this
                .element.val( "" )
                .removeClass("ui-inactive");
        }
    });


}( jQuery ));
/*
 * BBC jQuery UI Autocomplete 1.8.2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 *	jquery.ui.autocomplete.js
 */
(function( $ ) {

    $.widget( "bbc.bbcautocomplete", $.ui.autocomplete, {
        options : {
            extraWidth : 0
        },
        /**
         * Overrides the _suggest method of autocomplete
         * to account for padding by using outerWidth and
         * an "extraWidth" option passed to constructor.
         * 
         * Code comes from github, should be the default in
         * the next version of jQuery UI, minus the
         * extraWidth bit.
         * 
         * @private
         * @param Array items list of items to display
         * @returns void
         */
        _suggest: function( items ) {
            $.ui.autocomplete.prototype._suggest.apply(this, arguments);
            var ul = this.menu.element;
            menuWidth = ul.width( "" ).outerWidth();
            textWidth = this.element.outerWidth() + this.options.extraWidth;
            ul.width( Math.max( menuWidth, textWidth )
                - ( parseFloat( ul.css("paddingLeft") ) || 0 )
                - ( parseFloat( ul.css("paddingRight") ) || 0 )
                - ( parseFloat( ul.css("borderLeftWidth") ) || 0 )
                - ( parseFloat( ul.css("borderRightWidth") ) || 0 ) );
         
        }
    });


}( jQuery ));
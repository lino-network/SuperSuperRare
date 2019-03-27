module.exports = {
    getCookieServer: function(name, cookie) {
        if (cookie) {
            var v = cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : '';
        }
        return '';
    }
}

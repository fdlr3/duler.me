export class AuthManager {
    _user = null;
    _isAuthenticated = false;

    setToken(cvalue) {
        var d = new Date();
        d.setTime(d.getTime() + (60 * 60 * 1000)); //1 hour
        var expires = "expires=" + d.toUTCString();
        document.cookie = 'auth' + "=" + cvalue + ";" + expires + ";path=/";
    }

    getToken() {
        var name = 'auth=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    static get instance() { return authManager }
}

const authManager = new AuthManager();

export default authManager;



using Duler.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace Duler.Core {
    public class AuthorizeUserManager {


        public CajDbContext DB { get; }

        public AuthorizeUserManager(CajDbContext db) {
            DB = db;
        }

        public bool ValidateToken(HttpContext context) {
            if (context.Request.Headers.TryGetValue("auth", out StringValues token)) {
                return _ValidateToken(token.ToString());
            }
            return false;
        }

        public bool ValidateToken(string key) {
            return _ValidateToken(key);
        }

        private bool _ValidateToken(string key) {
            Debug.WriteLine($"{key} at {DateTime.Now}");
            try {
                if (string.IsNullOrEmpty(key) || key.Length != 256) {
                    var loginToken = DB.CajLogin.FirstOrDefault(x => x.Key == key);
                    if (loginToken != null) {
                        if (loginToken.Expiration > DateTime.Now) {
                            loginToken.Expiration = DateTime.Now.AddHours(1);
                            DB.SaveChanges();
                            return true;
                        } else {
                            DB.CajLogin.RemoveRange(DB.CajLogin.Where(x => x.Expiration < DateTime.Now));
                        }
                        DB.SaveChanges();
                    }
                }
            } catch (Exception) { }
            return false;
        }
    }
}

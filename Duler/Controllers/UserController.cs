using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Duler.Core;
using Duler.Data;
using Duler.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace Duler.Controllers {

    [ApiController]
    public class UserController : ControllerBase {

        private readonly CajDbContext _db;

        public UserController(CajDbContext db) {
            _db = db;
        }

        [HttpPost]
        [Route("/api/user/register")]
        public IActionResult Register([FromForm] RegisterUserModel model) {
            if(model.Username?.Count() > 0 && model.Password?.Count() > 0) {
                _db.CajUser.Add(new CajUser() {
                    Id = Guid.NewGuid(),
                    Password = UserManager.HashPassword(model.Password),
                    Username = model.Username
                });
                _db.SaveChanges();
                return Ok();
            }
            return NotFound();
        }

        [HttpPost]
        [Route("/api/user/login")]
        public IActionResult Login([FromForm] LoginModel model) {
            var user = _db.CajUser.FirstOrDefault(x => x.Username.ToLower() == model.Username.ToLower());
            if(user != null) {
                var pwHash = UserManager.HashPassword(model.Password);
                if(pwHash == user.Password) {
                    var cajLogin = _db.CajLogin.FirstOrDefault(x => x.CajUserFk == user.Id);
                    var key = UserManager.GenerateRandomKey(256);

                    int maxc = 0;
                    if(_db.CajLogin.Count() > 0) {
                        maxc = (int)_db.CajLogin.Select(x => x.Id).Max() + 1;
                    }

                    if (cajLogin == null) {
                        cajLogin = new CajLogin() {
                            CajUserFk = user.Id,
                            Creation = DateTime.Now,
                            Expiration = DateTime.Now.AddHours(1),
                            Key = key,
                            Id = maxc
                        };
                        _db.CajLogin.Add(cajLogin);
                    } else {
                        cajLogin.Key = key;
                        cajLogin.Creation = DateTime.Now;
                        cajLogin.Expiration = DateTime.Now.AddHours(1);
                        _db.CajLogin.Update(cajLogin);
                    }
                    _db.SaveChanges();
                    return Ok(key);
                }
            }
            return NotFound();
        }

        [HttpPost]
        [Route("/api/user/logout")]
        public IActionResult Logout([FromForm]LogoutModel model) {
            var loginKey = _db.CajLogin.FirstOrDefault(x => x.Key == model.Key);
            _db.CajLogin.Remove(loginKey);
            _db.SaveChanges();
            return Ok();
        }

        [HttpPost]
        [Route("/api/user/is-authorized")]
        public IActionResult IsAuthorized([FromForm] IsAuthorizedModel model) {
            return new AuthorizeUserManager(_db).ValidateToken(model.Token) ? StatusCode(200) : StatusCode(401);
        }

    }
}

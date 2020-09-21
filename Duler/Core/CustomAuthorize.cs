using Duler.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Duler.Core {
    public class CustomAuthorizeFilter : IAuthorizationFilter {

        private readonly CajDbContext _db;

        public CustomAuthorizeFilter(CajDbContext db) => _db = db;

        public void OnAuthorization(AuthorizationFilterContext context) {
            if (!new AuthorizeUserManager(_db).ValidateToken(context.HttpContext)) {
                context.Result = new ForbidResult();                
            }
        }

    }

    public class CustomAuthorize : TypeFilterAttribute {
        public CustomAuthorize() : base(typeof(CustomAuthorizeFilter)) {
            Arguments = new object[] { };
        }
    }
}

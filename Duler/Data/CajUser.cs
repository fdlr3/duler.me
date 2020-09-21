using System;
using System.Collections.Generic;

namespace Duler.Data
{
    public partial class CajUser
    {
        public CajUser()
        {
            CajLogin = new HashSet<CajLogin>();
        }

        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        public virtual ICollection<CajLogin> CajLogin { get; set; }
    }
}

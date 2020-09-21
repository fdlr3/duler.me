using System;
using System.Collections.Generic;

namespace Duler.Data
{
    public partial class CajLogin
    {
        public long Id { get; set; }
        public string Key { get; set; }
        public Guid CajUserFk { get; set; }
        public DateTime Creation { get; set; }
        public DateTime Expiration { get; set; }

        public virtual CajUser CajUserFkNavigation { get; set; }
    }
}

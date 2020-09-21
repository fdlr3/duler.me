using System;
using System.Collections.Generic;

namespace Duler.Data
{
    public partial class CajFile
    {
        public CajFile()
        {
            CajFileInFolder = new HashSet<CajFileInFolder>();
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }

        public virtual ICollection<CajFileInFolder> CajFileInFolder { get; set; }
    }
}

using System;
using System.Collections.Generic;

namespace Duler.Data
{
    public partial class CajFolder
    {
        public CajFolder()
        {
            CajFileInFolder = new HashSet<CajFileInFolder>();
        }

        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public DateTime? Modified { get; set; }

        public virtual ICollection<CajFileInFolder> CajFileInFolder { get; set; }
    }
}

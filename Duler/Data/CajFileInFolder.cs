using System;
using System.Collections.Generic;

namespace Duler.Data
{
    public partial class CajFileInFolder
    {
        public Guid Id { get; set; }
        public Guid FkFile { get; set; }
        public Guid FkFolder { get; set; }

        public virtual CajFile FkFileNavigation { get; set; }
        public virtual CajFolder FkFolderNavigation { get; set; }
    }
}

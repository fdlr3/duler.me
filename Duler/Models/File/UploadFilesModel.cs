using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Duler.Models {
    public class UploadFilesModel {
        public Guid FolderId { get; set; }
        public IFormFile[] Files { get; set; }
    }
}

using System;

namespace Duler.Models {
    public class EditFolderModel {
        public Guid CurrentFolderId { get; set; }
        public Guid? DestinationFolderId { get; set; }
        public string Name { get; set; }
    }
}

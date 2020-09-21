using Duler.Data;
using System;
using System.Collections.Generic;

namespace Duler.Models {
    public class ObjectsModel {

        public ObjectsModel() {
            ListObjects = new List<ObjectInFolderModel>();
        }

        public string Id { get; set; }
        public string Name { get; set; }
        public List<ObjectInFolderModel> ListObjects { get; set; }

        public class ObjectInFolderModel {
            public ObjectInFolderModel() { }

            public ObjectInFolderModel(CajFolder f) {
                Id = f.Id;
                Name = f.Name;
                Type = 1;
            }

            public ObjectInFolderModel(CajFile f) {
                Id = f.Id;
                Name = f.Name;
                Type = 0;
            }

            public Guid Id { get; set; }
            public string Name { get; set; }
            public byte Type { get; set; }
        }
    }

}

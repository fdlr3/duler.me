using Duler.Data;
using System;
using System.Collections.Generic;

namespace Duler.Models {
    public class ObjectsModel {

        public ObjectsModel() { }

        public ObjectsModel(CajFolder f) {
            Id = f.Id;
            Name = f.Name;
            Type = 1;
        }

        public ObjectsModel(CajFile f) {
            Id = f.Id;
            Name = f.Name;
            Type = 0;
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public byte Type { get; set; }
        public bool Hidden { get; set; } = false;
    }

}

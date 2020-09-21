using Duler.Core;
using Duler.Data;
using Duler.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Duler.Controllers {

    [ApiController]
    public class FolderController : ControllerBase {

        private readonly CajDbContext _db;
        private readonly ILogger<FolderController> _logger;

        public FolderController(CajDbContext db, ILogger<FolderController> logger) {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// GET - Get root folder guid
        /// </summary>
        /// <returns>Root folder GUID</returns>
        [HttpGet]
        [CustomAuthorize]
        [Route("/api/folder/root")]
        public IActionResult GetRootGUID() {
            var retFolder = _db.CajFolder.FirstOrDefault(x => x.ParentId == null);
            return Ok(retFolder?.Id.ToString() ?? string.Empty);
        }

        /// <summary>
        /// GET - Get breadcrumbs to folder
        /// </summary>
        /// <param name="id"></param>
        /// <returns>tuple; item1: id, item2: name</returns>
        [HttpGet]
        [CustomAuthorize]
        [Route("/api/folder/bread/{id?}")]
        public IEnumerable<Tuple<string, string>> Breadcrumbs(Guid id) {
            var listFolders = new List<Tuple<string, string>>();
            Guid curId = id;
            CajFolder curFolder = _db.CajFolder.FirstOrDefault(x => x.Id == curId);
            while ((curFolder = _db.CajFolder.FirstOrDefault(x => x.Id == curId)) != null) {
                listFolders.Add(new Tuple<string, string>(curFolder.Id.ToString(), curFolder.Name));
                if (!curFolder.ParentId.HasValue) break;
                curId = curFolder.ParentId.Value;
            }
            listFolders.Reverse();
            return listFolders;
        }

        /// <summary>
        /// GET - Get all items in a folder
        /// </summary>
        /// <param name="id">Folder GUID</param>
        /// <returns></returns>
        [HttpGet]
        [CustomAuthorize]
        [Route("/api/folder/{id?}")]
        public ObjectsModel Get(Guid? id) {
            try {

                var model = new ObjectsModel();
                //display root folder
                if (!id.HasValue) {
                    var root = _db.CajFolder.FirstOrDefault(x => x.ParentId == null);
                    model.Name = root.Name;
                    model.Id = root.Id.ToString();
                } else {
                    var folder = _db.CajFolder.FirstOrDefault(x => x.Id == id.Value);
                    model.Name = folder.Name;
                    model.Id = folder.Id.ToString();
                }

                model.ListObjects.AddRange(_db.CajFolder.Where(x => x.ParentId == new Guid(model.Id)).Select(x => new ObjectsModel.ObjectInFolderModel(x)).ToList());
                model.ListObjects.AddRange(_db.CajFileInFolder
                    .Where(x => x.FkFolder == new Guid(model.Id))
                    .Include(x => x.FkFileNavigation)
                    .Select(x => x.FkFileNavigation)
                    .Select(x => new ObjectsModel.ObjectInFolderModel(x)).ToList());
                return model;
            } catch (Exception ex) {
                _logger.LogInformation("{0} - Error: {1}", nameof(Get), ex.ToString());
            }
            return null;
        }

        [HttpPost]
        [CustomAuthorize]
        [Route("/api/folder")]
        public IActionResult Add([FromForm] EditFolderModel model) {
            var selectedFolder = _db.CajFolder.FirstOrDefault(x => x.Id == model.CurrentFolderId);
            if (selectedFolder != null) {
                //editing folder
                if (model.DestinationFolderId.HasValue) {
                    var existingFolder = _db.CajFolder.FirstOrDefault(x => x.Id == model.DestinationFolderId.Value);
                    if (existingFolder != null) {
                        existingFolder.Name = model.Name;
                        _db.CajFolder.Update(existingFolder);
                        _db.SaveChanges();
                    }
                } else {
                    _db.CajFolder.Add(new CajFolder() {
                        Id = Guid.NewGuid(),
                        Created = DateTime.Now,
                        Modified = DateTime.Now,
                        Name = model.Name,
                        ParentId = model.CurrentFolderId
                    });
                    _db.SaveChanges();
                }
            }
            return Ok();
        }

        [HttpPost]
        [CustomAuthorize]
        [Route("/api/folder/{id}")]
        public IActionResult Delete(Guid id) {
            var folder = _db.CajFolder.FirstOrDefault(x => x.Id == id);
            if (folder != null) {
                var filesInFolder = _db.CajFileInFolder
                    .Where(x => x.FkFolder == id);

                //remove all files
                var listRemovedFiles = new List<CajFile>();
                foreach (var file in filesInFolder) {
                    listRemovedFiles.Add(_db.CajFile.FirstOrDefault(x => x.Id == file.FkFile));
                }
                _db.CajFileInFolder.RemoveRange(filesInFolder);
                _db.CajFile.RemoveRange(listRemovedFiles);

                _db.CajFolder.Remove(folder);
                _db.SaveChanges();
            }

            return Ok();
        }
    }
}

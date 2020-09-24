using Duler.Core;
using Duler.Data;
using Duler.Models;
using Duler.Models.Folder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Duler.Controllers {

    [ApiController]
    public class FolderController : ControllerBase {

        private readonly CajDbContext _db;
        private readonly ILogger<FolderController> _logger;
        private readonly IHostEnvironment _env;

        public FolderController(CajDbContext db, ILogger<FolderController> logger, IHostEnvironment env) {
            _db = db;
            _logger = logger;
            _env = env;
        }

        /// <summary>
        /// GET - Get root folder guid
        /// </summary>
        /// <returns>Root folder GUID</returns>
        [HttpGet]
        [CustomAuthorize]
        [Route("/api/folder-info/{id?}")]
        public IActionResult GetFolderInfo(Guid? id) {
            FolderInfoModel model = null;
            CajFolder retFolder = null;
            
            if(id.HasValue)
                retFolder = _db.CajFolder.FirstOrDefault(x => x.Id == id.Value);
            else
                retFolder = _db.CajFolder.FirstOrDefault(x => x.ParentId == null);

            if (retFolder != null)
                model = new FolderInfoModel() {
                    Id = retFolder.Id,
                    Name = retFolder.Name
                };
            return Ok(model);
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
        [Route("/api/folder/{id}")]
        public List<ObjectsModel> Get(Guid id) {
            try {
                var model = new List<ObjectsModel>();

                model.AddRange(_db.CajFolder.Where(x => x.ParentId.HasValue && x.ParentId.Value == id).Select(x => new ObjectsModel(x)).ToList());
                model.AddRange(_db.CajFileInFolder
                    .Where(x => x.FkFolder == id)
                    .Include(x => x.FkFileNavigation)
                    .Select(x => x.FkFileNavigation)
                    .Select(x => new ObjectsModel(x)).ToList());
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
            string rootPath = System.IO.Path.Combine(_env.ContentRootPath, "Uploads");
            var folder = _db.CajFolder.FirstOrDefault(x => x.Id == id);
            var filesToDelete = new List<string>();

            if (folder != null) {
                var filesInFolder = _db.CajFileInFolder
                    .Where(x => x.FkFolder == id);

                //remove all files
                var listRemovedFiles = new List<CajFile>();
                foreach (var file in filesInFolder) {
                    var selectedFile = _db.CajFile.FirstOrDefault(x => x.Id == file.FkFile);
                    listRemovedFiles.Add(selectedFile);
                    filesToDelete.Add(selectedFile.Id.ToString());
                }
                _db.CajFileInFolder.RemoveRange(filesInFolder);
                _db.CajFile.RemoveRange(listRemovedFiles);

                _db.CajFolder.Remove(folder);
                _db.SaveChanges();

                foreach(var file in filesToDelete)
                    CajStorage.Core.IOManager.RemoveFile(System.IO.Path.Combine(rootPath, file));
            }

            return Ok();
        }
    }
}

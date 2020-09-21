using CajStorage.Core;
using Duler.Core;
using Duler.Data;
using Duler.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Duler.Controllers {

    [ApiController]
    public class FileController : ControllerBase {

        private readonly CajDbContext _db;
        private readonly IHostEnvironment _environment;
        private readonly ILogger<FileController> _logger;

        public FileController(CajDbContext db, IHostEnvironment env, ILogger<FileController> logger) {
            _db = db;
            _environment = env;
            _logger = logger;
        }



        [HttpPost]
        [CustomAuthorize]
        [Route("/api/file/remove-files")]
        public IActionResult RemoveFiles([FromForm] SelectFilesModel model) {
            string rootPath = Path.Combine(_environment.ContentRootPath, "Uploads");
            foreach (Guid fileId in model.FileGuids) {
                var file = _db.CajFile.FirstOrDefault(x => x.Id == fileId);
                if (file != null) {
                    string filePath = Path.Combine(rootPath, file.Id.ToString());
                    if (IOManager.RemoveFile(filePath)) {
                        _db.CajFileInFolder.RemoveRange(_db.CajFileInFolder.Where(x => x.FkFile == file.Id));
                        _db.CajFile.Remove(file);
                    }
                }
            }
            _db.SaveChanges();
            return Ok();
        }

        [HttpPost]
        [CustomAuthorize]
        [Route("/api/file/upload")]
        public IActionResult UploadFiles([FromForm] UploadFilesModel model) {
            string rootPath = Path.Combine(_environment.ContentRootPath, "Uploads");
            try {
                var destFolder = _db.CajFolder.FirstOrDefault(x => x.Id == model.FolderId);
                if (!System.IO.Directory.Exists(rootPath))
                    Directory.CreateDirectory(rootPath);

                foreach (var file in model.Files) {
                    var cajFile = new CajFile() {
                        Created = DateTime.Now,
                        Id = Guid.NewGuid(),
                        Name = file.FileName,
                    };
                    _db.CajFile.Add(cajFile);
                    _db.CajFileInFolder.Add(new CajFileInFolder() {
                        FkFile = cajFile.Id,
                        FkFolder = destFolder.Id,
                        Id = Guid.NewGuid()
                    });

                    string serverFilePath = Path.Combine(rootPath, cajFile.Id.ToString());
                    string serverTempFilePath = $"{serverFilePath}.tmp";

                    //copy temp to file
                    using (var fileStream = new FileStream(serverTempFilePath, FileMode.Create)) {
                        var fileMemoryStream = file.OpenReadStream();
                        fileMemoryStream.CopyTo(fileStream);
                    }

                    if (IOManager.Compress(serverTempFilePath, serverFilePath)) {
                        _db.SaveChanges();
                        IOManager.RemoveFile(serverTempFilePath);
                    }
                }
            } catch (Exception ex) {
                _logger.Log(LogLevel.Information, $"Error uploading files: {ex}");
                return StatusCode(500);
            }

            return StatusCode(200);
        }

        [HttpPost]
        [CustomAuthorize]
        [Route("/api/file/prepare-download")]
        public string PrepareFilesDownload([FromForm] SelectFilesModel model) {
            string rootPath = Path.Combine(_environment.ContentRootPath, "Uploads");
            var decompressedFiles = new List<string>();

            //1. Create new folder
            string folderName = Guid.NewGuid().ToString();
            string destinationFolder = Path.Combine(rootPath, folderName);
            Directory.CreateDirectory(destinationFolder);

            //2. Decompress selected files into the new folder
            foreach (var fileGuid in model.FileGuids) {
                var file = _db.CajFile.FirstOrDefault(x => x.Id == fileGuid);
                string serverSourceFilePath = Path.Combine(rootPath, file.Id.ToString());
                string serverDestinationFilePath = Path.Combine(destinationFolder, file.Name);

                //3. Rename them to the original name
                if (IOManager.Decompress(serverSourceFilePath, serverDestinationFilePath)) {
                    decompressedFiles.Add(serverDestinationFilePath);
                }
            }


            //4. Compress them
            string serverCompressedFilePath = Path.Combine(destinationFolder, $"{folderName}.zip");
            if (IOManager.CompressFiles(decompressedFiles.ToArray(), serverCompressedFilePath)) {
                foreach (var decompressedFile in decompressedFiles)
                    IOManager.RemoveFile(decompressedFile);

                //5. Return destination folder name 
                return folderName;
            }

            return null;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("/api/file/download/{fileName}")]
        public IActionResult PrepareFilesDownload(Guid fileName) {
            _logger.LogInformation("PrepareFileDownload from :" + fileName.ToString());
            string rootPath = Path.Combine(_environment.ContentRootPath, "Uploads", fileName.ToString());
            string filePath = Path.Combine(rootPath, $"{fileName}.zip");
            using var fs = new CustomFileStream(rootPath, filePath, FileMode.Open, FileAccess.Read, FileShare.None, 4096);
            return File(fs.FileStream, "multipart/form-data", "files.zip");
        }
    }
}

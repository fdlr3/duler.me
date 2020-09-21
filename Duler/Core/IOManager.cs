using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace CajStorage.Core {
    public static class IOManager {

        /// <summary>
        /// Compress file
        /// </summary>
        /// <param name="fileName">The file path</param>
        /// <returns></returns>
        public static bool Compress(string fileName, string finalName) {
            try {
                using FileStream originalFileStream = File.OpenRead(fileName);
                using (FileStream compressedFileStream = File.Create(finalName)) {
                    using GZipStream compressionStream = new GZipStream(compressedFileStream, CompressionMode.Compress);
                    originalFileStream.CopyTo(compressionStream);
                }
                return true;
            } catch (Exception ex) {
                if (File.Exists(fileName))
                    File.Delete(fileName);
                throw ex;
            }
        }

        /// <summary>
        /// Decompress a file
        /// </summary>
        /// <param name="fileName">The file path</param>
        /// <returns></returns>
        public static bool Decompress(string fileName, string finalName) {
            try {
                using FileStream originalFileStream = File.OpenRead(fileName);
                using FileStream decompressedFileStream = File.Create(finalName);
                using GZipStream decompressionStream = new GZipStream(originalFileStream, CompressionMode.Decompress);
                decompressionStream.CopyTo(decompressedFileStream);
                return true;
            } catch (Exception ex) {
                if (File.Exists(finalName))
                    File.Delete(finalName);
                throw ex;
            }
        }

        /// <summary>
        /// Compress multiple files
        /// </summary>
        /// <param name="filesNames">The files to compress</param>
        /// <param name="destFile">the destination file</param>
        /// <returns></returns>
        public static bool CompressFiles(string[] filesNames, string destFile) {
            try {
                var zip = ZipFile.Open(destFile, ZipArchiveMode.Create);
                foreach (var file in filesNames) {
                    zip.CreateEntryFromFile(file, Path.GetFileName(file), CompressionLevel.Optimal);
                }
                zip.Dispose();
                return true;
            } catch (Exception ex) {
                if (File.Exists(destFile))
                    File.Delete(destFile);
                throw ex;
            }
        }

        public static bool RemoveFile(string file) {
            try {
                File.Delete(file);
                return true;
            } catch(Exception) { }
            return false;
        }

        public static bool IsFileLocked(string filePath) {
            try {
                using (FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None)) {
                    stream.Close();
                }
            } catch (IOException) {
                return true;
            }
            return false;
        }

    }
}

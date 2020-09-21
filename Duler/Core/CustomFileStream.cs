using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CajStorage.Core {
    public class CustomFileStream : IDisposable {
        public FileStream FileStream { get; }
        private readonly string _folderPath;
        private readonly string _filePath;

        public CustomFileStream
            (
                string folderPath,
                string filePath,
                FileMode fileMode,
                FileAccess fileAccess,
                FileShare fileShare,
                int bufferSize           
            ) 
        {
            _filePath = filePath;
            _folderPath = folderPath;
            FileStream = new FileStream
                (
                    filePath,
                    fileMode,
                    fileAccess,
                    fileShare,
                    bufferSize
                );
        }

        public void Dispose() {
            Task.Run(() => {
                int i = 0;
                while (IOManager.IsFileLocked(_filePath) && i < 200) {
                    Thread.Sleep(500);
                    i++;
                }
                Directory.Delete(_folderPath, true);
            });
        }

    }
}

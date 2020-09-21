using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Duler.Data
{
    public partial class CajDbContext : DbContext
    {
        public CajDbContext()
        {
        }

        public CajDbContext(DbContextOptions<CajDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<CajFile> CajFile { get; set; }
        public virtual DbSet<CajFileInFolder> CajFileInFolder { get; set; }
        public virtual DbSet<CajFolder> CajFolder { get; set; }
        public virtual DbSet<CajLogin> CajLogin { get; set; }
        public virtual DbSet<CajUser> CajUser { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlite("DataSource=CajStorage.db;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CajFile>(entity =>
            {
                entity.Property(e => e.Created).IsRequired();

                entity.Property(e => e.Name).IsRequired();
            });

            modelBuilder.Entity<CajFileInFolder>(entity =>
            {
                entity.Property(e => e.FkFile)
                    .IsRequired()
                    .HasColumnName("Fk_File");

                entity.Property(e => e.FkFolder)
                    .IsRequired()
                    .HasColumnName("Fk_Folder");

                entity.HasOne(d => d.FkFileNavigation)
                    .WithMany(p => p.CajFileInFolder)
                    .HasForeignKey(d => d.FkFile)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.FkFolderNavigation)
                    .WithMany(p => p.CajFileInFolder)
                    .HasForeignKey(d => d.FkFolder)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<CajFolder>(entity =>
            {
                entity.Property(e => e.Created).IsRequired();
            });

            modelBuilder.Entity<CajLogin>(entity =>
            {
                entity.HasIndex(e => e.Id)
                    .IsUnique();

                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.CajUserFk)
                    .IsRequired()
                    .HasColumnName("CajUser_FK");

                entity.Property(e => e.Creation).IsRequired();

                entity.Property(e => e.Expiration).IsRequired();

                entity.Property(e => e.Key).IsRequired();

                entity.HasOne(d => d.CajUserFkNavigation)
                    .WithMany(p => p.CajLogin)
                    .HasForeignKey(d => d.CajUserFk)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<CajUser>(entity =>
            {
                entity.HasIndex(e => e.Username)
                    .IsUnique();

                entity.Property(e => e.Password).IsRequired();

                entity.Property(e => e.Username).IsRequired();
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

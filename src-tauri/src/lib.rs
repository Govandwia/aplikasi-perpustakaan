use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
    Migration {
      version: 1,
      description: "create_initial_tables",
      sql: r#"
        CREATE TABLE IF NOT EXISTS buku (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          isbn TEXT,
          judul TEXT NOT NULL,
          pengarang TEXT NOT NULL,
          penerbit TEXT,
          tahun_terbit INTEGER,
          kategori TEXT,
          stok INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS transaksi (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_buku INTEGER,
          nama_peminjam TEXT NOT NULL,
          kontak_peminjam TEXT,
          tanggal_pinjam DATE,
          tenggat_waktu DATE,
          tanggal_kembali DATE,
          status TEXT,
          denda INTEGER DEFAULT 0,
          FOREIGN KEY(id_buku) REFERENCES buku(id)
        );
      "#,
      kind: MigrationKind::Up,
    }
  ];

  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:library.db", migrations).build())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn main() {
    // Load .env from the project root (one level up from src-tauri)
    println!("cargo:warning=Checking for .env at ../.env");
    match dotenvy::from_path_iter("../.env") {
        Ok(iter) => {
            println!("cargo:warning=.env found, loading variables");
            for item in iter {
                if let Ok((key, value)) = item {
                    println!("cargo:rustc-env={}={}", key, value);
                    println!("cargo:warning=Loaded env var: {}", key);
                }
            }
        }
        Err(e) => {
            println!("cargo:warning=Failed to load .env: {}", e);
        }
    }

    // Rerun if .env changes
    println!("cargo:rerun-if-changed=../.env");

    tauri_build::build()
}

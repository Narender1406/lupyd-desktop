set -e

cargo build --lib

# cargo ndk -t armeabi-v7a -t arm64-v8a -o ./out/jniLibs build --release

cargo ndk -t arm64-v8a -o ./out/jniLibs build --release

cargo run --bin uniffi-bindgen -- generate -n -l kotlin -o out --library target/debug/libfirefly_signal.so --config uniffi.toml

use std::{
    fmt::Display,
    time::{SystemTime, UNIX_EPOCH},
};

use bytes::{Bytes, BytesMut};
use rand::{CryptoRng, SeedableRng};

lazy_static::lazy_static! {
    pub static ref HTTP_CLIENT: reqwest::Client = reqwest::Client::new();
}

pub fn get_current_timestamp_millis_since_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("TIME WENT BACKWARDS")
        .as_millis() as u64
}

pub fn get_current_timestamp_seconds_since_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("TIME WENT BACKWARDS")
        .as_secs() as u64
}

pub fn get_current_timestamp_microseconds_since_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("TIME WENT BACKWARDS")
        .as_micros() as u64
}

pub fn rng() -> impl CryptoRng {
    rand_chacha::ChaCha20Rng::from_os_rng()
}

pub fn deserialize_proto<T: prost::Message + Default>(
    bytes: &[u8],
) -> Result<T, prost::DecodeError> {
    T::decode(bytes)
}

pub fn serialize_proto<T: prost::Message>(msg: &T) -> Result<Bytes, prost::EncodeError> {
    let mut buf = BytesMut::with_capacity(msg.encoded_len());
    msg.encode(&mut buf)?;
    Ok(buf.freeze())
}

pub fn write_url_comma_seperated(
    mut w: impl std::fmt::Write,
    mut iter: impl Iterator<Item = impl Display>,
) -> Result<(), std::fmt::Error> {
    let Some(first) = iter.next() else {
        return Ok(());
    };

    write!(w, "{}", first)?;

    for cur in iter {
        write!(w, "%2C{}", cur)?;
    }

    Ok(())
}

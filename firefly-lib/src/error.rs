use std::{backtrace::Backtrace, error::Error, fmt};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum DumbError {
    Generic(String, String),
}

// Catch-all: anything that implements Display (and Error)
impl<E> From<E> for DumbError
where
    E: Error + Send + Sync + 'static,
{
    fn from(err: E) -> Self {
        Self::new(err.to_string())
    }
}

impl DumbError {
    pub fn new(arg: impl Into<String>) -> Self {
        let bt = Backtrace::force_capture();

        let bt_str = bt.to_string();

        Self::Generic(arg.into(), bt_str)
    }

    pub fn from_anyhow(err: anyhow::Error) -> Self {
        Self::Generic(err.to_string(), err.backtrace().to_string())
    }
}

impl fmt::Display for DumbError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DumbError::Generic(err, bt) => {
                f.write_str(&err)?;
                f.write_str("\nBacktrace: \n")?;
                f.write_str(&bt)?;
                Ok(())
            }
        }
    }
}

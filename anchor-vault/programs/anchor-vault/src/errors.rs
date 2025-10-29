use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Not enough Tokens")]
    InsufficientTokenAmount,
    #[msg("Overflow")]
    Overflow,
    #[msg("Underflow")]
    Underflow,
}

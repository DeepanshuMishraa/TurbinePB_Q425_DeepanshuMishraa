use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub amount: u64,
    pub token: Pubkey,
    pub bump: u8,
}

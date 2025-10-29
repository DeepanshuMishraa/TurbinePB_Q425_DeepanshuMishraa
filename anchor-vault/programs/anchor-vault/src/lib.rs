#![allow(unexpected_cfgs, deprecated, unused_imports)]
use anchor_lang::prelude::*;
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub use instructions::*;

declare_id!("J2rhNdTzjTQnK4Fn7rshVA5URL2y4atWpagAYAEXsaoh");

#[program]
pub mod anchor_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        let vault_bump = ctx.bumps.vault_state;
        let mint_key = ctx.accounts.mint.key();

        ctx.accounts.initialize(amount, vault_bump, mint_key)?;
        Ok(())
    }

    pub fn deposit(ctx: Context<VaultFunctions>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<VaultFunctions>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)?;
        Ok(())
    }
}

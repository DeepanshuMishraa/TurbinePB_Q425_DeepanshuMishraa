use anchor_lang::prelude::*;

declare_id!("5xvY6VY9hUkAHtnbV6HhSRwDUw6kNC3ynBK9xz7Us3oq");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello Solana!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

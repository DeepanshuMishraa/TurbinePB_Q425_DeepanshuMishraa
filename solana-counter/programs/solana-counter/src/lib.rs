use anchor_lang::prelude::*;

declare_id!("8ZkYg7ZEYthAYbiBseLAf7bV2pXnBguMDtTyhAsxxt5U");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod solana_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello and Welcome to the Solana Counter Program!");

        let counter = &mut ctx.accounts.counter;
        counter.count = 0;

        msg!(
            "The counter has been initialized with a count of {}",
            counter.count
        );
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>, value: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += value;

        msg!(
            "The counter has been incremented by {} to {}",
            value,
            counter.count
        );
        Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>, value: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count >= value, ErrorCode::Underflow);
        counter.count -= value;

        msg!(
            "The counter has been decremented by {} to {}",
            value,
            counter.count
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8,
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The value of counter can't be negative")]
    Underflow,
}

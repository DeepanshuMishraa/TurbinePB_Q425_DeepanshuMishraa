use crate::errors::ErrorCode;
use crate::state::VaultState;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
pub struct VaultFunctions<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds=[b"state", user.key().as_ref()],
        bump,
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        associated_token::mint= mint,
        associated_token::authority=user,
        associated_token::token_program= token_program
    )]
    pub user_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint= mint,
        associated_token::authority=vault_state,
        associated_token::token_program= token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> VaultFunctions<'info> {
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        require!(
            self.vault_state.amount >= amount,
            ErrorCode::InsufficientTokenAmount
        );
        let user_address = self.user.key();

        let seeds = &[b"state", user_address.as_ref(), &[self.vault_state.bump]];

        let signer_seed = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.user_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            authority: self.vault_state.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seed);

        transfer_checked(cpi_ctx, amount, self.mint.decimals)?;
        self.vault_state.amount = self
            .vault_state
            .amount
            .checked_sub(amount)
            .ok_or(ErrorCode::Underflow)?;
        Ok(())
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.user_ata.to_account_info(),
            to: self.vault.to_account_info(),
            mint: self.mint.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, amount, self.mint.decimals)?;
        self.vault_state.amount = self
            .vault_state
            .amount
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}

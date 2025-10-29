use crate::constants::ANCHOR_DISCRIMINATOR;
use crate::state::VaultState;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer=user,
        seeds=[b"state", user.key().as_ref()],
        bump,
        space= VaultState::INIT_SPACE + ANCHOR_DISCRIMINATOR
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        init,
        payer=user,
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

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, _amount: u64, vault_bump: u8, mint_key: Pubkey) -> Result<()> {
        self.vault_state.amount = _amount;
        self.vault_state.bump = vault_bump;
        self.vault_state.token = mint_key;
        Ok(())
    }
}

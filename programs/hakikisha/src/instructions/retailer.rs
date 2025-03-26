use anchor_lang::prelude::*;

use crate::hakikisha_accounts::*;
use super::HakikishaError;

#[derive(Accounts)]
#[instruction(product_id: String)]
pub struct MarkAsSold<'info> {
    #[account(mut)]
    pub retailer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"product", product_id.as_bytes()],
        bump,
        constraint = product_account.current_owner == retailer.key() @ HakikishaError::Unauthorised
    )]
    pub product_account: Account<'info, Product>,

    #[account(
        seeds = [b"retailer", retailer.key().as_ref()],
        bump,
        constraint = retailer_account.is_verified @ HakikishaError::Unauthorised
    )]
    pub retailer_account: Account<'info, Retailer>
}

pub fn mark_as_sold(
    ctx: Context<MarkAsSold>,
    product_id: String
) -> Result<()> {
    msg!("Marking a product {} as sold", product_id);

    let product = &mut ctx.accounts.product_account;
    // Ensure the product is not already sold since products can only be sold once
    require!(product.status == ProductStatus::Unsold, HakikishaError::InvalidProductStatus);
    product.status = ProductStatus::Sold;

    msg!("Product marked as sold");
    
    Ok(())
}
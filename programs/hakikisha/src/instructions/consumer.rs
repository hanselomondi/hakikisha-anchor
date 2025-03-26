use anchor_lang::prelude::*;

use crate::hakikisha_accounts::*;

#[derive(Accounts)]
#[instruction(product_id: String)]
pub struct ReportCounterfeit<'info> {
    #[account(mut)]
    pub reporter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"product", product_id.as_ref()],
        bump
    )]
    pub product: Account<'info, Product>
}

// instruction handler
pub fn report_counterfeit(
    ctx: Context<ReportCounterfeit>,
    product_id: String
) -> Result<()> {
    msg!("Reporting product {} as counterfeit", product_id);

    let product = &mut ctx.accounts.product;
    product.is_reported = true;

    Ok(())
}
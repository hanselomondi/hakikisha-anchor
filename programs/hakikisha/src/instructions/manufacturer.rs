use anchor_lang::prelude::*;

use crate::hakikisha_accounts::*;
use super::{HakikishaError, ANCHOR_DISCRIMINATOR_SIZE};


// Register product context
#[derive(Accounts)]
#[instruction(product_id: String)]
pub struct RegisterProduct<'info> {
    #[account(mut)]
    pub manufacturer: Signer<'info>,    

    #[account(
        init,
        payer = manufacturer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Product::INIT_SPACE,
        seeds = [b"product", product_id.as_bytes()],
        bump
    )]
    pub product: Account<'info, Product>,

    #[account(
        seeds = [b"manufacturer", manufacturer.key().as_ref()],
        bump,
        constraint = manufacturer_account.is_verified @ HakikishaError::Unauthorised
    )]
    pub manufacturer_account: Account<'info, Manufacturer>,

    pub system_program: Program<'info, System>,
}

// Register product instruction handler
pub fn register_product(
    ctx: Context<RegisterProduct>,
    product_id: String,
    batch_number: u64,  // Possibly change this to String type.
    production_date: u64,
    name: String,
    description: String
) -> Result<()> {
    // Check that all arguments passed are valid
    require!(product_id.to_string().len() <= MAX_PRODUCT_ID_LEN, HakikishaError::StringTooLong);
    require!(batch_number.to_string().len() <= MAX_BATCH_NUMBER_LEN, HakikishaError::StringTooLong);
    require!(name.len() <= MAX_NAME_LEN, HakikishaError::StringTooLong);
    require!(description.len() <= MAX_DESCRIPTION_LEN, HakikishaError::StringTooLong);

    msg!("Registering product...");

    let product = &mut ctx.accounts.product;
    product.product_id = product_id;
    product.manufacturer = ctx.accounts.manufacturer.key();
    product.current_owner = ctx.accounts.manufacturer.key();
    product.batch_number = batch_number;
    product.production_date = production_date;
    product.name = name;
    product.description = description;
    product.status = ProductStatus::Unsold;
    product.is_reported = false;

    msg!("Product registered successfully: {:?}", product);
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(product_id: String, new_owner_wallet: Pubkey)]
pub struct TransferProduct<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"product", product_id.as_ref()],
        bump,
        constraint = product_account.current_owner == current_owner.key() @ HakikishaError::Unauthorised
    )]
    pub product_account: Account<'info, Product>,

    #[account(
        seeds = [b"reatiler", new_owner_wallet.as_ref()],
        bump,
        constraint = new_owner_account.is_verified @ HakikishaError::Unauthorised
    )]
    pub new_owner_account: Account<'info, Retailer>
}

// Transfer product instruction handler
pub fn transfer_product(
    ctx: Context<TransferProduct>,
    product_id: String,
    new_owner_wallet: Pubkey
) -> Result<()> {
    msg!("Transfering product...");
    msg!("Product_id: {}", product_id);
    msg!("New owner wallet address: {}", new_owner_wallet);

    let product = &mut ctx.accounts.product_account;
    product.current_owner = new_owner_wallet;

    msg!("Product transferred successfully.");

    Ok(())
}

#[error_code]
pub enum ProductError {
    #[msg("Product already exists")]
    ProductExists,
    #[msg("Product not found")]
    ProductNotFound
}
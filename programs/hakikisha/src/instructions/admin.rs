use anchor_lang::prelude::*;

use crate::hakikisha_accounts::*;
use super::{HakikishaError, ANCHOR_DISCRIMINATOR_SIZE};


#[derive(Accounts)]
#[instruction(name: String, license_number: String)]
pub struct RegisterManufacturer<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = ANCHOR_DISCRIMINATOR_SIZE + Manufacturer::INIT_SPACE,
        seeds = [b"manufacturer", manufacturer_wallet.key().as_ref()],
        bump
    )]
    pub manufacturer: Account<'info, Manufacturer>,

    /// CHECK: Stores the wallet address; no manipulation
    pub manufacturer_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>
}

pub fn register_manufacturer(
    ctx: Context<RegisterManufacturer>,
    name: String,
    license_number: String
) -> Result<()> {
    msg!("Checking admin key...");
    // Only the admin can access this instruction
    require!(
        ctx.accounts.admin.key() == crate::ADMIN_PUBKEY,
        HakikishaError::Unauthorised
    );

    require!(name.len() <= MAX_NAME_LEN, HakikishaError::StringTooLong);
    require!(license_number.len() <= MAX_LICENSE_LEN, HakikishaError::StringTooLong);

    msg!("Registering manufacturer...");
    let manufacturer = &mut ctx.accounts.manufacturer;
    manufacturer.wallet_address = ctx.accounts.manufacturer_wallet.key();
    manufacturer.name = name;
    manufacturer.license_number = license_number;
    manufacturer.is_verified = true; 
    msg!("Manufacturer registered successfully");
    Ok(())
}


#[derive(Accounts)]
#[instruction(name: String, license_number: String)]
pub struct RegisterRetailer<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = ANCHOR_DISCRIMINATOR_SIZE + Retailer::INIT_SPACE,
        seeds = [b"retailer", retailer_wallet.key().as_ref()],
        bump
    )]
    pub retailer: Account<'info, Retailer>,

    /// CHECK: Stores the wallet address; no manipulation
    pub retailer_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>
}

pub fn register_retailer(
    ctx: Context<RegisterRetailer>,
    name: String,
    license_number: String
) -> Result<()> {
    msg!("Checking admin key...");
    // Only the admin can access this instruction
    require!(
        ctx.accounts.admin.key() == crate::ADMIN_PUBKEY,
        HakikishaError::Unauthorised
    );
    
    require!(name.len() <= MAX_NAME_LEN, HakikishaError::StringTooLong);
    require!(license_number.len() <= MAX_LICENSE_LEN, HakikishaError::StringTooLong);

    msg!("Registering retailer...");
    let retailer = &mut ctx.accounts.retailer;
    retailer.wallet_address = ctx.accounts.retailer_wallet.key();
    retailer.name = name;
    retailer.license_number = license_number;
    retailer.is_verified = true;
    msg!("Retailer registered successfully");

    Ok(())
}

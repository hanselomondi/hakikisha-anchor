#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

declare_id!("DcwAxf5Tv7vGcecbnHM7QeeRAdy2nAjts7deAcbKnbHf");

pub const ADMIN_PUBKEY: Pubkey = pubkey!("F3h2Kz7e1j8sM9A6q4L5X7Y2B3D9E5G7F2KJ3H4A9L6M");

mod hakikisha_accounts;
mod instructions;

use crate::instructions::{admin::*, manufacturer::*, retailer::*, consumer::*};

#[program]
pub mod hakikisha {
    use super::*;

    // Admin instructions
    pub fn register_manufacturer(
        ctx: Context<RegisterManufacturer>,
        name: String,
        license_number: String
    ) -> Result<()> {
        crate::instructions::admin::register_manufacturer(ctx, name, license_number)
    }

    pub fn register_retailer(
        ctx: Context<RegisterRetailer>,
        name: String,
        license_number: String
    ) -> Result<()> {
        crate::instructions::admin::register_retailer(ctx, name, license_number)
    }

    // Manufacturer instructions
    pub fn register_product(
        ctx: Context<RegisterProduct>,
        product_id: String,
        batch_number: u64,
        production_date: u64,
        name: String,
        description: String
    ) -> Result<()> {
        crate::instructions::manufacturer::register_product(ctx, product_id, batch_number, production_date, name, description)
    }

    pub fn transfer_product(
        ctx: Context<TransferProduct>,
        product_id: String,
        new_owner_address: Pubkey
    ) -> Result<()> {
        crate::instructions::manufacturer::transfer_product(ctx, product_id, new_owner_address)
    }

    // Retailer instructions
    pub fn mark_as_sold(
        ctx: Context<MarkAsSold>,
        product_id: String
    ) -> Result<()> {
        crate::instructions::retailer::mark_as_sold(ctx, product_id)
    }

    // Consumer instructions
    pub fn report_counterfeit(
        ctx: Context<ReportCounterfeit>,
        product_id: String
    ) -> Result<()> {
        crate::instructions::consumer::report_counterfeit(ctx, product_id)
    }
}

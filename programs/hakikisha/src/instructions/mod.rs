use anchor_lang::prelude::*;

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

pub mod consumer;
pub mod manufacturer;
pub mod retailer;
pub mod admin;

#[error_code]
pub enum HakikishaError {
    #[msg("Unauthorised access")]
    Unauthorised,
    #[msg("String exceeds maximum length")]
    StringTooLong,
    #[msg("Product already marked as sold")]
    ProductAlreadySold
}
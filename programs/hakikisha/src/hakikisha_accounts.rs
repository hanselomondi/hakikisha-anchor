use anchor_lang::prelude::*;

pub const MAX_NAME_LEN: usize = 50;
pub const MAX_LICENSE_LEN: usize = 20;
pub const MAX_PRODUCT_ID_LEN: usize = 32;
pub const MAX_BATCH_NUMBER_LEN: usize = 20;
pub const MAX_DESCRIPTION_LEN: usize = 280;

// Manufacturer account
#[account]
#[derive(Debug, InitSpace)]
pub struct Manufacturer {
    pub wallet_address: Pubkey,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    #[max_len(MAX_LICENSE_LEN)]
    pub license_number: String,
    pub is_verified: bool
}

// Retiler account
#[account]
#[derive(Debug, InitSpace)]
pub struct Retailer {
    pub wallet_address: Pubkey,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    #[max_len(MAX_LICENSE_LEN)]
    pub license_number: String,
    pub is_verified: bool
}

// Product account
#[account]
#[derive(Debug, InitSpace)]
pub struct Product {
    #[max_len(MAX_PRODUCT_ID_LEN)]
    pub product_id: String,
    pub manufacturer: Pubkey,
    pub current_owner: Pubkey,
    pub status: ProductStatus,
    pub production_date: u64,
    pub batch_number: u64,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    #[max_len(MAX_DESCRIPTION_LEN)]
    pub description: String,
    pub is_reported: bool,
}

// Product status
// #[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Debug, PartialEq, Clone, InitSpace)]
pub enum ProductStatus {
    Unsold,
    Sold
}
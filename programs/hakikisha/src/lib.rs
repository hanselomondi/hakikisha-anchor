use anchor_lang::prelude::*;

declare_id!("DcwAxf5Tv7vGcecbnHM7QeeRAdy2nAjts7deAcbKnbHf");

#[program]
pub mod hakikisha {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

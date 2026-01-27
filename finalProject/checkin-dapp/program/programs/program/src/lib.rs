use anchor_lang::prelude::*;

declare_id!("B5Zjd3jeSG45nRbbBJqAttHm7aVBFERuGXJv9Pm4WXpd");

#[program]
pub mod program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

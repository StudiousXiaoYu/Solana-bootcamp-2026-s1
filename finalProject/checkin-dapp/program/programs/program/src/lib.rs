use anchor_lang::prelude::{
    Account, Clock, Context, InitSpace, Program as AnchorProgram, Pubkey, Result, Signer, System,
};

anchor_lang::declare_id!("B5Zjd3jeSG45nRbbBJqAttHm7aVBFERuGXJv9Pm4WXpd");

pub const USER_CHECKIN_SEED: &[u8] = b"user_checkin";

#[program]
pub mod checkin_program {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_checkin = &mut ctx.accounts.user_checkin;
        user_checkin.authority = ctx.accounts.authority.key();
        user_checkin.total_checkins = 0;
        user_checkin.last_checkin_day = -1;
        user_checkin.streak = 0;
        user_checkin.bump = ctx.bumps.user_checkin;
        Ok(())
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        let clock = Clock::get()?;
        let day_index = clock.unix_timestamp / 86_400;

        let user_checkin = &mut ctx.accounts.user_checkin;
        if user_checkin.last_checkin_day == day_index {
            return Err(CheckinError::AlreadyCheckedInToday.into());
        }

        let new_streak = if user_checkin.last_checkin_day >= 0
            && day_index == user_checkin.last_checkin_day + 1
        {
            user_checkin.streak.saturating_add(1)
        } else {
            1
        };

        user_checkin.total_checkins = user_checkin.total_checkins.saturating_add(1);
        user_checkin.last_checkin_day = day_index;
        user_checkin.streak = new_streak;

        Ok(())
    }

    pub fn set_last_checkin_day(
        ctx: Context<SetLastCheckinDay>,
        last_checkin_day: i64,
    ) -> Result<()> {
        let user_checkin = &mut ctx.accounts.user_checkin;
        user_checkin.last_checkin_day = last_checkin_day;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + UserCheckin::INIT_SPACE,
        seeds = [USER_CHECKIN_SEED, authority.key().as_ref()],
        bump
    )]
    pub user_checkin: Account<'info, UserCheckin>,

    pub system_program: AnchorProgram<'info, System>,
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_CHECKIN_SEED, authority.key().as_ref()],
        bump = user_checkin.bump,
        has_one = authority
    )]
    pub user_checkin: Account<'info, UserCheckin>,
}

#[derive(Accounts)]
pub struct SetLastCheckinDay<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_CHECKIN_SEED, authority.key().as_ref()],
        bump = user_checkin.bump,
        has_one = authority
    )]
    pub user_checkin: Account<'info, UserCheckin>,
}

#[account]
#[derive(InitSpace)]
pub struct UserCheckin {
    pub authority: Pubkey,
    pub total_checkins: u32,
    pub last_checkin_day: i64,
    pub streak: u16,
    pub bump: u8,
}

#[error_code]
pub enum CheckinError {
    #[msg("今天已经打过卡啦！明天再来吧~")]
    AlreadyCheckedInToday,
}

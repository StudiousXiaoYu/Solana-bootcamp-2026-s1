import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import type { Program as CheckinProgram } from "../target/types/program";

describe("program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.program as Program<CheckinProgram>;
  const authority = provider.wallet.publicKey;
  const [userCheckin] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_checkin"), authority.toBuffer()],
    program.programId
  );

  it("Initialize user + check-in rules", async () => {
    await program.methods
      .initializeUser()
      .accounts({
        authority,
        userCheckin,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const initialAccount = await program.account.userCheckin.fetch(userCheckin);
    expect(initialAccount.authority.toBase58()).to.equal(authority.toBase58());
    expect(initialAccount.totalCheckins).to.equal(0);
    expect(initialAccount.streak).to.equal(0);

    await program.methods
      .checkIn()
      .accounts({
        authority,
        userCheckin,
      })
      .rpc();

    const afterFirst = await program.account.userCheckin.fetch(userCheckin);
    expect(afterFirst.totalCheckins).to.equal(1);
    expect(afterFirst.streak).to.equal(1);

    let threw = false;
    try {
      await program.methods
        .checkIn()
        .accounts({
          authority,
          userCheckin,
        })
        .rpc();
    } catch (e) {
      threw = true;
      const err = e as any;
      const code = err?.error?.errorCode?.code ?? err?.errorCode?.code;
      const message = String(err?.error?.errorMessage ?? err?.message ?? "");
      expect(code === "AlreadyCheckedInToday" || message.includes("今天已经打过卡")).to.equal(
        true
      );
    }
    expect(threw).to.equal(true);

    const dayIndex = Math.floor(Date.now() / 1000 / 86_400);

    await program.methods
      .setLastCheckinDay(new anchor.BN(dayIndex - 1))
      .accounts({
        authority,
        userCheckin,
      })
      .rpc();

    await program.methods
      .checkIn()
      .accounts({
        authority,
        userCheckin,
      })
      .rpc();

    const afterSecondDay = await program.account.userCheckin.fetch(userCheckin);
    expect(afterSecondDay.streak).to.equal(2);

    await program.methods
      .setLastCheckinDay(new anchor.BN(dayIndex - 10))
      .accounts({
        authority,
        userCheckin,
      })
      .rpc();

    await program.methods
      .checkIn()
      .accounts({
        authority,
        userCheckin,
      })
      .rpc();

    const afterReset = await program.account.userCheckin.fetch(userCheckin);
    expect(afterReset.streak).to.equal(1);
  });
});

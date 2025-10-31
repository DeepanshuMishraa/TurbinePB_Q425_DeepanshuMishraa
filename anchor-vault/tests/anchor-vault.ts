import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";
import {
  createAssociatedTokenAccount,
  createMint,
  getAssociatedTokenAddress,
  mintTo,
} from "@solana/spl-token";
import { use } from "chai";

describe("anchor-vault", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;
  const user = anchor.web3.Keypair.generate();
  const mintAuthority = anchor.web3.Keypair.generate();

  let mint: anchor.web3.PublicKey;
  let userAta: anchor.web3.PublicKey;
  let vaultState: anchor.web3.PublicKey;
  let vaultStateBump: number;
  let vault: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 2
      ),
      "confirmed"
    );

    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        mintAuthority.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 2
      ),
      "confirmed"
    );

    mint = await createMint(
      program.provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      9
    );

    userAta = await getAssociatedTokenAddress(mint, user.publicKey);

    await createAssociatedTokenAccount(
      program.provider.connection,
      user,
      mint,
      user.publicKey
    );

    await mintTo(
      program.provider.connection,
      mintAuthority,
      mint,
      userAta,
      mintAuthority.publicKey,
      1000_000_000
    );

    [vaultState, vaultStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), user.publicKey.toBuffer()],
      program.programId
    );

    vault = await getAssociatedTokenAddress(mint, vaultState, true);

    const tx = await program.methods
      .initialize(new anchor.BN(0))
      .accounts({
        user: user.publicKey,
        mint: mint,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc({ commitment: "confirmed" });

    console.log(`Initialization of vault complete with tx:${tx}`);

    const stx = await program.account.vaultState.fetch(vaultState);
    console.log(`vault state amount : ${stx.amount}`);

    console.log(`vault state bump : ${stx.bump}`);

    console.log(`Vault state token: ${stx.token}`);
  });

  it("Deposit Into Vault", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(1000_000_000))
      .accounts({
        user: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        mint: mint,
      })
      .signers([user])
      .rpc({ commitment: "confirmed" });

    console.log("Deposit into vault complete");

    const stx = await program.account.vaultState.fetch(vaultState);
    console.log(`vault state amount : ${stx.amount}`);
    console.log(`vault state bump : ${stx.bump}`);
    console.log(`Vault state token: ${stx.token}`);
  });

  it("Withdraw from Vault", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(1000_000))
      .accounts({
        user: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        mint: mint,
      })
      .signers([user])
      .rpc({ commitment: "confirmed" });

    console.log("Withdraw from vault complete");

    const stx = await program.account.vaultState.fetch(vaultState);
    console.log(`vault state amount : ${stx.amount}`);
    console.log(`vault state bump : ${stx.bump}`);
    console.log(`Vault state token: ${stx.token}`);
  });

  it("Withdraw More Than Vault amount", async () => {
    try {
      await program.methods
        .withdraw(new anchor.BN(2000_000_000))
        .accounts({
          user: user.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          mint: mint,
        })
        .signers([user])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      console.log("Failed to Withdraw: ", error);
    }
  });
});

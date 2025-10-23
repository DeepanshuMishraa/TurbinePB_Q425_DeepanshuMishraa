import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import BN from "bn.js";

describe("solana-counter", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.solanaCounter as Program<SolanaCounter>;
  const signer = anchor.web3.Keypair.generate(); //for signer account
  const counter = anchor.web3.Keypair.generate(); // for data account

  it("Is initialized!", async () => {
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    const tx = await program.methods
      .initialize()
      .accounts({
        signer: signer.publicKey,
        counter: counter.publicKey,
      })
      .signers([signer, counter])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Increment Counter", async () => {
    const txn = await program.methods
      .increment(new BN(100))
      .accounts({
        counter: counter.publicKey,
      })
      .rpc();

    console.log("Increment txn signature: ", txn);
  });

  it("Decrement Counter", async () => {
    const txn = await program.methods
      .decrement(new BN(100))
      .accounts({
        counter: counter.publicKey,
      })
      .rpc();

    console.log("Decrement txn signature: ", txn);
  });
});

import {
  airdropIfRequired,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import idl from "../target/idl/anchor_vault.json";
import * as anchor from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

async function getVault() {
  const user = await getKeypairFromFile();
  const mint_addr = new anchor.web3.PublicKey(
    "58rjRjBQMHH4yQ25HiNvKoXX5h4nE4pRGWpToDeZ4tFj"
  );

  const programId = new anchor.web3.PublicKey(
    "J2rhNdTzjTQnK4Fn7rshVA5URL2y4atWpagAYAEXsaoh"
  );

  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.publicKey.toBuffer()],
    programId
  );

  const vaultAddress = getAssociatedTokenAddressSync(
    mint_addr,
    pda,
    true,
    TOKEN_PROGRAM_ID
  );

  console.log(`Vault ${vaultAddress.toBase58()}`);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const user = await getKeypairFromFile();

  const vault = JSON.parse(JSON.stringify(idl));

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(user),
    {
      preflightCommitment: "confirmed",
    }
  );

  const contract = new anchor.Program(vault, provider);

  const mint_address = new anchor.web3.PublicKey(
    "58rjRjBQMHH4yQ25HiNvKoXX5h4nE4pRGWpToDeZ4tFj"
  );

  const tokenAuthority = user;

  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.publicKey.toBuffer()],
    contract.programId
  );

  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
  );

  const user_ata = getAssociatedTokenAddressSync(
    mint_address,
    user.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  await mintTo(
    provider.connection,
    user,
    mint_address,
    user_ata,
    tokenAuthority,
    10_000_000_000
  );

  console.log("Minted 100 tokens to user's ATA");

  const vault_ata = getAssociatedTokenAddressSync(
    mint_address,
    pda,
    true,
    TOKEN_PROGRAM_ID
  );

  const amount = new anchor.BN(10_000_000_000);

  const tx = await contract.methods
    .initialize(amount)
    .accounts({
      user: user.publicKey,
      vaultState: pda,
      vault: vault_ata,
      mint: mint_address,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([user])
    .rpc();

  console.log("Vault initiliased with tx sig: ", tx);

  const deposit_amount = new anchor.BN(5_000_000);
  const tx2 = await contract.methods
    .deposit(deposit_amount)
    .accounts({
      user: user.publicKey,
      vaultState: pda,
      userAta: user_ata,
      vault: vault_ata,
      mint: mint_address,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([user])
    .rpc();

  console.log("Deposited to vault", tx2);
}

main();
getVault();

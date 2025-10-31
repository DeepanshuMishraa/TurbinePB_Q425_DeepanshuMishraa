import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
} from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const umi = createUmi(connection.rpcEndpoint);
  umi.use(mplTokenMetadata());

  const keypair = await getKeypairFromFile();

  await airdropIfRequired(
    connection,
    keypair.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL,
  );

  console.log(
    `User initialized with Public Key: ${keypair.publicKey.toBase58()}`,
  );

  const user = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
  umi.use(keypairIdentity(user));

  console.log(`Initialized UMI instance`);

  const mintSigner = generateSigner(umi);

  const createMintTx = createFungible(umi, {
    mint: mintSigner,
    name: "DENTAL",
    symbol: "DNT",
    uri: "https://raw.githubusercontent.com/DeepanshuMishraa/mint-spl-token/refs/heads/main/metadata1.json?token=GHSAT0AAAAAADN3AAYNPMVUPHPG2ONUK6DY2IA3Q2A",
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 9,
  });

  const createTokenTx = createTokenIfMissing(umi, {
    mint: mintSigner.publicKey,
    owner: umi.identity.publicKey,
    ataProgram: getSplAssociatedTokenProgramId(umi),
  });

  const associated_token_pda = findAssociatedTokenPda(umi, {
    mint: mintSigner.publicKey,
    owner: umi.identity.publicKey,
  });

  const minTokensTx = mintTokensTo(umi, {
    mint: mintSigner.publicKey,
    token: associated_token_pda,
    amount: BigInt(1000000000000),
  });

  console.log("Processing Transaction...");

  const tx = await createMintTx
    .add(createTokenTx)
    .add(minTokensTx)
    .sendAndConfirm(umi);

  const signature = base58.deserialize(tx.signature)[0];

  console.log("\n Transaction Complete");
  console.log(
    "View On Solana Explorer: ",
    getExplorerLink("tx", signature, "devnet"),
  );
  console.log(
    "View on Solana Explorer: ",
    getExplorerLink("address", mintSigner.publicKey, "devnet"),
  );
}

main();

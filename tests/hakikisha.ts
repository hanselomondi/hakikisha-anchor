import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hakikisha } from "../target/types/hakikisha";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("hakikisha", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Hakikisha as Program<Hakikisha>;

  // Variables to be used in the tests
  let manufacturerKp = Keypair.generate();
  let retailerKp = Keypair.generate();
  let consumerKp = Keypair.generate();

  beforeEach(async () => {
    const fundWallet = async (publicKey: PublicKey, amount: number) => {
      const tx = await program.provider.connection.requestAirdrop(publicKey, amount);
      await program.provider.connection.confirmTransaction(tx);
    };

    await fundWallet(manufacturerKp.publicKey, 2_000_000_000);
  });
});

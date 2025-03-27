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

  // 1. Admin Flow: Register Manufacturer
  it("can register a manufacturer", async () => {
    const [manufacturerAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturerKp.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .registerManufacturer("ABC Distillers", "KEBS123")
    .accounts({
      admin: program.provider.publicKey,
      manufacturer: manufacturerAccountPda,
      manufacturerWallet: manufacturerKp.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

    const manufacturerAccount = await program.account.manufacturer.fetch(manufacturerAccountPda);
    console.log(manufacturerAccount);
    expect(manufacturerAccount.name).to.equal("ABC Distillers");
    expect(manufacturerAccount.walletAddress.toBase58()).to.equal(manufacturerKp.publicKey.toBase58());
    expect(manufacturerAccount.licenseNumber).to.equal("KEBS123");
    expect(manufacturerAccount.isVerified).to.equal(true);
  });

  // 2. Admin Flow: Register Retailer
  it("can register a retailer", async () => {
    const [retailerAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("retailer"), retailerKp.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .registerRetailer("XYZ Retailers", "KEBS456")
    .accounts({
      admin: program.provider.publicKey,
      retailer: retailerAccountPda,
      retailerWallet: retailerKp.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

    const retailerAccount = await program.account.retailer.fetch(retailerAccountPda);
    console.log(retailerAccount);
    expect(retailerAccount.name).to.equal("XYZ Retailers");
    expect(retailerAccount.walletAddress.toBase58()).to.equal(retailerKp.publicKey.toBase58());
    expect(retailerAccount.licenseNumber).to.equal("KEBS456");
    expect(retailerAccount.isVerified).to.equal(true);
  });

});

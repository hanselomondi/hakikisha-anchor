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

  // 3. Manufacturer Flow: Register product
  it("allows a manufacturer to register a product", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    const [manufacturerAccountPda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturerKp.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .registerProduct(
      productId,
      new anchor.BN(100),  // batch number
      new anchor.BN(1711497600), // production date
      "Premium Vodka",
      "750ml bottle of premium vodka"
    )
    .accounts({
      manufacturer: manufacturerKp.publicKey,  // Manufacturer signs transaction using the wallet they registered with
      product: productPda,
      manufacturerAccount: manufacturerAccountPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([manufacturerKp])
    .rpc();

    const productAccount = await program.account.product.fetch(productPda);
    console.log(productAccount);
    expect(productAccount.productId).to.equal(productId);
    expect(productAccount.batchNumber.toNumber()).to.equal(100);
    expect(productAccount.productionDate.toNumber()).to.equal(1711497600);
    expect(productAccount.name).to.equal("Premium Vodka");
    expect(productAccount.description).to.equal("750ml bottle of premium vodka");
    expect(productAccount.manufacturer.toBase58()).to.equal(manufacturerKp.publicKey.toBase58());
    expect(productAccount.currentOwner.toBase58()).to.equal(manufacturerKp.publicKey.toBase58());
    expect(productAccount.status).to.have.property('unsold');
  });

  // 4. Manufacturer Flow: Transfer product to retailer
  it("allows manufacturer to transfer product to retailer", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    const [retailerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("retailer"), retailerKp.publicKey.toBuffer()],
      program.programId
    );
    console.log(retailerPda.toBase58());

    await program.methods
    .transferProduct(productId, retailerKp.publicKey)
    .accounts({
      currentOwner: manufacturerKp.publicKey,  // Wallet address manufacturer registered with
      productAccount: productPda,
      newOwnerAccount: retailerPda
    })
    .signers([manufacturerKp])
    .rpc();

    const productAccount = await program.account.product.fetch(productPda);
    console.log(productAccount);
    expect(productAccount.currentOwner.toBase58()).to.equal(retailerKp.publicKey.toBase58());
  });

  // 5. Retailer Flow: Mark Product as Sold when Sold to Consumer
  it("allows retailer to mark product as sold", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    const retailerPda = await PublicKey.findProgramAddressSync(
      [Buffer.from("retailer"), retailerKp.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .markAsSold(productId)
    .accounts({
      retailer: retailerKp.publicKey,
      productAccount: productPda,
      retailerAccount: retailerPda
    })
    .signers([retailerKp])
    .rpc();

    const productAccount = await program.account.product.fetch(productPda);
    console.log(productAccount);
    expect(productAccount.status).to.have.property('sold');
  });

  // 6. Consumer Flow: Report Counterfeit Product
  it("allows consumer to report a counterfeit product", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    await program.methods
    .reportCounterfeit(productId)
    .accounts({
      reporter: consumerKp.publicKey,
      product: productPda
    })
    .signers([consumerKp])
    .rpc();

    const productAccount = await program.account.product.fetch(productPda);
    console.log(productAccount);
    expect(productAccount.isReported).to.equal(true);
  });

});

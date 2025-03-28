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
  let unauthorizedKp = Keypair.generate();

  beforeEach(async () => {
    const fundWallet = async (publicKey: PublicKey, amount: number) => {
      const tx = await program.provider.connection.requestAirdrop(publicKey, amount);
      await program.provider.connection.confirmTransaction(tx);
    };

    await fundWallet(manufacturerKp.publicKey, 2_000_000_000);
    await fundWallet(retailerKp.publicKey, 2_000_000_000);
    await fundWallet(consumerKp.publicKey, 2_000_000_000);
    await fundWallet(unauthorizedKp.publicKey, 2_000_000_000);
  });

  // Basic Flows
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

  // 7. Verification Flow: Verify Product (Read-Only)
  it("can retrieve product details to verify authenticity", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    const productAccount = await program.account.product.fetch(productPda);
    console.log(productAccount);
    expect(productAccount.productId).to.equal(productId);
    expect(productAccount.currentOwner.toBase58()).to.equal(retailerKp.publicKey.toBase58());
    expect(productAccount.manufacturer.toBase58()).to.equal(manufacturerKp.publicKey.toBase58());
    expect(productAccount.status).to.have.property('sold');
    expect(productAccount.isReported).to.equal(true);
  });

  // Alternate Flows
  // 1. Edge Case: Non-Admin Registration
  it("fails when non-admin registers manufacturer", async () => {
    const manufacturerWallet = Keypair.generate();

    const [manufacturerAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturerWallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
      .registerManufacturer("ABC Distillers", "KEBS123")
      .accounts({
        admin: unauthorizedKp.publicKey,  // Not ADMIN_PUBKEY
        manufacturer: manufacturerAccountPda,
        manufacturerWallet: manufacturerWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([unauthorizedKp])
      .rpc();
      expect.fail("Should have failed with unauthorised error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("Unauthorised access");
    }
  });

  // 2. Edge Case: Duplicate Manufacturer Registration
  it("fails when manufacturer with duplicate wallet address", async () => {
    const manufacturer1 = Keypair.generate();
    const [manufacturerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturer1.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .registerManufacturer("ABC Distillers", "KEBS123")
    .accounts({
      admin: program.provider.publicKey,
      manufacturer: manufacturerPda,
      manufacturerWallet: manufacturer1.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

    try {
      await program.methods
      .registerManufacturer("XYZ Distillers", "KEBS456")
      .accounts({
        admin: program.provider.publicKey,
        manufacturer: manufacturerPda,
        manufacturerWallet: manufacturer1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([program.provider.wallet.payer])
      .rpc();
      expect.fail("Should have failed with duplicate wallet error");
    } catch (err) {
      console.error(err);
      const anchorError = err.logs.find(log => log.includes("already in use"));
      expect(anchorError).to.not.be.undefined;
    }
  });

  // 3. Edge Case: String Length Limits
  it("fails when name exceeds max length", async () => {
    const [manufacturerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturerKp.publicKey.toBuffer()],
      program.programId
    );

    const longName = "A".repeat(51);  // MAX_NAME_LENGTH = 50
    try {
      await program.methods
      .registerManufacturer(longName, "KEBS123")
      .accounts({
        admin: program.provider.publicKey,
        manufacturer: manufacturerPda,
        manufacturerWallet: manufacturerKp.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([program.provider.wallet.payer])
      .rpc();
      expect.fail("Should have failed with string length error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("String exceeds maximum length");
    }
  });

  // 4. Edge Case: Unregistered Manufacturer Attempts to Register Product
  it("fails when unregistered manufacturer attempts to register product", async () => {
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    const [manufacturerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), unauthorizedKp.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
      .registerProduct(
        productId,
        new anchor.BN(100),  // batch number
        new anchor.BN(1711497600), // production date
        "Premium Vodka",
        "750ml bottle of premium vodka"
      )
      .accounts({
        manufacturer: unauthorizedKp.publicKey,
        product: productPda,
        manufacturerAccount: manufacturerPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([unauthorizedKp])
      .rpc();
      expect.fail("Should have failed with unauthorised manufacturer error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("The program expected this account to be already initialized");
    }
  });

  async function setupManufacturerAndRetailer() {
    const [manufacturerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("manufacturer"), manufacturerKp.publicKey.toBuffer()],
      program.programId
    );

    const [retailerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("retailer"), retailerKp.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
    .registerManufacturer("ABC Distillers", "KEBS123")
    .accounts({
      admin: program.provider.publicKey,
      manufacturer: manufacturerPda,
      manufacturerWallet: manufacturerKp.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

    await program.methods
    .registerRetailer("XYZ Retailers", "KEBS456")
    .accounts({
      admin: program.provider.publicKey,
      retailer: retailerPda,
      retailerWallet: retailerKp.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

    return { manufacturerPda, retailerPda };
  }

  // 5. Edge Case: Product Transfer by Non-Owner
  it("fails when non-owner attempts to transfer product", async () => {
    const { manufacturerPda, retailerPda } = await setupManufacturerAndRetailer();
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
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
      manufacturer: manufacturerKp.publicKey,
      product: productPda,
      manufacturerAccount: manufacturerPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([manufacturerKp])
    .rpc();

    try {
      await program.methods
      .transferProduct(productId, retailerKp.publicKey)
      .accounts({
        currentOwner: unauthorizedKp.publicKey,
        productAccount: productPda,
        newOwnerAccount: retailerPda
      })
      .signers([unauthorizedKp])
      .rpc();
      expect.fail("Should have failed with unauthorised owner error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("Unauthorised access");
    }
  });

  // 6. Edge Case: Transfer Product to Unregistered Retailer
  it("fails when transferring product to unregistered retailer", async () => {
    const { manufacturerPda } = await setupManufacturerAndRetailer();
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );
    const [unregisteredPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("retailer"), unauthorizedKp.publicKey.toBuffer()],
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
      manufacturer: manufacturerKp.publicKey,
      product: productPda,
      manufacturerAccount: manufacturerPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([manufacturerKp])
    .rpc();

    try {
      await program.methods
      .transferProduct(productId, unauthorizedKp.publicKey)
      .accounts({
        currentOwner: manufacturerKp.publicKey,
        productAccount: productPda,
        newOwnerAccount: unregisteredPda
      })
      .signers([manufacturerKp])
      .rpc();
      expect.fail("Should have failed with unregistered retailer error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("The program expected this account to be already initialized");
    }
  });

  // 7. Edge Case: Mark as Sold by Non-Owner
  it("fails when non-owner attempts to mark product as sold", async () => {
    const { manufacturerPda, retailerPda } = await setupManufacturerAndRetailer();
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
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
      manufacturer: manufacturerKp.publicKey,
      product: productPda,
      manufacturerAccount: manufacturerPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([manufacturerKp])
    .rpc();

    try {
      await program.methods
      .markAsSold(productId)
      .accounts({
        retailer: retailerKp.publicKey,  // Hadn't yet had the product transfered to them by the manufacturer
        productAccount: productPda,
        retailerAccount: retailerPda
      })
      .signers([retailerKp])
      .rpc();
      expect.fail("Should have failed with unauthorised owner error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("Unauthorised access");
    }
  });

  // 8. Edge Case: Mark Already Sold Product as Sold Again
  it("fails when retailer attempts to mark already sold product as sold", async () => {
    const { manufacturerPda, retailerPda } = await setupManufacturerAndRetailer();
    const productId = "vodka_batch_001";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
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
      manufacturer: manufacturerKp.publicKey,
      product: productPda,
      manufacturerAccount: manufacturerPda,
      systemProgram: SystemProgram.programId,
    })
    .signers([manufacturerKp])
    .rpc();

    await program.methods
    .transferProduct(productId, retailerKp.publicKey)
    .accounts({
      currentOwner: manufacturerKp.publicKey,
      productAccount: productPda,
      newOwnerAccount: retailerPda
    })
    .signers([manufacturerKp])
    .rpc();

    await program.methods
    .markAsSold(productId)
    .accounts({
      retailer: retailerKp.publicKey,
      productAccount: productPda,
      retailerAccount: retailerPda
    })
    .signers([retailerKp])
    .rpc();

    try {
      await program.methods
      .markAsSold(productId)  // Second attempt to mark the product as sold
      .accounts({
        retailer: retailerKp.publicKey,
        productAccount: productPda,
        retailerAccount: retailerPda
      })
      .signers([retailerKp])
      .rpc();
      expect.fail("Should have failed with already sold error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("Product already marked as sold");
    }
  });

  it.only("fails when reporting consumer attempts to report non-existent product", async () => {
    const productId = "non_existent_product";
    const [productPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    );

    try {
      await program.methods
      .reportCounterfeit(productId)
      .accounts({
        reporter: consumerKp.publicKey,
        product: productPda
      })
      .signers([consumerKp])
      .rpc();
      expect.fail("Should have failed with product not found error");
    } catch (err) {
      console.error(err);
      expect(err.error.errorMessage).to.include("The program expected this account to be already initialized");
    }
  });

});

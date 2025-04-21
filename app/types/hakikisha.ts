/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/hakikisha.json`.
 */
export type Hakikisha = {
    "address": "3bpsmdk6AE4foSTDLGpxNjb5eaYaVUaWLizyC9zouRAv",
    "metadata": {
      "name": "hakikisha",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "markAsSold",
        "discriminator": [
          161,
          162,
          111,
          5,
          143,
          63,
          238,
          39
        ],
        "accounts": [
          {
            "name": "retailer",
            "writable": true,
            "signer": true
          },
          {
            "name": "productAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    100,
                    117,
                    99,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "productId"
                }
              ]
            }
          },
          {
            "name": "retailerAccount",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    116,
                    97,
                    105,
                    108,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "retailer"
                }
              ]
            }
          }
        ],
        "args": [
          {
            "name": "productId",
            "type": "string"
          }
        ]
      },
      {
        "name": "registerManufacturer",
        "discriminator": [
          209,
          17,
          71,
          213,
          190,
          230,
          125,
          136
        ],
        "accounts": [
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "manufacturer",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    110,
                    117,
                    102,
                    97,
                    99,
                    116,
                    117,
                    114,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "manufacturerWallet"
                }
              ]
            }
          },
          {
            "name": "manufacturerWallet"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "licenseNumber",
            "type": "string"
          }
        ]
      },
      {
        "name": "registerProduct",
        "discriminator": [
          224,
          97,
          195,
          220,
          124,
          218,
          78,
          43
        ],
        "accounts": [
          {
            "name": "manufacturer",
            "writable": true,
            "signer": true
          },
          {
            "name": "product",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    100,
                    117,
                    99,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "productId"
                }
              ]
            }
          },
          {
            "name": "manufacturerAccount",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    110,
                    117,
                    102,
                    97,
                    99,
                    116,
                    117,
                    114,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "manufacturer"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "productId",
            "type": "string"
          },
          {
            "name": "batchNumber",
            "type": "u64"
          },
          {
            "name": "productionDate",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      },
      {
        "name": "registerRetailer",
        "discriminator": [
          253,
          14,
          134,
          25,
          205,
          89,
          187,
          176
        ],
        "accounts": [
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "retailer",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    116,
                    97,
                    105,
                    108,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "retailerWallet"
                }
              ]
            }
          },
          {
            "name": "retailerWallet"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "licenseNumber",
            "type": "string"
          }
        ]
      },
      {
        "name": "reportCounterfeit",
        "discriminator": [
          227,
          169,
          21,
          169,
          94,
          155,
          115,
          54
        ],
        "accounts": [
          {
            "name": "reporter",
            "writable": true,
            "signer": true
          },
          {
            "name": "product",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    100,
                    117,
                    99,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "productId"
                }
              ]
            }
          }
        ],
        "args": [
          {
            "name": "productId",
            "type": "string"
          }
        ]
      },
      {
        "name": "transferProduct",
        "discriminator": [
          119,
          27,
          86,
          205,
          209,
          123,
          162,
          244
        ],
        "accounts": [
          {
            "name": "currentOwner",
            "writable": true,
            "signer": true
          },
          {
            "name": "productAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    114,
                    111,
                    100,
                    117,
                    99,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "productId"
                }
              ]
            }
          },
          {
            "name": "newOwnerAccount",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    116,
                    97,
                    105,
                    108,
                    101,
                    114
                  ]
                },
                {
                  "kind": "arg",
                  "path": "newOwnerWallet"
                }
              ]
            }
          }
        ],
        "args": [
          {
            "name": "productId",
            "type": "string"
          },
          {
            "name": "newOwnerAddress",
            "type": "pubkey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "manufacturer",
        "discriminator": [
          105,
          43,
          161,
          64,
          242,
          185,
          127,
          245
        ]
      },
      {
        "name": "product",
        "discriminator": [
          102,
          76,
          55,
          251,
          38,
          73,
          224,
          229
        ]
      },
      {
        "name": "retailer",
        "discriminator": [
          194,
          215,
          198,
          69,
          112,
          0,
          156,
          243
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "unauthorised",
        "msg": "Unauthorised access"
      },
      {
        "code": 6001,
        "name": "stringTooLong",
        "msg": "String exceeds maximum length"
      },
      {
        "code": 6002,
        "name": "productAlreadySold",
        "msg": "Product already marked as sold"
      }
    ],
    "types": [
      {
        "name": "manufacturer",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "walletAddress",
              "type": "pubkey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "licenseNumber",
              "type": "string"
            },
            {
              "name": "isVerified",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "product",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "productId",
              "type": "string"
            },
            {
              "name": "manufacturer",
              "type": "pubkey"
            },
            {
              "name": "currentOwner",
              "type": "pubkey"
            },
            {
              "name": "status",
              "type": {
                "defined": {
                  "name": "productStatus"
                }
              }
            },
            {
              "name": "productionDate",
              "type": "u64"
            },
            {
              "name": "batchNumber",
              "type": "u64"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "isReported",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "productStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "unsold"
            },
            {
              "name": "sold"
            }
          ]
        }
      },
      {
        "name": "retailer",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "walletAddress",
              "type": "pubkey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "licenseNumber",
              "type": "string"
            },
            {
              "name": "isVerified",
              "type": "bool"
            }
          ]
        }
      }
    ]
  };
  
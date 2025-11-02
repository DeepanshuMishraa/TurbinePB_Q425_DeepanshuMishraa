## swappy.sol : A Decentralized Token Swap Platform

It is a token swap platform on solana which allows user to mint custom spl tokens , securely store them in their personal vaults and execute seamless peer to peer token swaps through escrow.

### Personas

```
Alice runs a company , and she creates a token on solana and names it ALX (Alice's Token) and in order to store that token securely she needs some kind of locking mechanism , a vault. She has seen a DNT(Dental  Token ) going viral and wants to swap some of her ALX Tokens for DNT Tokens.

Now bob bought bunch of DNT Tokens and is ready to sell them and he has seen alice's company and knows she needs the DNT Tokens . bob finds this a great opportunity to help alice and in exchange he can ask for a role in her company. But He also needs to be sure that once he gives the DNT Tokens to alice, he will receive ALX Tokens in return.
```


### Process

```
1. Alice Creates a vault for her ALX Tokens in order to store her ALX Tokens securely.

2. Bob Creates a vault for his DNT Tokens in order to store his DNT Tokens securely.

3. When Alice comes to know that bob is ready to swap DNT Tokens for ALX Tokens she initiates the process by creating an escrow account and transferring the ALX Tokens to the escrow account.

4. Alice Transfers 100 ALX Tokens to the escrow account.

5. Bob Transfers 100 DNT Tokens to the escrow account.

6. Since both have sufficient balance in their vaults, they can now execute the swap by transferring the tokens from the escrow account to their respective vaults.

7. Swap is successful and both Alice and Bob are happy with the outcome. They both can now use their tokens for their respective purposes.
```


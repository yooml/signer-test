## Instructions

1. Ensure you have a polkadot-dev node running. I have one running polkadot-sdk v1.13 using `./target/release/polkadot --dev --tmp`.

2. Within the same parent folder as `signer-test` pull down the [`polkadot-js/api`](github.com/polkadot-js/api) repo. (Note: This next step requires you to have this `signer-test` repo already pulled down).

Inside of `polkadot-js/api`:
```bash
$ git checkout tg-payload
$ yarn
$ yarn polkadot-dev-copy-to signer-test
```

3. Inside of root of this repo run:

```bash
$ yarn
$ yarn start
```
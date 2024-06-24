import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { init, RuntimeMetadata } from 'merkleized-metadata';

import { objectSpread } from '@polkadot/util';
import type { SignerPayloadJSON } from '@polkadot/types/types/extrinsic.js';
import type { u16 } from '@polkadot/types';

const WS_URL = 'ws://127.0.0.1:9944';

const signer = {
    signPayload: async (payload: SignerPayloadJSON) => {
        // Initialize Wasm methods
        const mm = await init();

        const keyring = new Keyring();
        const alice = keyring.addFromUri('//Alice', { name: 'Alice' }, 'sr25519');
    
        const api = await ApiPromise.create({
            provider: new WsProvider(WS_URL)
        });

        await api.isReady;
        
        const metadata = await api.call.metadata.metadataAtVersion(15);
        const { specName, specVersion } = await api.rpc.state.getRuntimeVersion();
        const runtimeMetadata = RuntimeMetadata.fromHex(metadata.toHex());
        const digest = mm.generateMetadataDigest(runtimeMetadata, {
            base58Prefix: (api.consts.system.ss58Prefix as u16).toNumber(),
            decimals: 12,
            specName: specName.toString(),
            specVersion: specVersion.toNumber(),
            tokenSymbol: 'ROC'
        });
        const metadataHash = api.registry.createType('Hash', '0x' + digest.hash());

        const newPayload = objectSpread({}, payload, { mode: 1, metadataHash: metadataHash.toHex() });
        const extPay = api.registry.createType('ExtrinsicPayload', newPayload);
        const { signature } = extPay.sign(alice);
        const extrinsic = api.registry.createType(
            'Extrinsic',
            { method: extPay.method },
            { version: 4 }
        );
        extrinsic.addSignature(alice.address, signature, extPay.toHex());

        return {
            id: 0,
            signature: signature,
            // Extrinsic with Mode and MetadataHash added
            signedTransaction: extrinsic.toHex(),
        }
    }
}

const main = async () => {
    await cryptoWaitReady();

    const keyring = new Keyring();
	const alice = keyring.addFromUri('//Alice', { name: 'Alice' }, 'sr25519');

    const api = await ApiPromise.create({
        provider: new WsProvider(WS_URL),
        signer
    });

    await api.isReady;

    await api.tx.system.remark('0x00').signAndSend(alice.address);
}

main().catch(e => console.error(e)).finally(() => process.exit())
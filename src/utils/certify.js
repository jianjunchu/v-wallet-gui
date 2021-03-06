"use strict";
// make sure to add official token svg in src/assets/imgs/icons/token with 'tokenName.svg' format
var certifiedTokensList = {
    Mainnet: {
        'TWZZfKFqcaNVe5TrphLRNEm5DQFnBRJMjDDByqv84': { name: 'IPX', support_split: false, unity: 1000000000, iconUrl: require('@/assets/imgs/icons/token/IPX.svg') },
        'TWaN4DqnRMdUS5d1ohCn9Vh9VdGWDLm9Um1jHbQiF': { name: 'BlockDesk', support_split: false, unity: 100000000, iconUrl: require('@/assets/imgs/icons/token/BlockDesk.png') },
        'TWZ3nPYyCJAJJmfJBzxcqe8ZfpYJMQK4dpiQ1m6v4': { name: 'GoldZip', support_split: false, unity: 1000, iconUrl: require('@/assets/imgs/icons/token/GoldZip.jpg') }
    },
    Testnet: {
        'TWscu6rbRF2PEsnY1bRky4aKxxKTzn69WMFLFdLxK': { name: 'DM', support_split: true, unity: 1000, iconUrl: require('@/assets/imgs/icons/token/DM.svg') },
        'TWuyTczrVc4KeDUBpksxY8bpcogKfKqoVGE7cwcs3': { name: 'VTEST', support_split: true, unity: 100000, iconUrl: require('@/assets/imgs/icons/token/VTEST.svg') },
        'TWtSxBEx7rmsQ34MyWzwBCYYwRJh4K9xsL9zPkMK8': { name: 'DLL', support_split: false, unity: 100000000, iconUrl: require('@/assets/imgs/icons/token/DLL.svg') }
    },
}
import Blockchain from '@/js-v-sdk/src/blockchain'
import { NETWORK_BYTE, MAINNET_IP, TESTNET_IP } from '@/network'
var certifiedTokens;
var chain = String.fromCharCode(NETWORK_BYTE) === 'M' ? new Blockchain(MAINNET_IP, NETWORK_BYTE) : new Blockchain(TESTNET_IP, NETWORK_BYTE);
if (String.fromCharCode(NETWORK_BYTE) === 'T') {
    certifiedTokens = certifiedTokensList['Testnet']
} else {
    certifiedTokens = certifiedTokensList['Mainnet']
}
for (let token in certifiedTokens) {
    if (certifiedTokens[token].support_split) {
        chain.getTokenInfo(token).then(response => {
            certifiedTokens[token].unity = response.unity
        })
    }
}
export default {
    isCertified(tokenId) {
        return tokenId in certifiedTokens
    },
    officialName(tokenId) {
        if (certifiedTokens[tokenId]) {
            return certifiedTokens[tokenId].name
        } else {
            return tokenId
        }
    },
    getUnity(tokenId) {
        return certifiedTokens[tokenId].unity
    },
    updateUnity(tokenId, unity) {
        certifiedTokens[tokenId].unity = unity
    },
    getTokenId(name) {
        let upperName = name.toUpperCase().trim()
        let len = upperName.length
        let endName = len > 6 ? upperName.substring(len - 6, len) : ''
        if (endName === ' TOKEN') {
            upperName = upperName.substring(0, len - 6).trim()
        }
        for (let tokenId in certifiedTokens) {
            if (certifiedTokens[tokenId].name === upperName) return tokenId
        }
        return null
    },
    getCertifiedTokens() {
        return certifiedTokens
    }
}

<template>
  <div class="row justify-content-between height-full">
    <div class="col-auto align-self-center text-left tran-head">
      <img src="@/assets/imgs/icons/wallet/Symbol_Yellow.svg"
           class="money-icon"
           width="30"
           height="30">
      <span class="title">
        {{ formatter(available) }}
      </span>
      <p class="text-muted text-des mb-0">
        Available Balance
      </p>
    </div>
    <div class="col-auto align-self-center text-left">
      <img src="@/assets/imgs/icons/wallet/Symbol_Yellow.svg"
           width="16"
           height="16">
      <span class="sub-title">
        {{ formatter(total) }}
      </span>
      <p class="text-muted text-des mb-0">
        Total Balance
      </p>
    </div>
    <div class="col-auto align-self-center text-left">
      <img src="@/assets/imgs/icons/wallet/Symbol_Yellow.svg"
           width="16"
           height="16">
      <span class="sub-title">
        {{ formatter(leasedIn) }}
      </span>
      <p class="text-muted text-des mb-0">
        Leased In
      </p>
    </div>
    <div class="col-auto align-self-center text-left">
      <img src="@/assets/imgs/icons/wallet/Symbol_Yellow.svg"
           width="16"
           height="16">
      <span class="sub-title">
        {{ formatter(leasedOut) }}
      </span>
      <p class="text-muted text-des mb-0">
        Leased Out
      </p>
    </div>
    <div class="col align-self-center text-right">
      <b-button class="btn-list"
                @click="redirectToVsysrate()">
        <b>List of nodes</b>
      </b-button>
    </div>
  </div>
</template>

<script>
import Lease from '../modals/Lease'
import browser from '@/utils/browser'
import { mapState } from 'vuex'

export default {
    name: 'LeasePane',
    components: {
        Lease
    },
    props: {
        addresses: {
            type: Object,
            default: function() {},
            require: true
        },
        coldAddresses: {
            type: Object,
            default: function() {},
            require: true
        },
        balance: {
            type: Object,
            default: function() {},
            require: true
        },
        address: {
            type: String,
            default: '',
            require: true
        },
        walletType: {
            type: String,
            default: '',
            require: true
        }
    },
    computed: mapState({
        available: 'available',
        total: 'total',
        leasedIn: 'leasedIn',
        leasedOut: 'leasedOut'
    }),
    methods: {
        redirectToVsysrate() {
            window.open('http://vsysrate.com')
        },
        formatter(num) {
            return browser.bigNumberFormatter(num)
        }
    }
}
</script>

<style scoped lang="less">
@import '../../../assets/style/common';
@import '../../../assets/style/variables';
.height-full {
    height: 100%;
}
.title {
    font-size: 200%;
    line-height: 120%;
}
.money-icon {
    margin-top: -14px;
}
.tran-head {
    padding-left: 38px;
    border-right: 1px solid #EDEDED;
}
.btn-leasing {
    margin-top: 6px;
    margin-bottom: 6px;
    background: #FF8737;
    border-radius: 4px;
    border: 1px solid #FF8737;
    font-size: 17px;
    color: #FFFFFF;
    letter-spacing: 0;
    width: 144px;
    height: 42px;
    margin-left: 8px;
}
.btn-leasing:active, .btn-leasing:hover {
    background-color: #EB7D34 !important;
    border: 1px solid #EB7D34 !important;
}
.btn-list{
    margin-top: 6px;
    margin-bottom: 6px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #E8E9ED;
    font-size: 17px;
    color: #FF8737;
    letter-spacing: 0;
    width: 144px;
    height: 42px;
    margin-left: 8px;
}
.btn-list:active, .btn-leasing:hover {
    background-color: #EB7D34 !important;
    border: 1px solid #EB7D34 !important;
}
.btn-help {
    margin-bottom: 6px;
    background: #FAFAFA;
    border: 1px solid #E8E9ED;
    border-radius: 4px;
    height: 44px;
    margin-left: 8px;
}
.btn-help:active, .btn-help:hover {
    background-color: #E8E9ED !important;
    border: 1px solid #E8E9ED !important;
}
.description-split {
    margin: 10px 0;
    height: 0;
    border-bottom: 1px dashed #e2e2e2;
}
.quick-icon {
    float: left;
    margin: auto 10px;
}
.quick-note {
    color: #9ba6b2;
    font-size: 13px;
    line-height: 18px;
}
</style>

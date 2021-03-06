<template>
  <div class="records">
    <div class="title-records">
      <span>Leasing Records</span>
      <div>
        <span v-if="walletType === 'coldWallet' && coldRecordNum > 1"
              class="cold-lease-tip">(Cold Wallet does not support batch cancel lease)</span>
      </div>
      <div v-if="leaseRecords.length > 0 && startCancelLease"
           class="show-select"
           @click="showSelect">
        <span class="show-position"> Select / Unselect All </span>
        <input class="show-select2"
               type="checkbox"
               v-model="startSelect"
               @click="showSelect">
      </div>
      <b-dropdown class="pd-select"
                  router-tag="div"
                  no-caret
                  :disable="changeShowDisable || !isFullNode"
                  variant="light">
        <template slot="button-content">
          <div style="display: inline-block; margin-right: 10px">
            <img v-if="!changeShowDisable"
                 src="@/assets/imgs/icons/wallet/ic_filter.svg">
            <img v-if="changeShowDisable"
                 width="16"
                 height="16"
                 src="@/assets/imgs/icons/wallet/ic_wait.svg">
            <span class="m-1">Latest {{ showingNum }} Records </span>
          </div>
          <img src="@/assets/imgs/icons/signup/ic_arrow_down.svg">
        </template>
        <b-dropdown-item class="selection"
                         :disabled="!isFullNode"
                         @click="changeShowNum(num)"
                         v-for="num in showNums"
                         :key="num">
          Show {{ num }} records
        </b-dropdown-item>
      </b-dropdown>
      <b-button class="btn-lease"
                v-b-modal.leaseModal
                v-if="!startCancelLease">
        <b>Start Lease</b>
      </b-button>
      <b-button class="btn-lease"
                v-if="startCancelLease"
                :disabled="walletType === 'coldWallet' && coldRecordNum > 1"
                @click="confirmCancel()">
        <b>Confirm Cancel</b>
      </b-button>
      <b-button class="btn-cancel"
                v-if="!startCancelLease"
                @click="cancelLease()">
        <b>Cancel Lease</b>
      </b-button>
      <b-button class="btn-cancel"
                v-if="startCancelLease"
                @click="cancelBack()">
        <b>Back</b>
      </b-button>
    </div>
    <div v-if="leaseRecords.length > 0"
         class="inherit-height">
      <div class="scroll"
           :style="{height: myHeight}">
        <div v-for="record in leaseRecords"
             :key="record.id">
          <TransactionRecord :tx-record="record"
                             :cold-public-key="coldPublicKey"
                             :trans-type="transType"
                             :address-index="addressIndex"
                             :address="address"
                             :wallet-type="walletType"
                             :start-cancel-lease="startCancelLease"
                             :start-select="startSelect"
                             :cancel-lease-records="cancelLeaseRecords"
                             @updateCancelLeaseRecords="updateCancelLeaseRecords"
                             :lease-status="record.leaseStatus"></TransactionRecord>
        </div>
      </div>
    </div>
    <img height="50"
         width="50"
         v-if="changeShowDisable && leaseRecords.length === 0 && isFullNode"
         src="@/assets/imgs/icons/wallet/ic_wait.svg">
    <div v-if="!changeShowDisable && leaseRecords.length === 0"
         class="empty">
      {{ isFullNode ? 'There is no transaction record.' : 'Current node does not support querying leasing transactions.' }}
    </div>
    <Lease show="false"
           :balances="balance"
           :cold-addresses="coldAddresses"
           :addresses="addresses"
           :selected-address="address"
           :node-list="nodeList"
           :wallet-type="walletType"></Lease>
    <BatchCancelLease :cancel-lease-records="cancelLeaseRecords"
                      :wallet-type="walletType"
                      :cold-lease-record="coldLeaseRecord"
                      @confirmBack="confirmBack"
                      :insufficient-flag="insufficientFlag"></BatchCancelLease>
  </div>
</template>

<script>

import { LEASE_TX, TX_FEE } from '@/js-v-sdk/src/constants'
import BigNumber from 'bignumber.js'
import Vue from 'vue'
import TransactionRecord from './TransactionRecord'
import browser from '@/utils/browser'
import { mapState } from 'vuex'
import Lease from '../modals/Lease'
import BatchCancelLease from '../modals/BatchCancelLease'
export default {
    name: 'LeaseRecords',
    components: {
        TransactionRecord,
        Lease,
        BatchCancelLease
    },
    created() {
        this.myHeight = (this.isMobile() ? window.innerHeight + 100 : window.innerHeight - 300) + 'px'
        if (this.address && Vue.ls.get('pwd') && this.activeTab === 'lease') {
            this.getLeaseRecords()
        }
        this.cancelLeaseRecords = {}
        this.coldLeaseRecord = {}
    },
    data() {
        return {
            leaseRecords: [],
            showNums: [10, 50, 100, 200, 500, 1000],
            showingNum: 10,
            changeShowDisable: false,
            downloadFileType: 'csv',
            resFields: {
                transaction_id: 'id',
                sender_address: 'sender',
                sender_public_key: 'senderPublicKey',
                transaction_fee: 'fee',
                'timestamp(in nano second)': 'timestamp',
                signature: 'signature',
                recipient_address: 'recipient',
                amount: 'amount',
                attachment: 'attachment'
            },
            transType: 'lease',
            myHeight: '0',
            startCancelLease: false,
            startSelect: false,
            cancelLeaseRecords: {},
            insufficientFlag: false,
            coldRecordNum: 0,
            coldLeaseRecord: {}
        }
    },
    props: {
        address: {
            type: String,
            default: '',
            require: true
        },
        coldPublicKey: {
            type: String,
            default: '',
            require: true
        },
        addressIndex: {
            type: Number,
            default: 0
        },
        walletType: {
            type: String,
            default: '',
            require: true
        },
        activeTab: {
            type: String,
            default: 'trans'
        },
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
        updateLeaseRecordsFlag: {
            type: Boolean,
            default: false
        },
        nodeList: {
            type: Array,
            default: function() { return [] },
            require: true
        }
    },
    watch: {
        address(newAddr, oldAddr) {
            if (newAddr === '' || this.activeTab !== 'lease') {
                return
            }
            this.leaseRecords = []
            this.changeShowDisable = false
            this.showingNum = 10
            if (this.address && Vue.ls.get('pwd')) {
                this.getLeaseRecords()
            }
        },
        activeTab(newTab, oldTab) {
            if (newTab === 'lease') {
                this.leaseRecords = []
                this.changeShowDisable = false
                this.showingNum = 10
                if (this.address && Vue.ls.get('pwd')) {
                    this.getLeaseRecords()
                }
            }
        },
        leaseRecords() {
            if (this.updateLeaseRecordsFlag === true) {
                this.cancelLeaseRecords = {}
                this.coldRecordNum = Object.keys(this.cancelLeaseRecords).length
            }
        }
    },
    computed: {
        ...mapState({
            chain: 'chain',
            total: 'total',
            isFullNode: 'isFullNode'
        })
    },
    methods: {
        isMobile() {
            return browser.isMobile()
        },
        getLeaseRecords() {
            if (this.address) {
                const addr = this.address
                this.changeShowDisable = true
                const recordLimit = this.showingNum
                this.chain.getTxByType(this.address, recordLimit, LEASE_TX).then(response => {
                    if (addr === this.address && recordLimit === this.showingNum) {
                        this.leaseRecords = response.transactions
                        this.changeShowDisable = false
                    }
                }, respErr => {
                    if (addr === this.address && recordLimit === this.showingNum) {
                        this.changeShowDisable = false
                    }
                })
            }
        },
        showSelect() {
            this.startSelect = !this.startSelect
        },
        changeShowNum(newNum) {
            if (!this.changeShowDisable) {
                this.showingNum = newNum
                if (this.address && Vue.ls.get('pwd')) {
                    this.getLeaseRecords()
                }
            }
        },
        cancelLease() {
            this.startCancelLease = true
        },
        cancelBack() {
            this.startCancelLease = false
        },
        confirmBack() {
            this.startCancelLease = false
        },
        confirmCancel() {
            this.$root.$emit('bv::show::modal', 'batchCancelLeaseModal')
            if (this.walletType === 'coldWallet') {
                let coldRecord
                for (let eachLeaseCancelRecord in this.cancelLeaseRecords) {
                    coldRecord = JSON.parse(this.cancelLeaseRecords[eachLeaseCancelRecord])
                    break
                }
                this.coldLeaseRecord = coldRecord
            } else {
                this.coldLeaseRecord = {}
            }
        },
        updateCancelLeaseRecords(data) {
            this.cancelLeaseRecords = data
            this.coldRecordNum = Object.keys(this.cancelLeaseRecords).length
            this.insufficientFlag = this.total.minus(BigNumber(TX_FEE).times(Object.keys(this.cancelLeaseRecords).length)).isLessThan(BigNumber(0))
        }
    }
}
</script>

<style scoped lang="less">
.empty {
    padding: 24px 0;
    background-color: #1111;
}
.records {
    background: #FFFFFF;
    border: 1px solid #E8E9ED;
    border-radius: 4px;
    margin: 0px 0px;
}
.scroll {
    overflow-y: scroll;
    overflow-x: hidden;
}
.monthTtl {
    height: 44px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid #EDEDF0;
    background: #FFF;
    font-size: 13px;
    color: #9091A3;
    letter-spacing: 0;
    padding: 14px 21px;
}
.inherit-height {
    position: relative;
    height: inherit;
    padding-top: 52px;
    top: -52px;
}
.title-records {
    background: #FAFAFA;
    padding: 8px 20px;
    border-bottom: 1px solid #EDEDF0;
    height: 52px;
    text-align: left;
    font-size: 17px;
    color: #010102;
    letter-spacing: 0;
    display: flex;
    align-items: Center;
}
.btn-export {
    width: 116px;
    height: 36px;
    background-color: #FFF;
    border-color: #E8E9ED;
    font-size: 15px;
    color: #696B8A;
    letter-spacing: 0;
    align-items: Center;
    display: flex;
    justify-content:center;
    img {
        margin-right: 8px;
    }
}
.pd-select {
    position: absolute;
    right: 350px;
    display: flex;
    height: 36px;
    z-index: 100;
    background-color: #FFF;
}
.pd-select:hover, .pd-select:active {
    background-color: #FAFAFA !important;
}
.selection {
    font-size: 15px;
    color: #696B8A;
    letter-spacing: 0;
}
.show-position {
    position: absolute;
    left: -45px;
}
.show-select {
    position: absolute;
    right:560px;
    width: 116px;
    height: 36px;
    border-color: #E8E9ED;
    font-size: 15px;
    color: #696B8A;
    letter-spacing: 0;
    align-items: Center;
    display: flex;
    justify-content:center;
}
.show-select2 {
    position: absolute;
    right:7px;
    width: 15px;
    height: 30px;
    display: flex;
    z-index: 100;
    cursor:pointer;
    background-color: #FFF;
}
.btn-lease {
    z-index: 100;
    position: absolute;
    right:185px;
    margin-bottom: 6px;
    background: #FF8737;
    border-radius: 4px;
    border: 1px solid #FF8737;
    font-size: 15px;
    color: #FFFFFF;
    letter-spacing: 0;
    width: 130px;
    height: 36px;
    margin-left: 8px;
}
.btn-lease:active, .btn-lease:hover {
    background-color: #EB7D34 !important;
    border: 1px solid #EB7D34 !important;
}
.btn-cancel{
    z-index: 100;
    position: absolute;
    right:35px;
    margin-bottom: 6px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #E8E9ED;
    font-size: 15px;
    color: #FF8737;
    letter-spacing: 0;
    width: 130px;
    height: 36px;
    margin-left: 8px;
}
.btn-cancel:active {
    background-color: #EB7D34 !important;
    border: 1px solid #EB7D34 !important;
}
.cold-lease-tip {
    color: red;
    font-size: 15px;
    margin-left: 10px;
}
</style>

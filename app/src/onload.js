import NodeDetailManager from '@toruslabs/fetch-node-details'
import log from 'loglevel'
import Web3 from 'web3'
import LocalMessageDuplexStream from 'post-message-stream'

import TorusController from './controllers/TorusController'
import store from './store'
import { MAINNET, MAINNET_DISPLAY_NAME, MAINNET_CODE } from './utils/enums'
import { storageAvailable, isMain, getIFrameOrigin } from './utils/utils'
import setupMultiplex from './utils/setupMultiplex'

function onloadTorus(torus) {
  function triggerUi(type) {
    log.info('TRIGGERUI:' + type)
    store.dispatch('showPopup')
  }

  let sessionData

  if (storageAvailable('sessionStorage')) {
    sessionData = sessionStorage.getItem('torus-app')
  }

  const sessionCachedNetwork = (sessionData && JSON.parse(sessionData).networkType) || {
    host: MAINNET,
    chainId: MAINNET_CODE,
    networkName: MAINNET_DISPLAY_NAME
  }

  const torusController = new TorusController({
    sessionCachedNetwork,
    showUnconfirmedMessage: triggerUi.bind(window, 'showUnconfirmedMessage'),
    unlockAccountMessage: triggerUi.bind(window, 'unlockAccountMessage'),
    showUnapprovedTx: triggerUi.bind(window, 'showUnapprovedTx'),
    openPopup: triggerUi.bind(window, 'bindopenPopup'),
    storeProps: () => {
      const { state } = store || {}
      let { selectedAddress, wallet } = state || {}
      return { selectedAddress, wallet }
    },
    rehydrate: function() {
      store.dispatch('rehydrate')
    }
  })

  torus.torusController = torusController

  torusController.provider.setMaxListeners(100)
  torus.web3 = new Web3(torusController.provider)

  // update node details
  torus.nodeDetailManager = new NodeDetailManager({ network: process.env.VUE_APP_PROXY_NETWORK, proxyAddress: process.env.VUE_APP_PROXY_ADDRESS })
  torus.nodeDetailManager.getNodeDetails().then(nodeDetails => log.info(nodeDetails))

  // You are not inside an iframe
  if (isMain) {
    // we use this to start accounttracker balances
    torusController.setupControllerConnection()
    return torus
  }

  var metamaskStream = new LocalMessageDuplexStream({
    name: 'iframe_metamask',
    target: 'embed_metamask',
    targetWindow: window.parent
  })

  var communicationStream = new LocalMessageDuplexStream({
    name: 'iframe_comm',
    target: 'embed_comm',
    targetWindow: window.parent
  })

  torus.metamaskMux = setupMultiplex(metamaskStream)
  torus.communicationMux = setupMultiplex(communicationStream)
  torus.communicationMux.setMaxListeners(50)

  const providerOutStream = torus.metamaskMux.getStream('provider')

  torusController.setupUntrustedCommunication(providerOutStream, getIFrameOrigin())

  return torus
}

export default onloadTorus

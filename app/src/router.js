import Vue from 'vue'
import Router from 'vue-router'

import WalletHistory from './containers/WalletHistory'
import { WalletHome, WalletHomeCollectible, WalletHomeMain } from './containers/WalletHome'
import WalletSettings from './containers/WalletSettings'
import { WalletTopupHome, WalletTopupMoonpay, WalletTopupRampNetwork, WalletTopupSimplex, WalletTopupWyre } from './containers/WalletTopup'
import WalletTransfer from './containers/WalletTransfer'
import store from './store'
import Confirm from './views/Confirm'
import Login from './views/Login'
import Popup from './views/Popup'
import ProviderChange from './views/ProviderChange'
import RedirectCatch from './views/RedirectCatch'
import { EmailLogin, EmailRegister, EmailVerify, PhoneLogin, PhoneRegister, PhoneVerify } from './views/TorusLogin'
import UserInfoRequest from './views/UserInfoRequest'
import Wallet from './views/Wallet'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/logout',
      name: 'logout',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/torus-email-register',
      name: 'torusEmailRegister',
      component: EmailRegister,
      meta: { requiresAuth: false },
    },
    {
      path: '/torus-phone-register',
      name: 'torusPhoneRegister',
      component: PhoneRegister,
      meta: { requiresAuth: false },
    },
    {
      path: '/torus-email-verify',
      name: 'torusEmailVerify',
      component: EmailVerify,
      meta: { requiresAuth: false },
      beforeEnter: (to, from, next) => {
        if (to.query.email && to.query.hash) {
          return next()
        }
        return next(from.path)
      },
    },
    {
      path: '/torus-phone-verify',
      name: 'torusPhoneVerify',
      component: PhoneVerify,
      meta: { requiresAuth: false },
      beforeEnter: (to, from, next) => {
        if (to.query.phone && to.query.hash) {
          return next()
        }
        return next(from.path)
      },
    },
    {
      path: '/torus-email-login',
      name: 'torusEmailLogin',
      component: EmailLogin,
      meta: { requiresAuth: false },
      beforeEnter: (to, from, next) => {
        if ((to.query.state && to.query.redirect_uri) || (from.query.state && from.query.redirect_uri)) {
          return next()
        }
        return next(from.path)
      },
    },
    {
      path: '/torus-phone-login',
      name: 'torusPhoneLogin',
      component: PhoneLogin,
      meta: { requiresAuth: false },
      beforeEnter: (to, from, next) => {
        if ((to.query.state && to.query.redirect_uri) || (from.query.state && from.query.redirect_uri)) {
          return next()
        }
        return next(from.path)
      },
    },
    {
      path: '/popup',
      name: 'popup',
      component: Popup,
      meta: { requiresAuth: false },
    },
    {
      path: '/redirect',
      name: 'redirect',
      component: RedirectCatch,
      meta: { requiresAuth: false },
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: Confirm,
      meta: { requiresAuth: false },
    },
    {
      path: '/providerchange',
      name: 'providerchange',
      component: ProviderChange,
      meta: { requiresAuth: false },
    },
    {
      path: '/userinforequest',
      name: 'userInfoRequest',
      component: UserInfoRequest,
      meta: { requiresAuth: false },
    },
    {
      path: '/wallet',
      component: Wallet,
      children: [
        {
          path: '/',
          name: 'walletDefault',
          component: WalletHome,
          redirect: { name: 'walletHomeMain' },
        },
        {
          path: 'home',
          name: 'walletHome',
          component: WalletHome,
          redirect: { name: 'walletHomeMain' },
          children: [
            {
              path: '',
              name: 'walletHomeMain',
              component: WalletHomeMain,
            },
            {
              path: 'collectibles/:address',
              name: 'walletHomeCollectible',
              component: WalletHomeCollectible,
            },
          ],
        },
        {
          path: 'history',
          name: 'walletHistory',
          component: WalletHistory,
        },
        {
          path: 'settings',
          name: 'walletSettings',
          component: WalletSettings,
        },
        {
          path: 'transfer',
          name: 'walletTransfer',
          component: WalletTransfer,
        },
        {
          path: 'topup',
          name: 'walletTopup',
          component: WalletTopupHome,
          children: [
            {
              path: 'rampnetwork',
              name: 'walletTopupRampNetwork',
              component: WalletTopupRampNetwork,
            },
            {
              path: 'simplex',
              name: 'walletTopupSimplex',
              component: WalletTopupSimplex,
            },
            {
              path: 'moonpay',
              name: 'walletTopupMoonpay',
              component: WalletTopupMoonpay,
            },
            {
              path: 'wyre',
              name: 'walletTopupWyre',
              component: WalletTopupWyre,
            },
          ],
        },
      ],
    },
    { path: '*', component: Login },
  ],
})

function hasQueryParameters(route) {
  return Object.prototype.hasOwnProperty.call(route.query, 'instanceId')
}

router.beforeResolve((to, from, next) => {
  if (
    Object.prototype.hasOwnProperty.call(to, 'meta') &&
    Object.prototype.hasOwnProperty.call(to.meta, 'requiresAuth') &&
    to.meta.requiresAuth === false
  ) {
    if (to.name === 'logout') {
      return next()
    }
    if (!hasQueryParameters(to) && hasQueryParameters(from)) {
      return next({ name: to.name, query: from.query, hash: to.hash, params: to.params })
    }
    return next()
  }
  if (store.state.selectedAddress === '') {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  if (!hasQueryParameters(to) && hasQueryParameters(from)) {
    if (to.name !== 'walletTransfer') {
      Object.keys(from.query).forEach((key) => key === 'instanceId' || delete from.query[key])
    }
    return next({ name: to.name, query: from.query, hash: to.hash, params: to.params })
    // next()
  }
  return next()
})

export default router

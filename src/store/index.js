import Vue from 'vue'
import Vuex from 'vuex'

import classroom from './classroom'
import consts from './consts'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      classroom,
      consts
    }
  })

  return Store
}

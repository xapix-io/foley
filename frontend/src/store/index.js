import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    axios: undefined,
    playgrounds: []
  },
  mutations: {
    removePlayground (state, id) {
      const remainingPlaygrounds = state.playgrounds.filter(({ _id }) => _id !== id)
      state.playgrounds = remainingPlaygrounds
    },
    setAxios (state, axiosInstance) {
      state.axios = axiosInstance
    },
    setPlaygrounds (state, playgrounds) {
      state.playgrounds = playgrounds
    }
  }
})

<template>
  <div
    class="playground-list"
    v-if="playgrounds">
    <header class="m-3">
      <h5 class="mb-0">Playgrounds</h5>
      <small>Recent Activity</small>
    </header>
    <div class="list-group m-3">
      <router-link
        :to="{ name: 'New' }"
        class="list-group-item card-background d-flex justify-content-center align-items-center add-playground-button cursor-pointer">
        <font-awesome-icon icon="plus" />
        <div class="font-weight-bold ml-2">Add Playground</div>
      </router-link>
      <ListElement
        v-bind="playground"
        v-for="playground in playgrounds"
        :key="playground._id" />
      <div
        v-if="!playgrounds.length"
        class="list-group-item alert alert-light bg-dark text-center">
        <p class="mb-0">No playground in the database. 🙆🏼‍♀️</p>
      </div>
    </div>
  </div>
</template>

<script>
import ListElement from '@/components/ListElement.vue'

export default {
  name: 'Index',
  components: {
    ListElement
  },
  mounted () {
    this.getPlaygrounds()
  },
  methods: {
    getPlaygrounds () {
      this.$store.state.axios.get('/playgrounds').then(({ data }) => {
        this.$store.commit('setPlaygrounds', data)
      })
    }
  },
  computed: {
    playgrounds () {
      return this.$store.state.playgrounds
    }
  }
}
</script>

<style lang="sass">
.add-playground-button
  opacity: .6
  &:hover
    opacity: 1
</style>

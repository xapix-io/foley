<template>
  <div
    class="playground-list"
    v-if="playgrounds">
    <div class="m-3 loading-animation">
      <h3 class="mb-1">Playgrounds</h3>
      <h6>Recent Activity</h6>
    </div>
    <div class="list-group">
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
        class="list-group-item card-background alert alert-light text-center">
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

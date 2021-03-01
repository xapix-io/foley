<template>
  <div class="detail">
    <div class="m-3 loading-animation">
      <router-link
        class="d-flex align-items-center"
        :to="{ name: 'Index' }">
        <font-awesome-icon icon="angle-left" />
        <h6 class="mb-0 ml-1">Back to Index</h6>
      </router-link>
      Playground
    </div>
    <div class="card card-background loading-animation">
      <div class="card-body">
        <div class="row">
          <div class="col">
            playground data
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Detail',
  computed: {
    playgrounds () {
      return this.$store.state.playgrounds
    },
    selectedPlayground () {
      return this.playgrounds.find(({ _id }) => _id === +(this.$route.params || {}).playgroundId) || {}
    },
    readableLastContact () {
      return ''
    },
    readableBirthday () {
      return ''
    }
  }
}
</script>

<style lang="sass">
$border-radius: 1rem

a
  color: black !important

.card
  border-radius: $border-radius !important
</style>

<template>
  <div class="list-group-item card-background loading-animation">
    <div class="row align-items-center">
      <div class="col-1">
        <div class="badge badge-secondary mx-1">
          {{ name.last[0] }}
        </div>
        <div class="badge badge-primary mx-1">
          {{ name.first[0] }}
        </div>
      </div>
      <div class="col">
        {{ gender === 'm' ? 'Mr.' : 'Ms.' }}
        {{ name.first }}
        {{ name.last }}
      </div>
      <div class="col d-flex align-items-center justify-content-end">
        <span title="Playground Lifetime Value">CLV</span>
        <div class="badge badge-success ml-2 mr-3">
          <!-- asuming USD -->
          $ {{ playgroundLifetimeValue }}
        </div>
        <router-link
          :to="{ name: 'Edit', params: { playgroundId: _id } }"
          class="mr-2 btn btn-outline-secondary btn-sm"><font-awesome-icon icon="search" /> Inspect</router-link>
        <button
          class="btn btn-outline-danger btn-sm"
          @click="deletePlayground">
          <font-awesome-icon icon="trash" />
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListElement',
  props: {
    _id: Number,
    name: {
      type: Object,
      default: () => ({
        first: '',
        last: ''
      })
    },
    birthday: String,
    gender: String,
    lastContact: String,
    playgroundLifetimeValue: Number
  },
  methods: {
    deletePlayground () {
      if (window.confirm('Are you sure you want to delete this playground?')) {
        this.$store.state.axios.delete(`/playgrounds/${this._id}`).then(() => {
          this.$store.commit('removePlayground', this._id)
        })
      }
    }
  }
}
</script>

<style lang="sass">

// eslint-disable-next-line max-len
$border-radius: 1rem

.btn
  border-radius: $border-radius !important
  &.btn-outline-secondary
    &:hover
      color: white !important

.list-group-item
  // yeah, we're a bit lazy here
  transition: all .2s ease-out
  &:first-child
    border-radius: $border-radius $border-radius 0 0 !important
  &:last-child
    border-radius: 0 0 $border-radius $border-radius !important

</style>

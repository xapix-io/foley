<template>
  <div v-if="loadingDone">
    <router-view />
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data () {
    return {
      loadingDone: false
    }
  },
  mounted () {
    this.init()
    // vue 3 will save us from that
  },
  methods: {
    init () {
      const axiosInstance = axios.create({
        baseURL: 'http://localhost:3000/api',
        timeout: 3000
      })

      this.$store.commit('setAxios', axiosInstance)
      this.loadingDone = true
    }
  }
}
</script>

<style lang="sass">

@keyframes hidden
  from, to
    opacity: 0

@keyframes fadeInBack
  from
    transform: scale(.98) rotateX(-10deg) translateZ(-20px)
    opacity: 0
  to
    transform: translateY(0)
    opacity: 1

@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500&display=swap');

$white: rgba(255, 255, 255, 1)
$box-shadow-sketch: 0 1px 1px rgba(0, 0, 0, .04), 0 4px 5px rgba(0, 0, 0, .02), 0 7px 9px rgba(0, 0, 0, .04)
$box-shadow-outline-white: 0 0 0 3px rgba(255, 255, 255, .3)
$box-shadow-card: $box-shadow-outline-white, $box-shadow-sketch, 0 25px 30px -15px rgba(0, 0, 0, .08), 0 15px 18px -30px rgba(0, 0, 0, .04)
$loading-animation-duration: .4s

.alert
  &.alert-dark-bg
    background-color: rgba(20, 20, 20, 1)
    color: rgba(100, 100, 100, 1)
    border-color: rgba(35, 35, 35, 1)
    border-radius: 15px

=onload-fadeIn($position, $duration)
  $delay: calc(#{$position} * (#{$duration} / 2))
  animation: hidden $delay, fadeInBack calc(#{$duration} * 2)
  animation-delay: 0s, $delay

header
  position: absolute
  left: 0
  right: 0
  top: 0
  z-index: 1000
  background-color: rgba(25, 25, 25, 1)
  color: $white
  a
    color: $white !important

body
  background-color: #1e1e1e !important

  *
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
    font-weight: 400

h6
  font-weight: 300

.cursor-pointer
  cursor: pointer

.loading-animation
  @for $i from 1 through 30
    &:nth-child(#{$i})
      +onload-fadeIn(calc(#{$i} - 1), $loading-animation-duration)

</style>

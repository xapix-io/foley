<template>
  <div>
    <header class="px-3 py-2">
      <h6 class="mb-0">Playground (<router-link :to="{ name: 'Index' }">Show all</router-link>)</h6>
      <small>Test and try out Axel-F formulas</small>
    </header>
    <div class="grid-layout">
      <section class="grid-data-sample px-3">
        <h6>Data Sample (JSON)</h6>
        <MonacoEditor
          class="editor"
          v-model="localPlayground.sample"
          theme="vs-dark"
          language="json"
          :options="monacoOptions"
        />
      </section>
      <section class="grid-formula px-3">
        <h6>Formula</h6>
        <MonacoEditor
          class="editor"
          v-model="localPlayground.formula"
          theme="vs-dark"
          language="text"
          :options="monacoOptions"
        />
      </section>
      <section class="grid-result p-3">
        <h6>Returns</h6>
        <div class="alert alert-dark-bg" v-if="error.message">
          <h6 class="mb-1">{{ error.message }}</h6>
          <samp><small>{{ error.data }}</small></samp>
        </div>
        <pre>{{ localPlayground.result }}</pre>
      </section>
    </div>
    <!-- <button class="btn btn-success m-3" @click="savePlayground">Save</button> -->
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco'
import { compile } from 'axel-f'

export default {
  name: 'Detail',
  components: {
    MonacoEditor
  },
  data () {
    return {
      localPlayground: {
        sample: '',
        formula: '',
        result: {}
      },
      monacoOptions: {
        quickSuggestions: false,
        snippetSuggestions: 'none',
        wordBasedSuggestions: false,
        scrollbar: {
          vertical: 'hidden',
          verticalScrollbarSize: 0,
          useShadows: false
        },
        minimap: {
          enabled: false
        }
      },
      error: {}
    }
  },
  watch: {
    'localPlayground.formula': {
      handler (formula) {
        let playgroundSample
        try {
          playgroundSample = JSON.parse(this.localPlayground.sample || '{}')
          this.error = {}
          this.localPlayground.result = this.compileAndExecuteFormula(formula, playgroundSample)
        } catch (error) {
          this.error = error
        }
      }
    }
  },
  computed: {
    playgrounds () {
      return this.$store.state.playgrounds
    }
  },
  methods: {
    compileAndExecuteFormula (formula, context) {
      let compiled
      try {
        compiled = compile(formula)(context)
      } catch (error) {
        this.error = JSON.parse(error.message)
      }
      return compiled
    },
    savePlayground () {
      this.$store.state.axios.post('/playgrounds', this.localPlayground).then(() => {
        this.$router.push({
          name: 'Edit'
        })
      })
    }
  }
}
</script>

<style lang="sass">
$border-radius: 1rem
$full-editor-height: calc(100vh - 12 * 1em)
$border-color: rgba(38, 38, 38, 1)

.grid-layout
  z-index: 200
  position: absolute
  top: 0
  bottom: 0
  left: 0
  right: 0
  display: grid
  grid-template-areas: "data-sample formula" "data-sample result"
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr 1fr
  .grid-data-sample, .grid-formula
    padding-top: 80px
  .grid-data-sample
    border-right: 1px solid $border-color
    grid-area: data-sample
    .editor
      height: $full-editor-height
  .grid-formula
    border-bottom: 1px solid $border-color
    grid-area: formula
    .editor
      height: calc(#{$full-editor-height} / 2)
  .grid-result
    grid-area: result
    background-color: rgba(27, 27, 27, 1)
    pre
      color: #8CA06E
  section
    & > h6
      color: #aaa !important

.card
  border-radius: $border-radius !important

.editor
  height: 200px
  .suggest-widget
    display: none !important

</style>

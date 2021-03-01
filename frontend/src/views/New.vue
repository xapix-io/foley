<template>
  <div>
    <header class="p-3 d-flex align-items-center justify-content-between">
      <div class="left">
        <h6 class="mb-0">Editor</h6>
        <small>Test and try out Axel-F formulas</small>
      </div>
      <div class="right">
        <router-link :to="{ name: 'Index' }">Show all</router-link>
      </div>
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
      <section class="grid-result px-3">
        <h6>Returns</h6>
        <div class="alert alert-light bg-dark" v-if="error.message">
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
        wordBasedSuggestions: false
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

.grid-layout
  display: grid
  grid-template-areas: "data-sample formula" "data-sample result"
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr 1fr
  .grid-data-sample
    grid-area: data-sample
    .editor
      height: $full-editor-height
  .grid-formula
    grid-area: formula
    .editor
      height: calc(#{$full-editor-height} / 2)
  .grid-result
    grid-area: result
    pre
      color: white
  section
    & > h6
      color: #aaa !important

a
  color: black !important

.card
  border-radius: $border-radius !important

.editor
  height: 200px
  .suggest-widget
    display: none !important

</style>

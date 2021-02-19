<template>
  <div class="detail">
    <div class="loading-animation">
      <router-link
        class="d-flex align-items-center"
        :to="{ name: 'Index' }">
        <h6>Show all Playgrounds</h6>
      </router-link>
    </div>
    <h2>Data Sample</h2>
    <div class="card card-background loading-animation">
      <div class="card-body">
        <MonacoEditor
          class="editor"
          v-model="localPlayground.sample"
          language="json"
          :options="monacoOptions"
        />
      </div>
    </div>
    <h2 class="mt-4">Formula</h2>
    <div class="card card-background loading-animation">
      <div class="card-body">
        <MonacoEditor
          class="editor"
          v-model="localPlayground.formula"
          language="text"
          :options="monacoOptions"
        />
        <div class="alert alert-warning" v-if="error.message">
          <h6>{{ error.message }}</h6>
          <samp>{{ error.data }}</samp>
        </div>
      </div>
    </div>
    <template v-if="!error.message && !!localPlayground.formula">
      <h2 class="mt-4">Result</h2>
      <div class="card card-background loading-animation">
        <div class="card-body">
          <pre>
            {{ localPlayground.result }}
          </pre>
        </div>
      </div>
      <button class="btn btn-success mt-3" @click="savePlayground">Save</button>
    </template>
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
        this.error = error
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

a
  color: black !important

.card
  border-radius: $border-radius !important

.editor
  height: 200px
</style>

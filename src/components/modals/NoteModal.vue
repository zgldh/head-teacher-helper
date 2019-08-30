<template>
  <q-modal class="note-modal" v-model="show" :position="position" transition>
    <q-modal-layout footer-style="text-align:center;">
      <q-toolbar slot="header" color="info">
        <q-toolbar-title>
          <q-icon name="info"/>
          提示
        </q-toolbar-title>
      </q-toolbar>

      <div class="layout-padding">
        <slot></slot>
      </div>

      <q-toolbar slot="footer" color="white">
        <q-toolbar-title>
          <q-btn
            color="primary"
            @click="show = false"
            label="知道了"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<script>

export default {
  name: 'NoteModal',
  components: {},
  props: {
    position: {
      type: String,
      default: 'top'
    }
  },
  data () {
    return {
      show: false
    }
  },
  created () {
  },
  methods: {
    open () {
      this.show = true
    },
    close () {
      this.show = false
    }
  }
}
</script>

<style>
  .note-modal {
  }
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: false // this.$q.platform.is.desktop
    }
  },
  methods: {
    openURL,
    createClass: () => {
      return ''
    }
  }
}
</script>

<style>
</style>

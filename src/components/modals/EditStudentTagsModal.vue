<template>
  <q-modal class="edit-student-tags-modal" v-model="show" transition @show="onShow">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn
          flat
          round
          dense
          v-close-overlay
          icon="close"
        />
        <q-toolbar-title v-if="selectedStudent">
          编辑 {{selectedStudent.name}} 的标签
        </q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <q-field icon="local_offer" helper="输入一个标签然后回车" :count="10">
          <q-chips-input v-model="tags"/>
        </q-field>
      </div>
      <q-toolbar slot="footer" class="bg-white" style="text-align: right;">
        <q-toolbar-title>
          <q-btn
            flat
            color="black"
            v-close-overlay
            label="取消"
          />
          <q-btn
            color="primary"
            label="保存"
            @click="save"
          />
        </q-toolbar-title>
      </q-toolbar>

    </q-modal-layout>
  </q-modal>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'EditStudentTagsModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      tags: []
    }
  },
  computed: {
    ...mapState({
      // ...
      selectedStudent: state => state.classroom.selectedStudent
    })
  },
  created () {
  },
  methods: {
    open () {
      this.show = true
      this.tags = JSON.parse(JSON.stringify(this.$store.state.classroom.selectedStudent.tags))
    },
    close () {
      this.show = false
    },
    onShow () {
    },
    async save () {
      await this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'tags', value: this.tags })
      this.show = false
    }
  }
}
</script>

<style>
  .edit-student-tags-modal {
  }
</style>

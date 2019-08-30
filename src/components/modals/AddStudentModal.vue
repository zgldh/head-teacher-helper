<template>
  <q-modal class="add-student-modal" v-model="show" transition @show="onShow">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn
          flat
          round
          dense
          v-close-overlay
          icon="close"
        />
        <q-toolbar-title>
          录入学生
        </q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <q-input
          v-model="student"
          type="text"
          :float-label="floatLabel"
          @keydown.enter="onKeyEnterDown"
          ref="autoFocus"
        />
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

export default {
  name: 'AddStudentModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      student: '',
      rowIndex: null,
      colIndex: null
    }
  },
  computed: {
    floatLabel () {
      return `请输入学生名字`
    }
  },
  created () {
  },
  methods: {
    open ({ rowIndex, colIndex }) {
      this.student = ''
      this.rowIndex = rowIndex
      this.colIndex = colIndex
      this.show = true
    },
    close () {
      this.show = false
    },
    onShow () {
      this.$nextTick(() => this.$refs.autoFocus.focus())
    },
    onKeyEnterDown () {
      this.save()
    },
    save () {
      this.show = false
      let studentString = this.student.trim()
      if (studentString) {
        this.$store.dispatch('classroom/addStudent', {
          student: studentString,
          rowIndex: this.rowIndex,
          colIndex: this.colIndex
        })
      }
    }
  }
}
</script>

<style>
  .add-student-modal {
  }
</style>

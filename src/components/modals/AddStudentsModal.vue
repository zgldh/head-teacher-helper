<template>
  <q-modal class="add-students-modal" v-model="show" transition @show="onShow">
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
        <q-field helper="待录入的首个学号，后续的学号会在这基础上自增1。">
          <q-input
            clearable
            v-model="initialStudentNumber"
            type="number"
            float-label="起始学号"
          />
        </q-field>
        <q-field :helper="helperText">
          <q-input
            v-model="studentsModel"
            type="textarea"
            float-label="待录入的学生"
            @blur="studentsModel=studentsModel"
            @keydown.enter="onKeyEnterDown"
            ref="autoFocus"
          />
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
            :disable="originalRemainingCount < currentCount"
            @click="save"
          />
        </q-toolbar-title>
      </q-toolbar>

    </q-modal-layout>
  </q-modal>
</template>

<script>

export default {
  name: 'AddStudentsModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      students: '',
      initialStudentNumber: null,
      originalRemainingCount: 0
    }
  },
  computed: {
    helperText () {
      return `一行一个学生，一共 ${this.currentCount} 个。您还可以录入 ${this.remainingCount} 个`
    },
    remainingCount () {
      return this.originalRemainingCount - this.currentCount
    },
    currentCount () {
      return this.students.trim().split('\n').filter(item => item.trim()).length
    },
    studentsModel: {
      get () {
        return this.students
      },
      set (newValue) {
        this.normalizeStudents(newValue)
      }
    }
  },
  created () {
  },
  methods: {
    open (remainingCount) {
      this.students = ''
      this.originalRemainingCount = remainingCount
      this.initialStudentNumber = this.$store.getters['classroom/nextStudentNumber']()
      this.show = true
    },
    close () {
      this.show = false
    },
    onShow () {
      this.$nextTick(() => this.$refs.autoFocus.focus())
    },
    save () {
      this.show = false
      let studentString = this.students.trim()
      if (studentString) {
        this.$store.dispatch('classroom/addStudents', {
          students: studentString.split('\n'),
          initialStudentNumber: this.initialStudentNumber
        }).then(result => {
          return this.$store.dispatch('classroom/reloadClassroom')
        })
      }
    },
    onKeyEnterDown (e) {
      if (!this.remainingCount) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      } else {
        this.normalizeStudents(this.students)
      }
    },
    normalizeStudents (inputValue) {
      this.students = inputValue.trim().split('\n').filter(item => item.trim()).join('\n')
    }
  }
}
</script>

<style>
  .add-students-modal {
  }

  .add-students-modal textarea.q-input-area {
    overflow-y: auto !important;
    max-height: 200px;
  }
</style>

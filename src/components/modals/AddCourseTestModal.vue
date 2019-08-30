<template>
  <q-modal class="add-course-test-modal" v-model="show" transition @show="onShow">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn
          flat
          round
          dense
          v-close-overlay
          icon="close"
        />
        <q-toolbar-title>{{courseTitle}}</q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <q-field helper="如：5年上期期末考试">
          <q-input
            v-model="testName"
            type="text"
            float-label="请输入考试名字"
            ref="autoFocus"
          />
        </q-field>
        <q-field>
          <q-datetime v-model="date" type="date" float-label="考试日期" />
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
            :disabled="!testName"
          />
        </q-toolbar-title>
      </q-toolbar>

    </q-modal-layout>
  </q-modal>
</template>

<script>

export default {
  name: 'AddCourseTestModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      course: null,
      courseTitle: '',
      testName: null,
      date: null,
      promise: null,
      resolve: null,
      reject: null
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    open (course, dialogTitle, name = null, date = new Date()) {
      this.courseTitle = dialogTitle
      this.course = course
      this.testName = name
      this.date = date
      this.show = true
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
      return this.promise
    },
    close () {
      this.show = false
      this.reject()
    },
    onShow () {
      this.$nextTick(() => this.$refs.autoFocus.focus())
    },
    onKeyEnterDown () {
      this.save()
    },
    save () {
      this.show = false
      let testName = this.testName.trim()
      if (testName) {
        this.resolve({
          course: this.course,
          name: testName,
          date: this.date
        })
      }
    }
  }
}
</script>

<style>
  .add-course-test-modal {
  }
</style>

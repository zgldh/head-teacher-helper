<template>
  <q-modal class="add-active-modal" v-model="show" transition @show="onShow">
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
        <q-field helper="如：2019夏季运动会">
          <q-input
            v-model="activeName"
            type="text"
            float-label="请输入活动名字"
            ref="autoFocus"
          />
        </q-field>
        <q-field>
          <q-datetime v-model="date" type="date" float-label="日期" />
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
            :disabled="!activeName"
          />
        </q-toolbar-title>
      </q-toolbar>

    </q-modal-layout>
  </q-modal>
</template>

<script>

export default {
  name: 'AddActiveModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      course: null,
      courseTitle: '',
      activeName: null,
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
      this.activeName = name
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
      let activeName = this.activeName.trim()
      if (activeName) {
        this.resolve({
          course: this.course,
          name: activeName,
          date: this.date
        })
      }
    }
  }
}
</script>

<style>
  .add-active-modal {
  }
</style>

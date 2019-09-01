<template>
  <q-modal class="add-activity-modal" v-model="show" transition @show="onShow">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn
          flat
          round
          dense
          v-close-overlay
          icon="close"
        />
        <q-toolbar-title>{{dialogTitle}}</q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <q-field helper="如：2019夏季运动会">
          <q-input
            v-model="activityName"
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
            :disabled="!activityName"
          />
        </q-toolbar-title>
      </q-toolbar>

    </q-modal-layout>
  </q-modal>
</template>

<script>

export default {
  name: 'AddActivityModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      dialogTitle: '',
      activityName: null,
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
    open (dialogTitle, name = null, date = new Date()) {
      this.dialogTitle = dialogTitle
      this.activityName = name
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
      let activityName = this.activityName.trim()
      if (activityName) {
        this.resolve({
          name: activityName,
          date: this.date
        })
      }
    }
  }
}
</script>

<style>
  .add-activity-modal {
  }
</style>

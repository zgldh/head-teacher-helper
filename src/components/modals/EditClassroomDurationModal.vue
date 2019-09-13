<template>
  <q-modal class="edit-classroom-duration-modal" v-model="show" transition @show="onShow">
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
          编辑学年时间
        </q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">

        <q-field icon="star" >
          <q-datetime v-model="beginDate" type="date" hide-underline modal :max="graduateDate"
                      :default-view="beginDate?'day':'year'" float-label="入学日期"/>
        </q-field>
        <q-field icon="school">
          <q-datetime v-model="graduateDate" type="date" hide-underline modal :min="beginDate"
                      :default-view="graduateDate?'day':'year'" float-label="毕业日期"/>
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
export default {
  name: 'EditClassroomDurationModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      innerBeginDate: null,
      innerGraduateDate: null
    }
  },
  computed: {
    beginDate: {
      get () {
        return this.innerBeginDate
      },
      set (value) {
        this.innerBeginDate = value.substr(0, 10)
      }
    },
    graduateDate: {
      get () {
        return this.innerGraduateDate
      },
      set (value) {
        this.innerGraduateDate = value.substr(0, 10)
      }
    }
  },
  created () {
  },
  methods: {
    open () {
      this.show = true
      this.innerBeginDate = JSON.parse(JSON.stringify(this.$store.state.classroom.currentClassroom.beginDate))
      this.innerGraduateDate = JSON.parse(JSON.stringify(this.$store.state.classroom.currentClassroom.graduateDate))
    },
    close () {
      this.show = false
    },
    onShow () {
    },
    async save () {
      await this.$store.dispatch('classroom/setCurrentClassroomProperty', { property: 'beginDate', value: this.beginDate })
      await this.$store.dispatch('classroom/setCurrentClassroomProperty', { property: 'graduateDate', value: this.graduateDate })
      this.show = false
    }
  }
}
</script>

<style>
  .edit-classroom-duration-modal {
  }
</style>

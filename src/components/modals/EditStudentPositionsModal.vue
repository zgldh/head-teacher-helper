<template>
  <q-modal class="edit-student-positions-modal" v-model="show" transition @show="onShow">
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
          编辑 {{selectedStudent.name}} 的岗位
        </q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <q-field icon="supervisor_account">
          <q-select
            multiple
            chips
            clearable
            hide-underline
            placeholder="请点击选择岗位"
            v-model="positions"
            :options="classroomPositions"
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
  name: 'EditStudentPositionsModal',
  components: {},
  props: {},
  data () {
    return {
      show: false,
      positions: []
    }
  },
  computed: {
    ...mapState({
      // ...
      selectedStudent: state => state.classroom.selectedStudent,
      classroomPositions: state => {
        return state.classroom.currentClassroom.positions || []
      }
    })
  },
  created () {
  },
  methods: {
    open () {
      this.show = true
      this.positions = JSON.parse(JSON.stringify(this.$store.state.classroom.selectedStudent.positions))
    },
    close () {
      this.show = false
    },
    onShow () {
    },
    async save () {
      await this.$store.dispatch('classroom/setSelectedStudentProperty', {
        property: 'positions',
        value: this.positions
      })
      this.show = false
    }
  }
}
</script>

<style>
  .edit-student-positions-modal {
  }
</style>
